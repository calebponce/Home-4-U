#!/usr/bin/env bash
###############################################################################
# deploy_fix.sh — Home4U EC2 Recovery Script
#
# Run this ON the EC2 instance after SSH-ing in:
#   cd ~/csc648-848-project-sp26-vibecoding-for-internship
#   bash application/deployment/deploy_fix.sh
#
# What it does:
#   1. Pulls the latest code (including the fixed nginx.conf)
#   2. Deploys the new nginx config and reloads nginx
#   3. Re-installs Python dependencies and restarts the backend service
#   4. Verifies the backend is running
#   5. Runs smoke-test curl commands
###############################################################################
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/application/backend"
DEPLOY_DIR="$REPO_ROOT/application/deployment"

echo "============================================"
echo "  Home4U EC2 Recovery — $(date)"
echo "============================================"

# ── Step 1: Pull latest code ────────────────────────────────────────
echo ""
echo "▶ Step 1: Pulling latest code..."
cd "$REPO_ROOT"
git pull origin master || git pull origin main || echo "⚠  git pull failed — continuing with local files"

# ── Step 2: Deploy nginx config ────────────────────────────────────
echo ""
echo "▶ Step 2: Deploying nginx config..."
sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/conf.d/home4u.conf 2>/dev/null \
  || sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/home4u 2>/dev/null \
  || sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/nginx.conf

# Test nginx config before reloading
sudo nginx -t
echo "  ✓ Nginx config is valid"
sudo systemctl reload nginx || sudo systemctl restart nginx
echo "  ✓ Nginx reloaded"

# ── Step 3: Restart backend ────────────────────────────────────────
echo ""
echo "▶ Step 3: Setting up backend..."
cd "$BACKEND_DIR"

# Ensure virtual environment exists
if [ ! -d ".venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv .venv
fi

# Install/update dependencies
echo "  Installing Python dependencies..."
.venv/bin/pip install -q -r requirements.txt

# Copy systemd service file and reload
echo "  Deploying systemd service..."
sudo cp "$DEPLOY_DIR/home4u-backend.service" /etc/systemd/system/home4u-backend.service
sudo systemctl daemon-reload
sudo systemctl enable home4u-backend
sudo systemctl restart home4u-backend
echo "  ✓ Backend service restarted"

# Give the service a moment to start
sleep 3

# ── Step 4: Verify backend is running ──────────────────────────────
echo ""
echo "▶ Step 4: Checking backend status..."
if sudo systemctl is-active --quiet home4u-backend; then
  echo "  ✓ home4u-backend is RUNNING"
else
  echo "  ✗ home4u-backend FAILED to start. Showing logs:"
  sudo journalctl -u home4u-backend -n 30 --no-pager
  exit 1
fi

# ── Step 5: Smoke tests ───────────────────────────────────────────
echo ""
echo "▶ Step 5: Running smoke tests..."

# Direct backend health check
echo ""
echo "  [Test 1] Direct backend health (localhost:8000):"
curl -s http://127.0.0.1:8000/health || echo "  ✗ FAILED"

# Through nginx — health check
echo ""
echo ""
echo "  [Test 2] Nginx health (/health):"
curl -s http://localhost/health || echo "  ✗ FAILED"

# Through nginx — API prefix (what the frontend uses)
echo ""
echo ""
echo "  [Test 3] Nginx API docs (/api/docs):"
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/docs)
echo "  HTTP $DOCS_STATUS"

# Test registration
echo ""
echo "  [Test 4] Registration (/api/auth/signup):"
curl -s -X POST http://localhost/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoketest@home4u.dev","password":"SmokeTest123!"}' || echo "  ✗ FAILED"

# Test login
echo ""
echo ""
echo "  [Test 5] Login (/api/auth/login):"
curl -s -X POST http://localhost/api/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=smoketest@home4u.dev&password=SmokeTest123!' || echo "  ✗ FAILED"

echo ""
echo ""
echo "============================================"
echo "  Recovery complete!"
echo "  Open http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || echo '<your-ec2-public-dns>') in a browser."
echo "============================================"
