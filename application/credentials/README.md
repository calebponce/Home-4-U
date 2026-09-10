# Credential handling

This directory intentionally contains **no live credentials, private keys, account identifiers, host addresses, or database access details**.

## Rules

- Store production secrets in the deployment platform's secret manager or in a root-owned environment file outside the repository.
- Never commit PEM files, API keys, passwords, JWT signing secrets, database URLs, cloud account IDs, instance IDs, or private host information.
- Treat any credential that reaches Git history as compromised and rotate it immediately.
- Limit SSH and database access to authorized operators and least-privilege network rules.
- Use separate development, demo, and production credentials.

## Backend environment variables

| Variable | Requirement |
|---|---|
| `HOME4U_SECRET_KEY` | Required in production; use a long random value |
| `DATABASE_URL` | Optional external relational database connection |
| `HOME4U_CORS_ORIGINS` | Explicit direct-backend origins, when needed |
| `HOME4U_DATA_DIR` | Persistent production data directory |
| `HOME4U_UPLOAD_DIR` | Persistent uploaded-image directory |
| `HOME4U_SEED_DEMO_EMAIL` | Optional demo-account email; set only with the password variable |
| `HOME4U_SEED_DEMO_PASSWORD` | Optional demo-account password; inject through secret storage |

The systemd unit can read these values from `/etc/home4u/home4u.env`. On a production host, keep that file owned by root with mode `600`:

```bash
sudo install -d -m 700 /etc/home4u
sudo install -m 600 /dev/null /etc/home4u/home4u.env
```

Populate the file through an authorized administrative channel. Do not paste real values into issues, pull requests, screenshots, logs, or documentation.

## Demo accounts

`application/backend/seed.py` seeds the style catalog without creating a user by default. To create an intentional demo account, supply both demo variables at runtime. Never use a predictable demo password on an internet-facing deployment.

## If a secret is exposed

1. Revoke or rotate it at the provider.
2. Remove it from the current tree.
3. Audit provider and application logs for misuse.
4. Purge it from Git history when appropriate.
5. Notify affected collaborators and redeploy with the replacement secret.
