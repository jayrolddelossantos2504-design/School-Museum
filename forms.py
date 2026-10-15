"""WTForms form definitions."""

from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileField, FileRequired
from wtforms import (
    BooleanField,
    PasswordField,
    SelectField,
    StringField,
    SubmitField,
    TextAreaField,
)
from wtforms.validators import DataRequired, Length, Optional


class LoginForm(FlaskForm):
    """Staff login form. CSRF protection is added automatically by
    CSRFProtect (see extensions.py) plus Flask-WTF."""

    username = StringField("Username", validators=[DataRequired(), Length(max=100)])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Log in")


class CategoryForm(FlaskForm):
    """Add/edit a museum category."""

    name = StringField(
        "Category name",
        validators=[DataRequired(), Length(max=100)],
    )
    description = TextAreaField(
        "Description (optional)",
        validators=[Optional(), Length(max=2000)],
    )
    submit = SubmitField("Save category")


class ItemForm(FlaskForm):
    """Create/edit a museum item (text and metadata only for now)."""

    name = StringField(
        "Item name",
        validators=[DataRequired(), Length(max=200)],
    )
    description = TextAreaField(
        "Public description",
        validators=[DataRequired()],
    )
    historical_details = TextAreaField(
        "Historical details (optional)",
        validators=[Optional()],
    )
    # Choices are supplied by the route so they always reflect the database.
    category_id = SelectField(
        "Category",
        coerce=int,
        validators=[Optional()],
    )
    is_published = BooleanField("Published")
    submit = SubmitField("Save item")


class ImageForm(FlaskForm):
    """Upload an image for a museum item.

    ``FileAllowed`` checks the extension; ``image_service.validate_image``
    then verifies the real content with Pillow.
    """

    image = FileField(
        "Image file",
        validators=[
            FileRequired(),
            FileAllowed(sorted(["jpg", "jpeg", "png", "gif", "webp"]), "Images only."),
        ],
    )
    caption = StringField(
        "Caption (optional)",
        validators=[Optional(), Length(max=500)],
    )
    alt_text = StringField(
        "Alt text (optional)",
        validators=[Optional(), Length(max=255)],
    )
    is_cover = BooleanField("Set as cover image")
    submit = SubmitField("Upload image")
