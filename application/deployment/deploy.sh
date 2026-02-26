#!/bin/bash

# Home4U AWS Deployment Setup Script
# Run this on your EC2 instance as sudo

set -e

echo "=== Home4U Deployment Script ==="

# Update and install dependencies
echo "[1/8] Updating system..."
apt-get update && apt-get upgrade -y

# Install Python and pip (if not installed)
echo "[2/8] Installing Python dependencies..."
apt-get install -y python3 python3-pip python3-venv

# Install Node.js (for building frontend)
echo "[3/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Navigate to app directory (adjust path as needed)
cd /home/ubuntu/home4u || cd /var/www/home4u || cd ~

# Set up Python virtual environment for backend
echo "[4/8] Setting up Python virtual environment..."
cd application/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run seed script to create database and test users
echo "[5/8] Seeding database..."
python seed.py
deactivate

# Build frontend
echo "[6/8] Building frontend..."
cd ../frontend
npm install
npm run build

# Create nginx configuration
echo "[7/8] Configuring nginx..."
cat > /tmp/home4u_nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend static files (from build folder)
    root /var/www/home4u/frontend/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend (uvicorn)
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

# Copy nginx config
cp /tmp/home4u_nginx.conf /etc/nginx/sites-available/home4u
ln -sf /etc/nginx/sites-available/home4u /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Create systemd service for backend
echo "[8/8] Creating systemd service for backend..."
cat > /etc/systemd/system/home4u-backend.service << 'EOF'
[Unit]
Description=Home4U Backend API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/home4u/application/backend
Environment="PATH=/var/www/home4u/application/backend/.venv/bin"
ExecStart=/var/www/home4u/application/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start backend service
systemctl daemon-reload
systemctl enable home4u-backend
systemctl start home4u-backend
systemctl status home4u-backend

echo "=== Deployment Complete! ==="
echo "Frontend should be available at http://your-server-ip"
echo "API should be at http://your-server-ip/api/v1"
echo ""
echo "Test users:"
echo "  - test@example.com / test123"
echo "  - demo@home4u.com / demo123"

