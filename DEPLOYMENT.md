# Deployment Runbook — School Museum Website

**Current Version:** 2.0 (with Modern Tailwind CSS Design)  
**Last Updated:** October 15, 2026

This document covers publishing the site publicly. It is written to be
completed with the chosen host and domain; replace the placeholders
(`<host>`, `<domain>`, paths) with real values.

> **Do not print permanent QR labels until the site is reachable at a stable
> `https://` domain.** QR labels encode `SITE_URL/item/<token>`.

---

## What's New in This Release

✅ **Modern Design Redesign** - All 22 templates now use Tailwind CSS with:
- Professional green/gold color scheme (#185a45, #c68a1a)
- Modern typography (Playfair Display, Plus Jakarta Sans)
- Responsive layouts (mobile-first design)
- Styled error pages (404, 403, 413, 500)
- Professional admin dashboard and forms

✅ **Compiled Tailwind CSS** - CSS is pre-compiled at `/static/css/tailwind.css`
(not CDN-dependent, suitable for production)

✅ **All templates styled:**
- 7 public pages (home, collection, categories, etc.)
- 11 admin pages (dashboard, login, items, categories, logs, forms, etc.)
- 4 error pages (403, 404, 413, 500)

---

## 1. Prerequisites

- A host with Python 3.9+ (Windows or Linux) and a MySQL/MariaDB database.
- A domain name pointing to the host, with HTTPS (TLS certificate).
- A Cloudinary account (cloud name, API key, API secret) for image storage.
- A production WSGI server. This project uses **Waitress** (already in
  `requirements.txt`) and never the Flask development server.

---

## 2. Install the application

```bash
# Get the code onto the server, then:
cd <app-directory>
python -m venv venv

# Windows
venv/Scripts/python.exe -m pip install -r requirements.txt

# Linux/macOS
./venv/bin/pip install -r requirements.txt
```

**Note:** The Tailwind CSS file (`static/css/tailwind.css`) is already compiled
and included in the repository. No additional build step is required for
deployment. If you need to customize colors or add new utilities, rebuild with:

```bash
# Requires Node.js 16+
npm install --legacy-peer-deps
npx tailwindcss -i ./static/css/tailwind-source.css -o ./static/css/tailwind.css
```

---

## 3. Create the database

Create the database and a **dedicated least-privilege** application user (do
not use `root`):

```sql
CREATE DATABASE school_museum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'museum_app'@'localhost' IDENTIFIED BY '<strong-db-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON school_museum.* TO 'museum_app'@'localhost';
FLUSH PRIVILEGES;
```

Import the schema (and starter categories):

```bash
mysql --user=root --password < school_museum_schema-1.sql
```

---

## 4. Configure environment variables

Create `.env` **on the server** (never commit it; permissions `600`):

```dotenv
APP_ENV=production

SECRET_KEY=<long-random-value>
# Generate one with:
#   python -c "import secrets; print(secrets.token_urlsafe(48))"

DB_HOST=localhost
DB_PORT=3306
DB_USER=museum_app
DB_PASSWORD=<strong-db-password>
DB_NAME=school_museum

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

SITE_URL=https://<domain>

HOST=127.0.0.1
PORT=8000
```

Notes:
- `APP_ENV=production` forces secure cookies and disables debug.
- `HOST=127.0.0.1` is correct when a reverse proxy runs on the same machine.
  Use `0.0.0.0` only if the app is exposed directly (not recommended).
- The app logs a warning on startup if `SECRET_KEY`, `DB_PASSWORD`,
  `SESSION_COOKIE_SECURE`, or HTTPS `SITE_URL` are not set correctly.

---

## 5. Create the first staff account

There are no default accounts. Create an administrator interactively:

```bash
venv/Scripts/python.exe create_admin.py <username> --role admin   # Windows
./venv/bin/python create_admin.py <username> --role admin          # Linux
```

The password is prompted (never passed on the command line) and stored hashed.

---

## 6. Run the production server

```bash
venv/Scripts/python.exe wsgi.py     # Windows
./venv/bin/python wsgi.py           # Linux/macOS
```

Health check:

```bash
curl -s http://127.0.0.1:8000/health
# {"status":"ok","database":"connected"}
```

### Run as a service

- **Linux (systemd):** create `/etc/systemd/system/school-museum.service`
  with `ExecStart=/<app>/venv/bin/python /<app>/wsgi.py`,
  `EnvironmentFile=/<app>/.env`, `Restart=always`, `User=<appuser>`.
- **Windows:** use NSSM or Task Scheduler to run
  `venv\Scripts\python.exe wsgi.py` at startup with the working directory set
  to the app folder.

---

## 7. HTTPS reverse proxy

Terminate TLS at a reverse proxy and forward to Waitress. Example **nginx**:

```nginx
server {
    listen 443 ssl;
    server_name <domain>;

    ssl_certificate     /etc/letsencrypt/live/<domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;

    client_max_body_size 12m;   # slightly above MAX_CONTENT_LENGTH

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name <domain>;
    return 301 https://$host$request_uri;
}
```

**Caddy** alternative (automatic HTTPS):

```
<domain> {
    reverse_proxy 127.0.0.1:8000
    request_body { max_size 12MB }
}
```

Security headers and CSP are already sent by the app, so the proxy does not
need to add them.

---

## 8. Production security checklist

- [ ] `APP_ENV=production` and `SECRET_KEY` is a long random value.
- [ ] Database user is least-privilege (no `root`).
- [ ] `.env` is not in source control and is readable only by the app user.
- [ ] HTTPS works; HTTP redirects to HTTPS.
- [ ] `SESSION_COOKIE_SECURE` is on (automatic in production).
- [ ] `SITE_URL` is the real `https://` domain.
- [ ] Cloudinary credentials are server-side only.
- [ ] Debug is off (production config).
- [ ] Error pages (403/404/413/500) return without leaking stack traces.
- [ ] `/health` reachable and reporting `connected`.

---

## 9. Backups

Follow `BACKUP_RESTORE.md`. Schedule a daily `mysqldump` and keep an off-server
copy. Test a restore into a scratch database before relying on it.

---

## 10. Post-deployment verification

1. Open `https://<domain>/` and confirm the site loads over HTTPS.
2. Browse the collection and open an item page.
3. Log in at `/admin/login` and confirm the dashboard loads.
4. Upload an image (Cloudinary must be configured) and confirm it appears.
5. Open an item's QR page (`/admin/items/<id>/qr`), download the PNG, and
   **scan it with a phone on mobile data** — it must open the correct
   `https://<domain>/item/<token>` page.
6. Confirm the startup log shows no configuration warnings.
7. Only after all of the above, proceed to print QR labels (Milestone 14).
