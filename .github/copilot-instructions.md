# School Museum — AI assistant setup notes

This repository is a Flask + MySQL school museum website for Windows.
Full setup and troubleshooting: see `INSTALLATION.md`.

## Environment

- OS: Windows 10/11
- Python: 3.9–3.12 (tested on 3.9.13)
- Database: MySQL 8 / MariaDB, database name `school_museum`
- Server: Waitress via `wsgi.py` at `http://127.0.0.1:8000`
- Config: `.env` (copy from `.env.example`; never commit or print its secrets)
- Tailwind CSS is pre-compiled; Node.js is only needed to change styles

## Setup commands

```bat
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env
venv\Scripts\python.exe init_db.py
venv\Scripts\python.exe create_admin.py admin --role admin
venv\Scripts\python.exe wsgi.py
```

`install.bat` runs the same steps with prompts.

## Verify

- `http://127.0.0.1:8000/health` returns `{"status":"ok","database":"connected"}`
- `http://127.0.0.1:8000/` returns HTTP 200
- `http://127.0.0.1:8000/admin/login` loads and a staff account can log in

## Rules

- Always call `venv\Scripts\python.exe`; do not install packages globally.
- Never commit, print, or share `.env`.
- Do not add `static/videos/` to git (large media, unused by the site).
- Do not use the Flask dev server (`app.py`) for public access.
- Do not loosen the CSP in `app.py` unless a feature requires an external resource.
- Keep `DB_NAME=school_museum`; the schema creates that database.
