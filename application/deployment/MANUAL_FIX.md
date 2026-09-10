# Home4U deployment recovery guide

This public guide intentionally uses placeholders. Keep hostnames, account identifiers, SSH keys, database paths, and credentials in private operations documentation.

## 1. Connect to the host

```bash
ssh -i /secure/path/to/key <ssh-user>@<host>
```

## 2. Configure production secrets

Create a root-owned environment file outside the repository:

```bash
sudo install -d -m 700 /etc/home4u
sudo install -m 600 /dev/null /etc/home4u/home4u.env
sudoedit /etc/home4u/home4u.env
```

At minimum, set a strong `HOME4U_SECRET_KEY`. Add `DATABASE_URL`, CORS origins, and persistent data/upload paths when the deployment requires them. Do not place real values in this repository.

## 3. Update and deploy

```bash
cd /path/to/Home-4-U
git fetch origin
git switch master
git pull --ff-only origin master
bash application/deployment/deploy_fix.sh
```

## 4. Validate services

```bash
sudo systemctl status home4u-backend --no-pager
sudo nginx -t
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1/health
```

The health check deliberately avoids user credentials. Register a disposable account through the application when an authenticated smoke test is required.

## 5. Validate the public endpoint

Before advertising a live demo, verify:

- DNS resolves to the intended host.
- The TLS certificate covers the published hostname and presents a valid full chain.
- HTTP redirects to HTTPS.
- `/health`, the frontend, `/api/*`, and `/uploads/*` use the intended proxy routes.
- No default or predictable user credentials exist.

## 6. Troubleshooting

```bash
sudo journalctl -u home4u-backend -n 120 --no-pager
sudo tail -n 120 /var/log/nginx/error.log
```

If a key, password, account identifier, or private host detail was previously committed, treat it as exposed and rotate or replace it before redeploying.
