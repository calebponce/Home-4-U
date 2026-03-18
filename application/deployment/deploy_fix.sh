#!/usr/bin/env bash
###############################################################################
# deploy_fix.sh — Home4U Self-Healing Deployment Script
#
# Run this ON the EC2 instance:
#   cd ~/csc648-848-project-sp26-vibecoding-for-internship
#   bash application/deployment/deploy_fix.sh
#
# What it does:
#   1. Pulls the latest code
#   2. Clears port 8000 of any zombie process
#   3. Ensures the out-of-repo data directory and DB exist
#   4. Disables the default Nginx site and deploys our config
#   5. Installs Python deps and restarts the backend systemd service
#   6. Runs a health-check gate — fails loudly if the backend is down
#   7. Runs smoke-test curl commands
###############################################################################
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/application/backend"
DEPLOY_DIR="$REPO_ROOT/application/deployment"
DATA_DIR="/home/ec2-user/data"
DB_FILE="$DATA_DIR/home4u.db"

echo "============================================"
echo "  Home4U Deploy — $(date)"
echo "============================================"

# ── Step 1: Pull latest code ────────────────────────────────────────
echo ""
echo "▶ Step 1: Pulling latest code..."
cd "$REPO_ROOT"
git pull origin master || git pull origin main || echo "⚠  git pull skipped — continuing with local files"

# ── Step 2: Port clearance ──────────────────────────────────────────
echo ""
echo "▶ Step 2: Clearing port 8000..."
sudo fuser -k 8000/tcp 2>/dev/null || true
sleep 1
echo "  ✓ Port 8000 cleared"

# ── Step 3: Database persistence ────────────────────────────────────
echo ""
echo "▶ Step 3: Verifying database..."
mkdir -p "$DATA_DIR"

if [ -f "$DB_FILE" ]; then
  echo "  ✓ Database exists at $DB_FILE ($(du -h "$DB_FILE" | cut -f1))"
else
  echo "  ⚠  Database not found at $DB_FILE"
  echo "     Tables will be auto-created by init_db() on startup."

  # If an old DB exists inside the repo, migrate it out
  OLD_DB="$BACKEND_DIR/home4u.db"
  if [ -f "$OLD_DB" ]; then
    echo "  📦 Migrating old DB from repo → $DB_FILE"
    cp "$OLD_DB" "$DB_FILE"
    echo "  ✓ Old database migrated"
  fi
fi

# ── Step 4: Nginx config ───────────────────────────────────────────
echo ""
echo "▶ Step 4: Deploying Nginx config..."

# Remove the default Nginx site to avoid conflicts
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
echo "  ✓ Default Nginx site disabled"

# Deploy our config — try conf.d first (Amazon Linux), then sites-available (Ubuntu)
if [ -d "/etc/nginx/conf.d" ]; then
  sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/conf.d/home4u.conf
  echo "  ✓ Copied to /etc/nginx/conf.d/home4u.conf"
elif [ -d "/etc/nginx/sites-available" ]; then
  sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/home4u
  sudo ln -sf /etc/nginx/sites-available/home4u /etc/nginx/sites-enabled/home4u
  echo "  ✓ Copied to sites-available and symlinked to sites-enabled"
else
  echo "  ⚠  Could not find nginx config directory — copying to /etc/nginx/nginx.conf"
  sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/nginx.conf
fi

# Validate and reload Nginx
sudo nginx -t
echo "  ✓ Nginx config is valid"
sudo systemctl reload nginx || sudo systemctl restart nginx
echo "  ✓ Nginx reloaded"

# ── Step 5: Backend service ─────────────────────────────────────────
echo ""
echo "▶ Step 5: Setting up backend..."
cd "$BACKEND_DIR"

# Ensure virtual environment exists
if [ ! -d ".venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv .venv
fi

# Install/update dependencies
echo "  Installing Python dependencies..."
.venv/bin/pip install -q -r requirements.txt

# Deploy systemd service and restart
echo "  Deploying systemd service..."
sudo cp "$DEPLOY_DIR/home4u-backend.service" /etc/systemd/system/home4u-backend.service
sudo systemctl daemon-reload
sudo systemctl enable home4u-backend
sudo systemctl restart home4u-backend
echo "  ✓ Backend service restarted"

# Give the service time to start
sleep 4

# ── Step 6: Health-check gate ───────────────────────────────────────
echo ""
echo "▶ Step 6: Health-check gate..."

HEALTH_RESPONSE=$(curl -sf http://127.0.0.1:8000/health 2>/dev/null || echo "FAIL")

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  echo "  ✓ Backend is HEALTHY: $HEALTH_RESPONSE"
else
  echo ""
  echo "  ╔══════════════════════════════════════════════╗"
  echo "  ║  ✗ HEALTH CHECK FAILED                      ║"
  echo "  ║  Backend did not return {\"status\": \"ok\"}      ║"
  echo "  ║  Response: $HEALTH_RESPONSE"
  echo "  ╚══════════════════════════════════════════════╝"
  echo ""
  echo "  Last 30 lines of backend logs:"
  sudo journalctl -u home4u-backend -n 30 --no-pager
  exit 1
fi

# ── Step 7: Smoke tests ────────────────────────────────────────────
echo ""
echo "▶ Step 7: Smoke tests..."

echo ""
echo "  [1/4] Nginx health (/health):"
curl -s http://localhost/health && echo "" || echo "  ✗ FAILED"

echo "  [2/4] Nginx API proxy (/api/docs):"
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/docs)
echo "  HTTP $DOCS_STATUS"

echo "  [3/4] Registration (/api/auth/signup):"
curl -s -X POST http://localhost/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoketest@home4u.dev","password":"SmokeTest123!"}' && echo "" || echo "  ✗ FAILED"

echo "  [4/4] Login (/api/auth/login):"
curl -s -X POST http://localhost/api/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=smoketest@home4u.dev&password=SmokeTest123!' && echo "" || echo "  ✗ FAILED"

# ── Done ────────────────────────────────────────────────────────────
PUBLIC_DNS=$(curl -sf http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || echo '<your-ec2-public-dns>')
echo ""
echo "============================================"
echo "  ✓ Deploy complete!"
echo "  DB location: $DB_FILE"
echo "  Open http://$PUBLIC_DNS in a browser."
echo "============================================"
