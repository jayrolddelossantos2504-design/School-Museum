# School Museum — Installation Guide

**For:** the person receiving this project and their AI assistant (GitHub Copilot / VS Code).
**Platform:** Windows 10/11.
**Result:** the site runs locally at `http://127.0.0.1:8000`.

---

## Before you send this project (sender checklist)

Do **not** send these to the recipient:

- `.env` — it contains the real database password and Cloudinary secrets. The recipient must create their own from `.env.example`.
- `venv/` and `node_modules/` — machine-specific and large.
- `static/videos/` — the 292 MB video is not referenced by the site.

Best option: push to GitHub and let the recipient clone, or send a ZIP that excludes the items above.

---

## 1. What you need

| Software | Version | Required | Notes |
|---|---|---|---|
| Python | 3.9 – 3.12 (3.11 recommended) | Yes | Tick **"Add python.exe to PATH"** during install. Tested on 3.9.13. |
| MySQL or MariaDB | MySQL 8+ / MariaDB 10.4+ | Yes | Easiest on Windows: install **XAMPP** and start **MySQL**. |
| VS Code + Python extension | Latest | Recommended | Used to open the project and run it. |
| Node.js | 18+ | No | Only needed if you change Tailwind CSS styles. The compiled CSS is already included. |
| Cloudinary account | — | No | Optional. Without it, uploaded images are saved to `uploads/` instead. |
| cloudflared | Latest | No | Only needed for a temporary public link (`start.bat`). |

---

## 2. One-click install (Windows)

1. Install **Python** (tick "Add python.exe to PATH").
2. Install **XAMPP**, open the XAMPP Control Panel, and click **Start** next to **MySQL**.
3. Double-click **`install.bat`** in the project folder.
4. If Notepad opens `.env`, fill in your database settings and save:
   - Fresh XAMPP defaults: `DB_USER=root` and `DB_PASSWORD=` (leave blank).
   - Set `SECRET_KEY` to any long random text.
   - Cloudinary values can stay as `replace-me` (optional).
5. Return to the installer window and press a key. It creates the database tables.
6. When asked, choose **Y** to create the first staff account (password must be 8+ characters).
7. Choose **Y** to start the site, then open `http://127.0.0.1:8000`.

If anything fails, use the manual steps below.

---

## 3. Manual install

Open a terminal **in the project folder** (the folder containing `app.py`).

```bat
:: 1. Create the virtual environment
python -m venv venv

:: 2. Install dependencies (always use the venv's Python)
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt

:: 3. Create your environment file
copy .env.example .env
```

Edit `.env` (see section 4), then:

```bat
:: 4. Create the database, tables, and starter categories
venv\Scripts\python.exe init_db.py

:: 5. Create the first administrator (password is prompted)
venv\Scripts\python.exe create_admin.py admin --role admin

:: 6. Start the site
venv\Scripts\python.exe wsgi.py
```

Open `http://127.0.0.1:8000`. Admin login: `http://127.0.0.1:8000/admin/login`.

---

## 4. Configure `.env`

`.env` is **not** included (it is gitignored because it holds secrets). Create it from `.env.example` and set these values:

```dotenv
APP_ENV=development
SECRET_KEY=put-a-long-random-string-here

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_museum

# Optional: leave as replace-me to store images in ./uploads instead
CLOUDINARY_CLOUD_NAME=replace-me
CLOUDINARY_API_KEY=replace-me
CLOUDINARY_API_SECRET=replace-me

SITE_URL=http://127.0.0.1:8000
SESSION_COOKIE_SECURE=0

HOST=127.0.0.1
PORT=8000
MAX_CONTENT_LENGTH=10485760
```

Generate a strong `SECRET_KEY` with:

```bat
venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Notes:

- `DB_NAME` must stay `school_museum` — the schema file creates that database name.
- Do **not** use the MySQL `root` account on a public/production server; create a dedicated user there.
- `SITE_URL` is used to build QR-code links. It must match how visitors reach the site.
- The app uses Google Fonts from the internet. Offline, pages still work but use fallback fonts.

---

## 5. Create the database

Pick **one** option.

### Option A — installer (recommended)

```bat
venv\Scripts\python.exe init_db.py
```

Safe to run repeatedly (uses `IF NOT EXISTS` / `INSERT IGNORE`).
The database user needs **CREATE** privileges to create the tables. The XAMPP
default `root` user has them; a limited user does not — in that case import the
schema with phpMyAdmin as `root` (Option B).

### Option B — phpMyAdmin (XAMPP)

1. Open `http://localhost/phpmyadmin`.
2. Create a database named `school_museum` with collation `utf8mb4_unicode_ci`.
3. Select it, open **Import**, choose `school_museum_schema-1.sql`, click **Go**.

### Option C — MySQL command line (XAMPP)

```bat
C:\xampp\mysql\bin\mysql.exe -u root -p < school_museum_schema-1.sql
```

Press Enter if the root password is blank.

---

## 6. Create the first staff account

There is no default account.

```bat
venv\Scripts\python.exe create_admin.py admin --role admin
```

You are prompted for a password (minimum 8 characters); it is stored hashed.
Use `--role editor` for a non-admin staff account.

---

## 7. Run the site

```bat
venv\Scripts\python.exe wsgi.py
```

Then open:

- Site: `http://127.0.0.1:8000`
- Admin: `http://127.0.0.1:8000/admin/login`
- Health check: `http://127.0.0.1:8000/health`

Expected health response:

```json
{"status":"ok","database":"connected"}
```

`HOST` and `PORT` come from `.env`. Do **not** change `HOST` to `0.0.0.0` unless you intend to expose the app on your network.

### Run from VS Code

1. Open the project folder in VS Code.
2. `Ctrl+Shift+P` → **Python: Select Interpreter** → choose `venv\Scripts\python.exe`.
3. Open a terminal (`Ctrl+``) and run `venv\Scripts\python.exe wsgi.py`.

The Flask development server (`python app.py`, port 3000) also works for quick checks, but `wsgi.py` is the production-style server.

---

## 8. Optional: temporary public link

Requires [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

```bat
start.bat
```

This starts a Cloudflare Quick Tunnel, writes the new public URL into `SITE_URL` in `.env`, and starts the app. The URL changes every time it restarts and is only for temporary sharing.

---

## 9. Optional: rebuild Tailwind CSS

Only needed after editing templates/styles. Requires Node.js 18+.

```bat
npm install --legacy-peer-deps
npx tailwindcss -i ./static/css/tailwind-source.css -o ./static/css/tailwind.css
```

The pre-compiled `static/css/tailwind.css` is committed, so the site runs without Node.

---

## 10. Project structure

```
app.py                     Flask app factory, routes, CSP, health check
wsgi.py                    Waitress production entry point
config.py                  Config from .env
database.py                MySQL connection helpers
public.py                  Public pages (home, collection, location, history, ...)
auth.py / admin.py         Login and admin dashboard
image_service.py           Cloudinary upload with local uploads/ fallback
create_admin.py            Create a staff account
init_db.py                 Create database/tables/categories from the schema
school_museum_schema-1.sql Database schema + starter categories
templates/                 Jinja templates
static/                    CSS, JS, images
.env.example               Template for .env (safe to share)
start.bat / start.ps1      Start app + Cloudflare tunnel
install.bat                One-click Windows installer
```

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `'python' is not recognized` | Python not installed or not on PATH | Reinstall Python and tick "Add python.exe to PATH"; reopen the terminal. |
| `No module named flask` | Dependencies installed outside the venv | Run `venv\Scripts\python.exe -m pip install -r requirements.txt`. |
| `Access denied for user` (1045) | Wrong DB user/password | Fix `DB_USER` / `DB_PASSWORD` in `.env`. XAMPP default: `root` with blank password. |
| `Can't connect to MySQL server` (2003) | MySQL is not running | Start MySQL in the XAMPP Control Panel; check `DB_HOST` / `DB_PORT`. |
| `Unknown database 'school_museum'` | Schema was not imported | Run `venv\Scripts\python.exe init_db.py`. |
| `Port 8000 already in use` | Another app is using the port | Change `PORT` in `.env` or stop the other process. |
| Page has no styling | `static/css/tailwind.css` missing | Restore the file from the repo, or rebuild with Node (section 9). |
| Uploaded images do not appear | Cloudinary not configured and `uploads/` not writable | Leave Cloudinary placeholders (local fallback) and ensure the folder is writable. |
| Login fails | No staff account exists | Run `create_admin.py` (section 6). |
| Startup warns `SECRET_KEY is the default` | `.env` not loaded or key not set | Set `SECRET_KEY` in `.env`. |

---

## 12. Instructions for the AI assistant (Copilot)

When the user asks you to install, configure, or run this project, follow these steps. Prefer calling the venv Python directly (`venv\Scripts\python.exe`) so activation is not required. Work from the repository root (the folder containing `app.py`).

### Environment facts

- OS: Windows
- Python: 3.9 – 3.12 (tested on 3.9.13)
- Database: MySQL 8 / MariaDB, database name `school_museum`
- App server: Waitress via `wsgi.py`
- Config: `.env` (never commit or print its secrets)
- CSS is pre-compiled; Node.js is **not** required to run

### Setup checklist

1. Verify Python: `python --version` or `py -3 --version`. Must be 3.9+.
2. Create the environment if missing: `python -m venv venv`.
3. Install packages: `venv\Scripts\python.exe -m pip install -r requirements.txt`.
4. Ensure `.env` exists; copy from `.env.example` if missing. Ask the user for DB credentials and `SECRET_KEY`.
5. Confirm MySQL is running (XAMPP Control Panel) and `.env` `DB_*` values are valid.
6. Initialize the schema: `venv\Scripts\python.exe init_db.py`.
7. Create an admin if none exists: `venv\Scripts\python.exe create_admin.py admin --role admin`.
8. Start the app: `venv\Scripts\python.exe wsgi.py`.
9. Verify: request `http://127.0.0.1:8000/health` and expect `{"status":"ok","database":"connected"}`.
10. Verify the public site returns HTTP 200 at `http://127.0.0.1:8000/`.

### Guardrails

- Never commit, print, or share `.env` or its secrets.
- Never install packages globally; use the venv.
- Do not add `static/videos/` (large media) to git.
- Do not use the Flask dev server for public access; use `wsgi.py`.
- Do not loosen the Content Security Policy in `app.py` unless a feature genuinely requires an external resource.
- Do not change `DB_NAME`; the schema creates `school_museum`.

### Definition of done

- `venv\Scripts\python.exe wsgi.py` starts without errors.
- `/health` returns `{"status":"ok","database":"connected"}`.
- The home page loads with styling.
- `/admin/login` loads and a created account can log in.
