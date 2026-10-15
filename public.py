"""Public-facing routes: home, collection, categories, and item detail.

Every query here returns only items that are published and not archived.
Internal admin fields (creator, Cloudinary public IDs, etc.) are never sent
to these templates.
"""

import io
import math

from flask import Blueprint, abort, current_app, render_template, request, send_file

from database import get_cursor
from qr_service import build_item_url, generate_qr_png

public_bp = Blueprint("public", __name__)

PAGE_SIZE = 12
HOME_FEATURED = 6

# Items visible to the public must satisfy both conditions every time.
PUBLIC_VISIBLE = "mi.IsPublished = TRUE AND mi.IsArchived = FALSE"

# Cover image for each item (tailored to the alias `mi`).
COVER_JOIN = (
    "LEFT JOIN museum_item_images img "
    "ON img.ItemID = mi.ItemID AND img.Is_Cover = TRUE"
)


@public_bp.route("/")
def index():
    """Home page with a few recently added published items."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.ItemID, mi.Public_Token, mi.Item_Name, mi.Description, "
            "       c.Category_Name, img.Image_URL AS Cover_URL, "
            "       img.Alt_Text AS Cover_Alt "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            f"{COVER_JOIN} "
            f"WHERE {PUBLIC_VISIBLE} "
            "ORDER BY mi.Date_Added DESC LIMIT %s",
            (HOME_FEATURED,),
        )
        featured = cursor.fetchall()

        cursor.execute(
            f"SELECT COUNT(*) AS c FROM museum_items mi WHERE {PUBLIC_VISIBLE}"
        )
        items_total = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) AS c FROM categories")
        categories_total = cursor.fetchone()["c"]

        cursor.execute("SELECT COUNT(*) AS c FROM museum_item_images")
        images_total = cursor.fetchone()["c"]

    stats = {
        "items": items_total,
        "categories": categories_total,
        "images": images_total,
    }
    return render_template("index.html", featured=featured, stats=stats)


@public_bp.route("/collection")
def collection():
    """Browse published items with search, category filter, and pagination."""
    query = (request.args.get("q") or "").strip()
    category_id = request.args.get("category", type=int)
    page = max(request.args.get("page", 1, type=int) or 1, 1)

    where = [PUBLIC_VISIBLE]
    params = []

    if query:
        where.append("(mi.Item_Name LIKE %s OR mi.Description LIKE %s)")
        like = f"%{query}%"
        params.extend([like, like])

    if category_id:
        where.append("mi.CategoryID = %s")
        params.append(category_id)

    where_sql = " AND ".join(where)

    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            f"SELECT COUNT(*) AS c FROM museum_items mi WHERE {where_sql}",
            params,
        )
        total = cursor.fetchone()["c"]

        total_pages = max(math.ceil(total / PAGE_SIZE), 1)
        page = min(page, total_pages)
        offset = (page - 1) * PAGE_SIZE

        cursor.execute(
            "SELECT mi.ItemID, mi.Public_Token, mi.Item_Name, mi.Description, "
            "       mi.Date_Added, c.Category_Name, img.Image_URL AS Cover_URL, "
            "       img.Alt_Text AS Cover_Alt "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            f"{COVER_JOIN} "
            f"WHERE {where_sql} "
            "ORDER BY mi.Date_Added DESC, mi.ItemID DESC "
            "LIMIT %s OFFSET %s",
            params + [PAGE_SIZE, offset],
        )
        items = cursor.fetchall()

        cursor.execute(
            "SELECT CategoryID, Category_Name FROM categories ORDER BY Category_Name"
        )
        categories = cursor.fetchall()

    return render_template(
        "collection.html",
        items=items,
        categories=categories,
        query=query,
        selected_category=category_id,
        page=page,
        total_pages=total_pages,
        total=total,
    )


@public_bp.route("/categories")
def categories():
    """List categories with the number of publicly visible items."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT c.CategoryID, c.Category_Name, c.Description, "
            "  (SELECT COUNT(*) FROM museum_items mi "
            "   WHERE mi.CategoryID = c.CategoryID "
            f"     AND {PUBLIC_VISIBLE}) AS Published_Items "
            "FROM categories c ORDER BY c.Category_Name"
        )
        rows = cursor.fetchall()
    return render_template("categories.html", categories=rows)


@public_bp.route("/general-tinio")
def general_tinio():
    """Curated page for the school's namesake, General Manuel Tinio.

    Highlights a published "Tinio" exhibit when one exists, and otherwise
    still renders the historical narrative.
    """
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.ItemID, mi.Public_Token, mi.Item_Name, mi.Description, "
            "       c.Category_Name, img.Image_URL AS Cover_URL "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            f"{COVER_JOIN} "
            f"WHERE {PUBLIC_VISIBLE} AND mi.Item_Name LIKE %s "
            "ORDER BY mi.Date_Added DESC LIMIT 1",
            ("%Tinio%",),
        )
        tinio_item = cursor.fetchone()

    return render_template("general_tinio.html", tinio_item=tinio_item)


@public_bp.route("/visitor-guide")
def visitor_guide():
    """Practical visit information, gallery directory, and QR how-to."""
    return render_template("visitor_guide.html")


@public_bp.route("/item/<token>")
def item_detail(token):
    """Public detail page for one published item, found by its token."""
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.ItemID, mi.Public_Token, mi.Item_Name, mi.Description, "
            "       mi.Historical_Details, mi.Date_Added, c.Category_Name "
            "FROM museum_items mi "
            "LEFT JOIN categories c ON mi.CategoryID = c.CategoryID "
            "WHERE mi.Public_Token = %s "
            f"  AND {PUBLIC_VISIBLE}",
            (token,),
        )
        item = cursor.fetchone()

        if item is None:
            # Unknown token, or a draft/archived item -> proper 404.
            abort(404)

        cursor.execute(
            "SELECT Image_URL, Alt_Text, Caption, Is_Cover, Sort_Order "
            "FROM museum_item_images WHERE ItemID = %s "
            "ORDER BY Is_Cover DESC, Sort_Order, ImageID",
            (item["ItemID"],),
        )
        images = cursor.fetchall()

    return render_template("item_detail.html", item=item, images=images)


@public_bp.route("/item/<token>/qr.png")
def item_qr_png(token):
    """Public QR code (PNG) that encodes the item's permanent public URL.

    Only published items are eligible, so draft/archived tokens 404 just like
    the detail page.
    """
    with get_cursor(current_app, dictionary=True) as cursor:
        cursor.execute(
            "SELECT mi.Public_Token FROM museum_items mi "
            "WHERE mi.Public_Token = %s "
            f"  AND {PUBLIC_VISIBLE}",
            (token,),
        )
        row = cursor.fetchone()

    if row is None:
        abort(404)

    public_url = build_item_url(current_app, row["Public_Token"])
    png = generate_qr_png(public_url)
    return send_file(
        io.BytesIO(png),
        mimetype="image/png",
        download_name=f"qr-{row['Public_Token']}.png",
    )
