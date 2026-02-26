# Manual Fix Instructions for AWS Server

Since I cannot connect to your AWS server remotely, please follow these steps manually:

---

## Step 1: SSH into your server
```bash
ssh -i home4u-key.pem ec2-user@ec2-18-225-117-117.us-east-2.compute.amazonaws.com
```

---

## Step 2: Check if backend is running
```bash
ps aux | grep uvicorn
curl http://localhost:8000/
```

If not running, start it:
```bash
cd /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship/application/backend
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
```

---

## Step 3: Check if database is seeded
```bash
cd /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship/application/backend
sqlite3 home4u.db "SELECT * FROM users;"
```

If empty, run seed:
```bash
source .venv/bin/activate
python seed.py
```

---

## Step 4: Fix nginx configuration
```bash
sudo nano /etc/nginx/conf.d/home4u.conf
```

Replace the entire file content with:
```nginx
server {
    listen 80;
    server_name _;

    root /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship/application/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
    }
}
```

---

## Step 5: Restart nginx and test
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 6: Test login
```bash
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123"
```

Expected response should contain `"access_token"`

---

## If Frontend Build is Missing
If you get "404 Not Found" for the frontend:
```bash
cd /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship/application/frontend
npm install
npm run build
```
