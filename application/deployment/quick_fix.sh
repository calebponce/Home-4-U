#!/bin/bash

# Home4U Quick Fix Script
# Run this on your EC2 instance to fix nginx and restart services

set -e

echo "=== Home4U Quick Fix Script ==="

# Navigate to project directory (adjust if needed)
cd /var/www/home4u/application 2>/dev/null || cd ~/application 2>/dev/null || cd /home/ubuntu/application 2>/dev/null || {
    echo "ERROR: Could not find project directory. Please navigate to your project first."
    exit 1
}

echo "Project directory: $(pwd)"

# Step 1: Check if backend is running
echo ""
echo "[1/5] Checking backend status..."
if pgrep -f "uvicorn.*main:app" > /dev/null; then
    echo "Backend is already running"
else
    echo "Starting backend..."
    cd backend
    source .venv/bin/activate
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    cd ..
    sleep 2
    echo "Backend started"
fi

# Step 2: Test backend directly
echo ""
echo "[2/5] Testing backend..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "Backend is responding at http://localhost:8000"
else
    echo "ERROR: Backend is not responding"
    cat /tmp/backend.log
    exit 1
fi

# Step 3: Test API endpoint
echo ""
echo "[3/5] Testing API endpoint..."
if curl -s http://localhost:8000/api/v1/health/ > /dev/null; then
    echo "API is accessible"
else
    echo "Warning: API health check failed, but continuing..."
fi

# Step 4: Update nginx configuration
echo ""
echo "[4/5] Updating nginx configuration..."

# Check if nginx config exists
if [ -f /etc/nginx/sites-available/home4u ]; then
    echo "Updating existing nginx config..."
else
    echo "Creating new nginx config..."
    touch /etc/nginx/sites-available/home4u
fi

# Write nginx config
cat > /etc/nginx/sites-available/home4u << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend static files
    root /var/www/home4u/frontend/dist;
    index index.html;

    # Serve static files (React app)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/home4u /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
echo "Nginx restarted"

# Step 5: Test the full flow
echo ""
echo "[5/5] Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=test@example.com&password=test123")

echo "Login response: $LOGIN_RESPONSE"

echo ""
echo "=== Fix Complete! ==="
echo ""
echo "Try accessing your site at: http://18.225.117.117"
echo ""
echo "If login still fails, run this command to check logs:"
echo "  curl http://localhost:8000/api/v1/auth/login -v"

