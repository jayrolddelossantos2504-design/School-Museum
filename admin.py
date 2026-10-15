"""Admin area blueprint — protected routes for logged-in staff."""

import functools
import io
import uuid

from flask import (
    Blueprint,
    abort,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    send_file,
    url_for,
)
from flask_login import current_user, login_required
from mysql.connector import IntegrityError

from database import get_cursor
from forms import CategoryForm, ImageForm, ItemForm
from activity_log import log_action
from image_service import (
    destroy_image,
    is_configured as cloudinary_is_configured,
    upload_image,
    validate_image,
)
from qr_service import build_item_url, generate_qr_png, is_printable_url

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def role_required(*roles):
    """Require a logged-in user whose role is one of ``roles``.

    Applies login first, then the role check, returning 403 otherwise.
    """

    def decorator(view):
        @functools.wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            if current_user.role not in roles:
                abort(403)
            return view(*args, **kwargs)

        return wrapped

    return decorator


def get_dashboard_counts(app):
    """Return simple, cheap counts for the dashboard.

    Raises on database errors so the caller can decide how to degrade.
    """
    with get_cursor(app, dictionary=True) as cursor:
        def scalar(sql):
            cursor.execute(sql)
            return cursor.fetchone()["c"]

        return {
            "items_total": scalar("SELECT COUNT(*) AS c FROM museum_items"),
            "items_published": scalar(
                "SELECT COUNT(*) AS c FROM museum_items "
                "WHERE IsPublished = TRUE AND IsArchived = FALSE"
            ),
            "items_draft": scalar(
                "SELECT COUNT(*) AS c FROM museum_items "
                "WHERE IsPublished = FALSE AND IsArchived = FALSE"
            ),
            "items_archived": scalar(
                "SELECT COUNT(*) AS c FROM museum_items WHERE IsArchived = TRUE"
            ),
            "categories": scalar("SELECT COUNT(*) AS c FROM categories"),
            "images": scalar("SELECT COUNT(*) AS c FROM museum_item_images"),
            "staff": scalar("SELECT COUNT(*) AS c FROM admins"),
        }


@admin_bp.route("/")
@login_required
def dashboard():
    """Staff landing page with basic counts."""
    counts = None
    try:
        counts = get_dashboard_counts(current_app)
    except Exception as exc:  # noqa: BLE001 - degrade gracefully, log details
        current_app.logger.error("Could not load dashboard counts: %s", exc)

    return render_template("admin_dashboard.html", counts=counts)


@admin_bp.route("/items")
@login_required
def items():
    """List all museum items with their status."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.ItemID, mi.Item_Name, mi.IsPublished, mi.IsArchived, "
            "       mi.Date_Added, mi.Updated_At, c.Category_Name "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            "ORDER BY mi.Date_Added DESC"
        )
        item_rows = cursor.fetchall()
    return render_template("admin_items.html", items=item_rows)


def _category_choices():
    """Build SelectField choices: uncategorised (0) plus existing categories."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT CategoryID, Category_Name FROM categories ORDER BY Category_Name"
        )
        rows = cursor.fetchall()
    return [(0, "— Uncategorised —")] + [
        (r["CategoryID"], r["Category_Name"]) for r in rows
    ]


def _get_item_or_404(item_id):
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT ItemID, Public_Token, Item_Name, Description, Historical_Details, "
            "       CategoryID, CreatedBy, UpdatedBy, IsPublished, IsArchived, "
            "       Date_Added, Updated_At "
            "FROM museum_items WHERE ItemID = %s",
            (item_id,),
        )
        item = cursor.fetchone()
    if item is None:
        abort(404)
    return item


@admin_bp.route("/items/new", methods=["GET", "POST"])
@login_required
def item_new():
    form = ItemForm()
    form.category_id.choices = _category_choices()

    if form.validate_on_submit():
        token = str(uuid.uuid4())  # permanent public identifier
        category_id = form.category_id.data or None
        admin_id = int(current_user.id)
        with get_cursor(current_app, commit=True) as cursor:
            cursor.execute(
                "INSERT INTO museum_items "
                "(Public_Token, Item_Name, Description, Historical_Details, "
                " CategoryID, CreatedBy, UpdatedBy, IsPublished, IsArchived) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, FALSE)",
                (
                    token,
                    form.name.data.strip(),
                    form.description.data.strip(),
                    (form.historical_details.data or "").strip() or None,
                    category_id,
                    admin_id,
                    admin_id,
                    bool(form.is_published.data),
                ),
            )
            new_item_id = cursor.lastrowid
        log_action(
            "item_create",
            "item",
            new_item_id,
            f"Created item '{form.name.data.strip()}'",
        )
        flash(f"Item '{form.name.data.strip()}' created.", "success")
        return redirect(url_for("admin.items"))

    return render_template("admin_item_form.html", form=form, mode="new")


@admin_bp.route("/items/<int:item_id>/edit", methods=["GET", "POST"])
@login_required
def item_edit(item_id):
    item = _get_item_or_404(item_id)

    form = ItemForm()
    form.category_id.choices = _category_choices()

    if form.validate_on_submit():
        category_id = form.category_id.data or None
        # Archived items stay unpublished; Public_Token is never changed.
        is_published = bool(form.is_published.data) and not item["IsArchived"]
        with get_cursor(current_app, commit=True) as cursor:
            cursor.execute(
                "UPDATE museum_items SET "
                "Item_Name = %s, Description = %s, Historical_Details = %s, "
                "CategoryID = %s, IsPublished = %s, UpdatedBy = %s "
                "WHERE ItemID = %s",
                (
                    form.name.data.strip(),
                    form.description.data.strip(),
                    (form.historical_details.data or "").strip() or None,
                    category_id,
                    is_published,
                    int(current_user.id),
                    item_id,
                ),
            )
        log_action(
            "item_update",
            "item",
            item_id,
            f"Updated item '{form.name.data.strip()}'",
        )
        flash(f"Item '{form.name.data.strip()}' updated.", "success")
        return redirect(url_for("admin.items"))

    if request.method == "GET":
        form.name.data = item["Item_Name"]
        form.description.data = item["Description"]
        form.historical_details.data = item["Historical_Details"]
        form.category_id.data = item["CategoryID"] or 0
        form.is_published.data = bool(item["IsPublished"])

    return render_template("admin_item_form.html", form=form, mode="edit", item=item)


@admin_bp.route("/items/<int:item_id>")
@login_required
def item_detail(item_id):
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.*, c.Category_Name, "
            "       cu.Username AS CreatedByName, uu.Username AS UpdatedByName "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            "LEFT JOIN admins cu ON mi.CreatedBy = cu.AdminID "
            "LEFT JOIN admins uu ON mi.UpdatedBy = uu.AdminID "
            "WHERE mi.ItemID = %s",
            (item_id,),
        )
        item = cursor.fetchone()
        if item is None:
            abort(404)

        cursor.execute(
            "SELECT ImageID, Image_URL, Image_Public_ID, Alt_Text, Caption, "
            "       Is_Cover, Sort_Order, Uploaded_At "
            "FROM museum_item_images WHERE ItemID = %s "
            "ORDER BY Is_Cover DESC, Sort_Order, ImageID",
            (item_id,),
        )
        images = cursor.fetchall()

    return render_template(
        "admin_item_detail.html",
        item=item,
        images=images,
        image_form=ImageForm(),
        cloudinary_ready=cloudinary_is_configured(current_app),
    )


@admin_bp.route("/items/<int:item_id>/qr")
@login_required
def item_qr(item_id):
    """Preview an item's permanent QR code and printable label (staff only)."""
    item = _get_item_or_404(item_id)
    public_url = build_item_url(current_app, item["Public_Token"])
    return render_template(
        "admin_item_qr.html",
        item=item,
        public_url=public_url,
        printable=is_printable_url(public_url),
    )


@admin_bp.route("/items/<int:item_id>/qr.png")
@login_required
def item_qr_png(item_id):
    """Return the item's QR code as a PNG (inline preview or download)."""
    item = _get_item_or_404(item_id)
    public_url = build_item_url(current_app, item["Public_Token"])
    png = generate_qr_png(public_url)
    as_attachment = request.args.get("download") == "1"
    return send_file(
        io.BytesIO(png),
        mimetype="image/png",
        as_attachment=as_attachment,
        download_name=f"qr-{item['Public_Token']}.png",
    )


@admin_bp.route("/items/<int:item_id>/publish", methods=["POST"])
@login_required
def item_publish(item_id):
    item = _get_item_or_404(item_id)
    if item["IsArchived"]:
        flash("Archived items cannot be published. Unarchive the item first.", "error")
    else:
        new_state = not bool(item["IsPublished"])
        with get_cursor(current_app, commit=True) as cursor:
            cursor.execute(
                "UPDATE museum_items SET IsPublished = %s, UpdatedBy = %s "
                "WHERE ItemID = %s",
                (new_state, int(current_user.id), item_id),
            )
        log_action(
            "item_publish" if new_state else "item_unpublish",
            "item",
            item_id,
            f"{'Published' if new_state else 'Unpublished'} "
            f"item '{item['Item_Name']}'",
        )
        flash("Item published." if new_state else "Item unpublished.", "success")
    return redirect(url_for("admin.items"))


@admin_bp.route("/items/<int:item_id>/archive", methods=["POST"])
@login_required
def item_archive(item_id):
    item = _get_item_or_404(item_id)
    with get_cursor(current_app, commit=True) as cursor:
        if item["IsArchived"]:
            cursor.execute(
                "UPDATE museum_items SET IsArchived = FALSE, UpdatedBy = %s "
                "WHERE ItemID = %s",
                (int(current_user.id), item_id),
            )
            flash(
                "Item unarchived. It stays unpublished until you publish it.",
                "success",
            )
        else:
            cursor.execute(
                "UPDATE museum_items SET IsArchived = TRUE, IsPublished = FALSE, "
                "UpdatedBy = %s WHERE ItemID = %s",
                (int(current_user.id), item_id),
            )
            flash("Item archived and unpublished.", "success")
    log_action(
        "item_unarchive" if item["IsArchived"] else "item_archive",
        "item",
        item_id,
        f"{'Unarchived' if item['IsArchived'] else 'Archived'} "
        f"item '{item['Item_Name']}'",
    )
    return redirect(url_for("admin.items"))


@admin_bp.route("/items/<int:item_id>/images", methods=["POST"])
@login_required
def image_upload(item_id):
    """Upload an image for an item and record it in the database."""
    item = _get_item_or_404(item_id)
    form = ImageForm()

    if not form.validate_on_submit():
        for field_errors in form.errors.values():
            for error in field_errors:
                flash(error, "error")
        return redirect(url_for("admin.item_detail", item_id=item_id))

    file_storage = form.image.data
    ok, error = validate_image(file_storage)
    if not ok:
        flash(error, "error")
        return redirect(url_for("admin.item_detail", item_id=item_id))

    # Upload first; only write the DB row if the upload succeeds.
    try:
        result = upload_image(file_storage)
        secure_url = result["secure_url"]
        public_id = result["public_id"]
    except Exception as exc:  # noqa: BLE001 - report safely, log details
        current_app.logger.error("Cloudinary upload failed: %s", exc)
        flash("Image upload failed. Please try again later.", "error")
        return redirect(url_for("admin.item_detail", item_id=item_id))

    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT COUNT(*) AS c, COALESCE(MAX(Sort_Order), -1) AS m "
            "FROM museum_item_images WHERE ItemID = %s",
            (item_id,),
        )
        stats = cursor.fetchone()

    is_first = stats["c"] == 0
    sort_order = stats["m"] + 1
    is_cover = bool(form.is_cover.data) or is_first

    try:
        with get_cursor(current_app, commit=True) as cursor:
            if is_cover:
                cursor.execute(
                    "UPDATE museum_item_images SET Is_Cover = FALSE WHERE ItemID = %s",
                    (item_id,),
                )
            cursor.execute(
                "INSERT INTO museum_item_images "
                "(ItemID, Image_URL, Image_Public_ID, Alt_Text, Caption, "
                " Is_Cover, Sort_Order, UploadedBy) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    item_id,
                    secure_url,
                    public_id,
                    (form.alt_text.data or "").strip() or None,
                    (form.caption.data or "").strip() or None,
                    is_cover,
                    sort_order,
                    int(current_user.id),
                ),
            )
            new_image_id = cursor.lastrowid
    except Exception as exc:  # noqa: BLE001 - avoid dangling storage asset
        current_app.logger.error("DB insert failed after upload: %s", exc)
        try:
            destroy_image(public_id)
        except Exception:  # noqa: BLE001
            current_app.logger.error("Could not remove orphaned asset %s", public_id)
        flash("The image could not be saved. Please try again.", "error")
        return redirect(url_for("admin.item_detail", item_id=item_id))

    log_action(
        "image_upload",
        "item_image",
        new_image_id,
        f"Uploaded image for item '{item['Item_Name']}'"
        + (" (set as cover)" if is_cover else ""),
    )
    flash("Image uploaded.", "success")
    return redirect(url_for("admin.item_detail", item_id=item_id))


@admin_bp.route("/items/<int:item_id>/images/<int:image_id>/cover", methods=["POST"])
@login_required
def image_set_cover(item_id, image_id):
    """Make one image the cover image for its item."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT 1 AS ok FROM museum_item_images "
            "WHERE ImageID = %s AND ItemID = %s",
            (image_id, item_id),
        )
        if cursor.fetchone() is None:
            abort(404)

    with get_cursor(current_app, commit=True) as cursor:
        cursor.execute(
            "UPDATE museum_item_images SET Is_Cover = FALSE WHERE ItemID = %s",
            (item_id,),
        )
        cursor.execute(
            "UPDATE museum_item_images SET Is_Cover = TRUE "
            "WHERE ImageID = %s AND ItemID = %s",
            (image_id, item_id),
        )

    flash("Cover image updated.", "success")
    log_action(
        "image_set_cover",
        "item_image",
        image_id,
        f"Set image #{image_id} as cover for item #{item_id}",
    )
    return redirect(url_for("admin.item_detail", item_id=item_id))


@admin_bp.route(
    "/items/<int:item_id>/images/<int:image_id>/delete", methods=["POST"]
)
@login_required
def image_delete(item_id, image_id):
    """Delete an image from Cloudinary and the database.

    The image must belong to this item (checked before any deletion).
    """
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT Image_Public_ID, Is_Cover FROM museum_item_images "
            "WHERE ImageID = %s AND ItemID = %s",
            (image_id, item_id),
        )
        image = cursor.fetchone()
    if image is None:
        abort(404)

    try:
        destroy_image(image["Image_Public_ID"])
    except Exception as exc:  # noqa: BLE001 - do not remove record if storage fails
        current_app.logger.error("Cloudinary delete failed: %s", exc)
        flash("Could not delete the image from storage. Nothing was removed.", "error")
        return redirect(url_for("admin.item_detail", item_id=item_id))

    with get_cursor(current_app, commit=True) as cursor:
        cursor.execute(
            "DELETE FROM museum_item_images WHERE ImageID = %s AND ItemID = %s",
            (image_id, item_id),
        )
        if image["Is_Cover"]:
            cursor.execute(
                "SELECT ImageID FROM museum_item_images WHERE ItemID = %s "
                "ORDER BY Sort_Order, ImageID LIMIT 1",
                (item_id,),
            )
            replacement = cursor.fetchone()
            if replacement:
                cursor.execute(
                    "UPDATE museum_item_images SET Is_Cover = TRUE "
                    "WHERE ImageID = %s",
                    (replacement[0],),
                )

    flash("Image deleted.", "success")
    log_action(
        "image_delete",
        "item_image",
        image_id,
        f"Deleted image #{image_id} from item #{item_id}",
    )
    return redirect(url_for("admin.item_detail", item_id=item_id))


@admin_bp.route("/categories")
@login_required
def categories():
    """List categories with the number of items using each one."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT CategoryID, Category_Name, Description FROM categories "
            "ORDER BY Category_Name"
        )
        rows = cursor.fetchall()
        cursor.execute(
            "SELECT CategoryID, COUNT(*) AS c FROM museum_items "
            "WHERE CategoryID IS NOT NULL GROUP BY CategoryID"
        )
        item_counts = {row["CategoryID"]: row["c"] for row in cursor.fetchall()}

    return render_template(
        "admin_categories.html", categories=rows, item_counts=item_counts
    )


def _category_name_exists(name, exclude_id=None):
    """True if a category with this name already exists (case-insensitive)."""
    sql = "SELECT 1 FROM categories WHERE Category_Name = %s"
    params = [name]
    if exclude_id is not None:
        sql += " AND CategoryID <> %s"
        params.append(exclude_id)
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(sql, params)
        return cursor.fetchone() is not None


@admin_bp.route("/categories/new", methods=["GET", "POST"])
@login_required
def category_new():
    form = CategoryForm()
    if form.validate_on_submit():
        name = form.name.data.strip()
        description = (form.description.data or "").strip() or None

        if _category_name_exists(name):
            flash(f"A category named '{name}' already exists.", "error")
        else:
            try:
                with get_cursor(current_app, commit=True) as cursor:
                    cursor.execute(
                        "INSERT INTO categories (Category_Name, Description) "
                        "VALUES (%s, %s)",
                        (name, description),
                    )
                    new_category_id = cursor.lastrowid
            except IntegrityError:
                # Unique constraint race — treat the same as a duplicate.
                flash(f"A category named '{name}' already exists.", "error")
            else:
                log_action(
                    "category_create",
                    "category",
                    new_category_id,
                    f"Created category '{name}'",
                )
                flash(f"Category '{name}' created.", "success")
                return redirect(url_for("admin.categories"))

    return render_template("admin_category_form.html", form=form, mode="new")


@admin_bp.route("/categories/<int:category_id>/edit", methods=["GET", "POST"])
@login_required
def category_edit(category_id):
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT CategoryID, Category_Name, Description FROM categories "
            "WHERE CategoryID = %s",
            (category_id,),
        )
        category = cursor.fetchone()

    if category is None:
        abort(404)

    form = CategoryForm()
    if form.validate_on_submit():
        name = form.name.data.strip()
        description = (form.description.data or "").strip() or None

        if _category_name_exists(name, exclude_id=category_id):
            flash(f"A category named '{name}' already exists.", "error")
        else:
            try:
                with get_cursor(current_app, commit=True) as cursor:
                    cursor.execute(
                        "UPDATE categories SET Category_Name = %s, Description = %s "
                        "WHERE CategoryID = %s",
                        (name, description, category_id),
                    )
            except IntegrityError:
                flash(f"A category named '{name}' already exists.", "error")
            else:
                log_action(
                    "category_update",
                    "category",
                    category_id,
                    f"Updated category '{name}'",
                )
                flash(f"Category '{name}' updated.", "success")
                return redirect(url_for("admin.categories"))
    elif request.method == "GET":
        form.name.data = category["Category_Name"]
        form.description.data = category["Description"]

    return render_template(
        "admin_category_form.html", form=form, mode="edit", category=category
    )


@admin_bp.route("/categories/<int:category_id>/delete", methods=["POST"])
@login_required
def category_delete(category_id):
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT Category_Name FROM categories WHERE CategoryID = %s",
            (category_id,),
        )
        category = cursor.fetchone()
        if category is None:
            abort(404)
        cursor.execute(
            "SELECT COUNT(*) AS c FROM museum_items WHERE CategoryID = %s",
            (category_id,),
        )
        items_in_use = cursor.fetchone()["c"]

    if items_in_use:
        flash(
            f"Cannot delete '{category['Category_Name']}': "
            f"{items_in_use} item(s) still use this category. "
            "Reassign those items first.",
            "error",
        )
        return redirect(url_for("admin.categories"))

    with get_cursor(current_app, commit=True) as cursor:
        cursor.execute("DELETE FROM categories WHERE CategoryID = %s", (category_id,))

    log_action(
        "category_delete",
        "category",
        category_id,
        f"Deleted category '{category['Category_Name']}'",
    )
    flash(f"Category '{category['Category_Name']}' deleted.", "success")
    return redirect(url_for("admin.categories"))


@admin_bp.route("/logs")
@role_required("admin")
def logs():
    """Admin-only activity log, newest first, paginated."""
    per_page = 25
    page = max(1, request.args.get("page", 1, type=int))

    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute("SELECT COUNT(*) AS c FROM activity_logs")
        total = cursor.fetchone()["c"]

        total_pages = max(1, (total + per_page - 1) // per_page)
        page = min(page, total_pages)
        offset = (page - 1) * per_page

        cursor.execute(
            "SELECT l.LogID, l.Action, l.Entity_Type, l.Entity_ID, l.Details, "
            "       l.Created_At, a.Username "
            "FROM activity_logs l "
            "LEFT JOIN admins a ON l.AdminID = a.AdminID "
            "ORDER BY l.LogID DESC LIMIT %s OFFSET %s",
            (per_page, offset),
        )
        entries = cursor.fetchall()

    return render_template(
        "admin_logs.html",
        entries=entries,
        page=page,
        total_pages=total_pages,
        total=total,
    )


@admin_bp.route("/accounts")
@role_required("admin")
def accounts():
    """Placeholder — staff account management has not been scheduled yet."""
    return render_template(
        "admin_placeholder.html",
        title="Manage Accounts",
        milestone="a future milestone",
    )
