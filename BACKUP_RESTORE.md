# Backup and Restore Procedure

This document describes how to back up and restore the School Museum website
data. The two things that hold state are:

1. **The MySQL/MariaDB database** (`school_museum`) — items, categories, images
   metadata, staff accounts, and activity logs.
2. **Uploaded images** — stored in Cloudinary (not on this server). Cloudinary
   retains the original assets; the database only stores their URLs and public
   IDs.

Also protect the **`.env` file** (secrets). It is git-ignored and must be
backed up separately to a secure location — never into source control.

---

## 1. Backing up the database

### Development (XAMPP on Windows)

Open a terminal and run (adjust the path if XAMPP is installed elsewhere):

```bash
"/c/xampp/mysql/bin/mysqldump.exe" \
  --user=root \
  --single-transaction --skip-lock-tables --no-tablespaces \
  --databases school_museum \
  > "backups/school_museum_$(date +%Y%m%d_%H%M%S).sql"
```

Create the `backups/` folder first if it does not exist.

### Production

Use the application database account (or a dedicated backup account with
`SELECT` and `LOCK TABLES` privileges):

```bash
mysqldump \
  --host=<DB_HOST> --port=<DB_PORT> \
  --user=<DB_USER> --password \
  --single-transaction --skip-lock-tables --no-tablespaces \
  --databases school_museum \
  > "school_museum_$(date +%Y%m%d_%H%M%S).sql"
```

Notes:
- `--single-transaction` gives a consistent snapshot for InnoDB tables without
  locking, so staff can keep working during the backup.
- `--no-tablespaces` avoids needing the `PROCESS` privilege.
- Verify the dump is not empty (`ls -l` the file) before relying on it.

**Recommended schedule:** a daily automatic backup plus one before any bulk
content entry or schema change. Keep several generations (e.g. the last 14
daily dumps) and store at least one copy off the server.

---

## 2. Restoring the database

> Restoring **overwrites** the current database. Do it only when intended.

```bash
mysql --user=root < school_museum_YYYYMMDD_HHMMSS.sql
```

The dump created with `--databases school_museum` includes the
`CREATE DATABASE`/`USE` statements, so it recreates the database if missing.

After restoring, confirm the tables and row counts:

```bash
mysql --user=root -e "USE school_museum; SHOW TABLES; \
  SELECT COUNT(*) AS items FROM museum_items; \
  SELECT COUNT(*) AS logs FROM activity_logs;"
```

---

## 3. Testing a restore (recommended)

Restore into a **scratch database** to confirm a backup is valid without
touching production data. The example below uses the local XAMPP server.

```bash
# 1. Create a scratch database
mysql --user=root -e "CREATE DATABASE school_museum_restore_test;"

# 2. Load the dump into it (strip the USE line so it targets the scratch DB)
sed 's/^USE `school_museum`;/USE `school_museum_restore_test`;/' \
  backups/school_museum_YYYYMMDD_HHMMSS.sql \
  | mysql --user=root school_museum_restore_test

# 3. Verify the restored data
mysql --user=root -e "USE school_museum_restore_test; \
  SELECT COUNT(*) FROM museum_items; SELECT COUNT(*) FROM categories;"

# 4. Remove the scratch database
mysql --user=root -e "DROP DATABASE school_museum_restore_test;"
```

---

## 4. Images (Cloudinary)

- Cloudinary keeps every uploaded asset. Images are referenced by URL and by
  `Image_Public_ID` in the `museum_item_images` table.
- Because the database dump includes those public IDs, restoring the database
  restores the links to the original Cloudinary assets.
- Deleting an item image in the app also deletes it from Cloudinary. When
  restoring an older database dump, some referenced images may already have
  been removed from Cloudinary — re-upload those if needed.
- Cloudinary account access (API key/secret) must be backed up with your other
  credentials.

---

## 5. Logs

Application logs live in `logs/app.log` (rotated, 3 x 1 MB) and contain no
secrets. They are optional to back up and safe to discard.
