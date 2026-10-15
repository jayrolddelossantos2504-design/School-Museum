# School Museum Website — Staff Guide

A short guide for authorized staff to add museum items, manage images, publish
or archive items, and print QR codes. No technical knowledge is required.

> **Before printing QR labels:** the website must already be live at its real
> `https://` address (see `DEPLOYMENT.md`). QR labels printed for a local or
> temporary address will not work for visitors.

---

## 1. Logging in

1. Go to `https://<your-museum-domain>/admin/login`.
2. Enter your username and password.
3. You land on the **Admin Dashboard**.

There are two roles:
- **Admin** — everything below, plus **Activity Logs** and **Manage Accounts**.
- **Editor** — everything except Activity Logs and Manage Accounts.

If you forget your password, ask an administrator to create a new account.

---

## 2. The dashboard

The dashboard shows counts of items (total / published / drafts / archived),
categories, images, and staff accounts. Use the links to reach each section.

---

## 3. Categories

**Categories → Add category** (or edit an existing one).

- Give each category a clear name (for example *Photographs*).
- A category can be deleted only when no item uses it. Reassign items first.

---

## 4. Adding an item

**Manage Items → Add item**

Fill in:
- **Item name** — what visitors see as the title.
- **Category** — or *Uncategorised*.
- **Public description** — required; shown on the public page.
- **Historical details** — optional extra text.
- **Published** — tick only when the content is approved and ready to show.

Click **Save item**. New items start as **Draft** unless you ticked Published.

> The item gets a permanent **public link token**. This never changes, even if
> you rename the item or change its images — so QR codes keep working forever.

### Publishing / unpublishing
On **Manage Items**, use **Publish** / **Unpublish**. Draft and unpublished
items are **never** visible to the public.

### Archiving
**Archive** hides an item permanently and unpublishes it. Use **Unarchive** to
bring it back (it stays unpublished until you publish it again).

---

## 5. Images

Open an item (**View**) to manage its images.

1. **Upload an image** — choose the file, add an optional **caption** and
   **alt text**, and tick **Set as cover image** if it should lead the page.
2. **Alt text** describes the image for screen readers and when an image fails
   to load. Please add it (for example *"Black-and-white photo of the 1952
   football team"*).
3. The first image added becomes the cover automatically.
4. **Set as cover** moves the cover to another image.
5. **Delete** removes an image from the website and from storage.

Accepted formats: JPG, PNG, GIF, WEBP. Maximum size: 8 MB.

---

## 6. QR codes

Open an item, then click **QR code**.

- The QR code opens the item's **public page** — never an image or admin page.
- **Download PNG** saves the image for printing elsewhere.
- **Print label** prints a ready label with the item name, category, the words
  "Scan to view this item online", the QR code, and the web address.

### Printing checklist
1. Confirm the page shows **no "do not print" warning**. If you see that
   warning, the site is not yet on its real HTTPS address — stop and ask.
2. Print a **small pilot batch** first.
3. Test scans with a phone using **mobile data** (not the museum Wi-Fi), in the
   actual lighting and placement.
4. Only after the pilot works, print and place the remaining labels.

---

## 7. Activity logs (admin only)

**Activity Logs** lists who did what and when: logins, item and category
changes, publishing, archiving, and image changes. Use it to see recent changes.

---

## 8. Content entry checklist (per item)

- [ ] Item name is clear and consistent with the physical exhibit.
- [ ] Category is correct.
- [ ] Public description is written for visitors (no internal notes).
- [ ] Historical details added if known.
- [ ] At least one image uploaded.
- [ ] Caption and **alt text** filled in.
- [ ] Cover image chosen.
- [ ] Item set to **Published** only after approval.
- [ ] QR code generated and test-scanned (after the site is live on HTTPS).

---

## 9. Good practice

- **Never** untick/republish wildly: editing text or images does not change the
  QR code, so corrections are always safe.
- Prefer **Archive** over deleting when an exhibit is retired permanently
  (archiving keeps the token stable).
- Keep descriptions free of personal or sensitive information.
- Log out when you finish, especially on a shared computer.
