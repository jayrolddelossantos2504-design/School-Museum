# School Museum Website — Development Sequence

This document tells OpenCode the recommended order for building the School Museum Website. Follow the milestones in order, test each milestone, and avoid building everything at once.

## Project Overview

The website is a public internet-facing School Museum catalog. Visitors can browse published museum items and scan a QR code on a physical exhibit to open that item's public page. The commissioner supplies the initial images and descriptions. Authorized school staff can later add items, upload images, and maintain the catalog.

**Expected stack**
- Backend: Python with Flask
- Templates/UI: HTML, Jinja, CSS, and JavaScript
- Database: MySQL
- Image storage: Cloudinary (store the image URL and Cloudinary public ID in MySQL; do not store image binary data in MySQL)
- Authentication: secure administrator/editor login
- QR codes: generated from each item's permanent public URL
- Deployment: public hosting with a stable domain and HTTPS

## Important Instructions for OpenCode

1. Inspect the existing project files before creating or changing anything.
2. Read these documents first:
   - `SCHOOL_MUSEUM_OPENCODE_GUIDE.md`
   - `SCHOOL_MUSEUM_DATABASE_DESIGN.md`
   - `school_museum_schema.sql`
   - `SCHOOL_MUSEUM_DEVELOPMENT_SEQUENCE.md`
3. Treat `school_museum_schema.sql` as the source of truth for table and column names.
4. Preserve existing working code. Do not replace the whole project just to implement one feature.
5. Work one milestone at a time. Explain what will be created, implement it, test it, and report the result before moving on.
6. Do not hardcode passwords, API keys, or Flask secret keys. Use environment variables in a `.env` file and include a safe `.env.example` without real secrets.
7. Never store plain-text administrator passwords.
8. Do not expose admin routes, unpublished items, archived items, or image-upload credentials to public visitors.
9. Use a permanent `Public_Token` for each museum item. QR codes must point to the item's public page, not directly to its image. Updating an item must not change its public URL.
10. Do not print final QR labels until the site has a stable public HTTPS URL.
11. If a requirement conflicts with the database schema or project guide, stop and explain the conflict before changing the design.

---

# Recommended Build Order

## Milestone 1 — Inspect the Environment and Prepare the Project

**Goal:** Understand the current files and confirm the development environment before coding.

Tasks:
- Inspect the repository structure and identify existing Flask entry points, templates, static files, and configuration.
- Confirm the installed Python version and required packages.
- Check that the MySQL service is running and the `school_museum` database/schema can be imported.
- Identify whether a virtual environment already exists; reuse it if appropriate.
- Create or update `requirements.txt`.
- Create `.env.example` with placeholder values only.
- Add `.env` to `.gitignore`.
- Write a short project structure summary.

**Test / completion criteria:**
- The project starts without a missing-module error.
- The database schema exists.
- No secrets are committed or hardcoded.
- Existing project files are preserved.

**Do not build the full website yet.**

## Milestone 2 — Flask Configuration and Database Connection

**Goal:** Establish a reliable application foundation.

Tasks:
- Configure Flask using environment variables.
- Configure the MySQL connection using the project's chosen connector.
- Add a reusable database connection/helper pattern and ensure cursors/connections are closed safely.
- Add a simple health-check route for local development that confirms the app starts and can connect to MySQL. Do not expose sensitive connection details.
- Add basic error handling and logging.

**Test / completion criteria:**
- Flask starts.
- The health check confirms database connectivity.
- Incorrect credentials produce a safe error, not a traceback or secret leak.

## Milestone 3 — Shared Layout and Public Navigation

**Goal:** Build the site's basic look and navigation before implementing all features.

Tasks:
- Create a shared base template.
- Add responsive header/navigation and footer.
- Add public links for Home, Museum Collection, and Categories.
- Add a consistent style system for colors, typography, spacing, and mobile layouts.
- Use placeholder content only where necessary, clearly marked for replacement.

**Test / completion criteria:**
- Pages render on desktop and mobile widths.
- Navigation links work.
- Templates reuse the shared layout rather than duplicating the entire page structure.

## Milestone 4 — Administrator and Editor Authentication

**Goal:** Secure the management area before adding management features.

Tasks:
- Create a secure first-admin setup script or CLI command that hashes the password before inserting it.
- Implement login and logout.
- Verify the password using a suitable password-hashing library.
- Protect all admin/editor routes with authentication checks.
- Enforce roles: `admin` can manage accounts/permissions if that feature is included; `editor` can maintain museum content but cannot perform admin-only actions.
- Reject inactive accounts.
- Use secure session settings appropriate to the deployment environment and add CSRF protection to forms.
- Never provide a public sign-up page for staff unless specifically approved by the commissioner.

**Test / completion criteria:**
- A valid administrator can log in and log out.
- Invalid credentials are rejected.
- Unauthenticated users cannot access protected pages.
- Role restrictions work.
- Passwords are stored only as hashes.

## Milestone 5 — Admin Dashboard Shell

**Goal:** Provide a central landing page for authorized staff.

Tasks:
- Create an admin dashboard template.
- Add navigation to Manage Items, Categories, and Activity Logs.
- Show basic counts only when they can be calculated from the database.
- Do not add complicated analytics until core item management works.

**Test / completion criteria:**
- Only authenticated authorized staff can access the dashboard.
- Dashboard links point to real routes or are clearly marked as not implemented yet.

## Milestone 6 — Category Management

**Goal:** Let authorized staff organize the collection.

Tasks:
- List categories.
- Allow authorized staff to add, edit, and delete categories only when safe.
- Prevent deletion of a category that is still in use unless a clear reassignment process is implemented.
- Validate required fields and prevent duplicate category names.

**Test / completion criteria:**
- Category changes persist in MySQL.
- Validation messages are clear.
- Existing museum items are not accidentally orphaned.

## Milestone 7 — Museum Item Management (Text and Metadata)

**Goal:** Implement the core catalog records before image uploads.

Tasks:
- List museum items in the admin area, including draft/published and archived status.
- Create, view, edit, publish/unpublish, and archive items.
- Include item name, description, historical details, category, and other fields defined by the approved schema.
- Generate a unique, permanent `Public_Token` when a new item is created.
- Record creator/updater references where supported by the schema.
- Validate input and use parameterized SQL queries.

**Test / completion criteria:**
- Staff can create and edit an item.
- The token stays the same when the item is edited.
- Draft and archived items remain hidden from public pages.
- Database field names match the supplied SQL schema.

## Milestone 8 — Cloudinary Image Uploads

**Goal:** Allow authorized staff to upload and maintain item images.

Tasks:
- Configure Cloudinary credentials through environment variables.
- Validate file type and file size on the server; allow only approved image formats.
- Upload images to Cloudinary from the authenticated management area.
- Store the resulting image URL and Cloudinary public ID in `museum_item_images`.
- Support image captions, alt text, cover-image selection, and ordering where the schema supports them.
- Handle upload failures without saving broken database records.
- When removing an image, delete it from Cloudinary only after confirming it belongs to this application and the deletion is intended.
- Never expose Cloudinary API secrets to the browser.
- Seed the first items using the commissioner's supplied images and descriptions after permission and content are confirmed.

**Test / completion criteria:**
- An authorized staff member can upload an image.
- The image URL loads successfully.
- The database records the URL and public ID.
- Unauthenticated visitors cannot upload or manage images.
- Upload failures are reported safely.

## Milestone 9 — Public Museum Collection and Item Pages

**Goal:** Let visitors discover and read the museum collection.

Tasks:
- Build the public collection page with pagination if needed.
- Add category filtering and search.
- Show each item's cover image, name, and short summary.
- Build a public detail page for each item using its permanent token.
- Public queries must return only items where `IsPublished = TRUE` and `IsArchived = FALSE`.
- Escape/render visitor-facing text safely and avoid exposing internal admin fields.
- Make pages responsive and accessible, including useful alt text for images.

**Test / completion criteria:**
- Visitors can browse, search, and filter published items.
- Each published item has a stable public page.
- Draft and archived items cannot be accessed through the public routes, even if someone guesses or knows a token.
- Missing or invalid tokens return a proper 404 page.

## Milestone 10 — QR Code Generation and Printing

**Goal:** Link physical exhibits to their online item pages.

Tasks:
- Generate a QR code for each item using its full public HTTPS URL, for example: `https://museum.example.edu/item/<Public_Token>`.
- QR codes must link to the public item page, not to a Cloudinary image URL or an admin route.
- Provide a staff-only option to preview and download a QR code.
- Include an item name/label on a printable sheet if practical.
- Keep the public token and URL stable if the item name, description, or image changes.

**Test / completion criteria:**
- Scan a sample QR code using a phone and verify that it opens the correct public item page.
- Test QR codes on multiple screen sizes and a printed sample.
- Do not mass-print final labels before the production domain and HTTPS are confirmed.

## Milestone 11 — Activity Logging and Audit Checks

**Goal:** Track important staff actions.

Tasks:
- Record important actions such as login events where appropriate, item creation/editing, publish/unpublish, archive, category changes, and image changes.
- Use `activity_logs` according to the supplied schema.
- Avoid logging passwords, session secrets, API keys, or unnecessary personal information.
- Provide an admin-only activity log page if required.

**Test / completion criteria:**
- Important changes create useful log entries.
- Logs identify the acting staff member where possible.
- Sensitive information is not written to logs.

## Milestone 12 — Security, Accessibility, and Quality Testing

**Goal:** Test the system as a whole before public launch.

Checklist:
- [ ] Authentication and authorization checks on every protected route.
- [ ] CSRF protection on state-changing forms.
- [ ] Parameterized SQL queries.
- [ ] Server-side validation for form fields and uploads.
- [ ] Secure password hashing.
- [ ] Environment variables for secrets.
- [ ] Safe error pages and useful server logs.
- [ ] Public routes never show draft or archived items.
- [ ] Mobile and desktop layouts tested.
- [ ] Keyboard navigation, readable contrast, form labels, and image alt text reviewed.
- [ ] Test empty states, invalid IDs/tokens, missing images, duplicate categories, and database failures.
- [ ] Backup and restore procedure documented.
- [ ] Test with sample content before importing the full collection.

**Test / completion criteria:**
- All core user journeys work.
- Critical security issues are resolved before launch.
- The database can be backed up and restored in a test environment.

## Milestone 13 — Public Deployment and Domain Setup

**Goal:** Publish the site on the internet.

Tasks:
- Select a hosting environment that supports the Flask app and MySQL-compatible database.
- Configure production environment variables outside source control.
- Use a production WSGI server; do not use Flask's development server for production.
- Configure the domain and HTTPS.
- Configure secure cookies and production error handling.
- Confirm image storage and permissions work from the deployed server.
- Create and test database backups.
- Import or enter approved initial museum content.
- Test all public item URLs from a device outside the development network.

**Test / completion criteria:**
- The website is reachable from the public internet over HTTPS.
- Public item URLs are stable.
- Staff can log in securely.
- Images load and QR codes work from mobile devices using mobile data or another external network.

## Milestone 14 — Final Content Entry and QR Label Rollout

**Goal:** Prepare the real collection for visitors.

Tasks:
- Confirm item names, descriptions, historical details, captions, and image permissions with the commissioner.
- Upload approved images and publish reviewed items.
- Generate and test QR codes for each published item.
- Print a small pilot batch and test scans in the actual museum lighting and placement.
- Only after the pilot succeeds, print and place the remaining labels.
- Give authorized staff a short guide for adding items, changing images, publishing, and archiving.

**Test / completion criteria:**
- Each physical exhibit's QR code opens the correct item page.
- Content and images are approved.
- Staff know how to maintain the website after launch.

---

# Suggested First Sprint

Do only these items first:

1. Inspect the existing project and read the three existing project/database documents.
2. Confirm Python, Flask, MySQL, and the imported schema.
3. Configure `.env`, `.gitignore`, and the database connection.
4. Create a minimal shared layout and a database health check.
5. Test locally and report what works before moving to authentication.

This avoids spending time on pages that depend on a database connection or security foundation that has not been tested.

# Definition of Done for Every Milestone

A milestone is complete only when:
- The code is implemented without breaking existing working features.
- The relevant test steps have been performed.
- Any setup commands or configuration changes are documented.
- The files changed are listed.
- Known issues are reported honestly.
- The next milestone is not started until the current one passes, unless the user explicitly asks to proceed.

# OpenCode Prompt to Start

Use this prompt after placing this document beside the other project files:

> Read `SCHOOL_MUSEUM_DEVELOPMENT_SEQUENCE.md`, `SCHOOL_MUSEUM_OPENCODE_GUIDE.md`, `SCHOOL_MUSEUM_DATABASE_DESIGN.md`, and `school_museum_schema.sql`. First inspect the existing project and summarize the current environment, folder structure, dependencies, and database readiness. Do not modify files yet. Compare the current project against Milestone 1 and report the gaps. Wait for my approval before implementing changes. After approval, work one milestone at a time, test each milestone, list changed files, and do not move to the next milestone until the current one passes. Preserve existing work and never hardcode credentials or secrets.
