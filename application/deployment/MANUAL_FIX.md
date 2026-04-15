# Manual Fix Instructions for AWS Server

Since I cannot connect to your AWS server remotely, please follow these steps manually.
Current DNS in these commands: `ec2-3-16-81-84.us-east-2.compute.amazonaws.com`.
Public app URL: `https://ec2-3-16-81-84.us-east-2.compute.amazonaws.com/`.
If your host changes after a restart, replace it with the current Public IPv4 DNS from AWS EC2.

---

## Step 1: SSH into your server
```bash
ssh -i home4u-key.pem ec2-user@ec2-3-16-81-84.us-east-2.compute.amazonaws.com
```

---

## Step 2: Check if backend is running
```bash
sudo systemctl status home4u-backend --no-pager
curl -s http://127.0.0.1:8000/health
```

If not running, start it:
```bash
sudo systemctl restart home4u-backend
sudo journalctl -u home4u-backend -n 80 --no-pager
```

---

## Step 3: Check if database is seeded
```bash
sqlite3 /home/ec2-user/data/home4u.db "SELECT id, email FROM users LIMIT 10;"
```

If empty, run seed:
```bash
cd /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship/application/backend
source .venv/bin/activate
HOME4U_ENV=production HOME4U_DATA_DIR=/home/ec2-user/data python seed.py
sudo systemctl restart home4u-backend
```

---

## Step 4: Fix nginx configuration
```bash
cd /home/ec2-user/csc648-848-project-sp26-vibecoding-for-internship
PUBLIC_DNS="$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)"
PUBLIC_IP="$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
SERVER_NAMES="$PUBLIC_DNS $PUBLIC_IP"

# Prevent `server_name _` conflicts with distro defaults.
if [ -f /etc/nginx/conf.d/default.conf ]; then
  sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled
fi

sed "s/__SERVER_NAMES__/$SERVER_NAMES/g" application/deployment/nginx.conf | \
  sudo tee /etc/nginx/conf.d/home4u.conf >/dev/null
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
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=calebmusic10@gmail.com&password=TempPass123!"
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
