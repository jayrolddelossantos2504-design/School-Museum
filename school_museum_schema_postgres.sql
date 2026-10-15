-- School Museum Website Database Design
-- PostgreSQL 12+
-- This file creates the database schema and starter categories.
-- It intentionally does NOT create a default administrator account.
-- Create the first administrator using a secure setup script/CLI command
-- that hashes the password; never store a plain-text password here.

-- Note: Database must already exist (created by Render.com)
-- This script only creates tables and inserts starter data.

CREATE TABLE IF NOT EXISTS admins (
    AdminID SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'editor' CHECK (Role IN ('admin', 'editor')),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    CategoryID SERIAL PRIMARY KEY,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT NULL,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS museum_items (
    ItemID SERIAL PRIMARY KEY,
    Public_Token CHAR(36) NOT NULL UNIQUE,
    Item_Name VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Historical_Details TEXT NULL,
    CategoryID INT NULL,
    CreatedBy INT NULL,
    UpdatedBy INT NULL,
    IsPublished BOOLEAN NOT NULL DEFAULT FALSE,
    IsArchived BOOLEAN NOT NULL DEFAULT FALSE,
    Date_Added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_museum_items_category
        FOREIGN KEY (CategoryID)
        REFERENCES categories(CategoryID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_museum_items_created_by
        FOREIGN KEY (CreatedBy)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_museum_items_updated_by
        FOREIGN KEY (UpdatedBy)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_museum_items_name ON museum_items (Item_Name);
CREATE INDEX IF NOT EXISTS idx_museum_items_category ON museum_items (CategoryID);
CREATE INDEX IF NOT EXISTS idx_museum_items_public ON museum_items (IsPublished, IsArchived);
CREATE INDEX IF NOT EXISTS idx_museum_items_date ON museum_items (Date_Added);

CREATE TABLE IF NOT EXISTS museum_item_images (
    ImageID SERIAL PRIMARY KEY,
    ItemID INT NOT NULL,
    Image_URL VARCHAR(1000) NOT NULL,
    Image_Public_ID VARCHAR(255) NOT NULL,
    Alt_Text VARCHAR(255) NULL,
    Caption VARCHAR(500) NULL,
    Is_Cover BOOLEAN NOT NULL DEFAULT FALSE,
    Sort_Order INT NOT NULL DEFAULT 0,
    UploadedBy INT NULL,
    Uploaded_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_images_item
        FOREIGN KEY (ItemID)
        REFERENCES museum_items(ItemID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_item_images_uploaded_by
        FOREIGN KEY (UploadedBy)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_item_images_item_sort ON museum_item_images (ItemID, Sort_Order);
CREATE INDEX IF NOT EXISTS idx_item_images_cover ON museum_item_images (ItemID, Is_Cover);

CREATE TABLE IF NOT EXISTS activity_logs (
    LogID BIGSERIAL PRIMARY KEY,
    AdminID INT NULL,
    Action VARCHAR(100) NOT NULL,
    Entity_Type VARCHAR(100) NOT NULL,
    Entity_ID VARCHAR(100) NULL,
    Details TEXT NULL,
    IP_Address VARCHAR(45) NULL,
    Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_logs_admin
        FOREIGN KEY (AdminID)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs (AdminID);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs (Timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs (Entity_Type, Entity_ID);

-- Insert starter categories
INSERT INTO categories (Category_Name, Description) VALUES
    ('Historical Artifacts', 'Important items from school history'),
    ('Student Memorabilia', 'Items created by or belonging to students'),
    ('School Documents', 'Official records and documents'),
    ('Photographs', 'Historical and recent school photographs'),
    ('Awards & Recognition', 'Trophies, medals, and certificates'),
    ('School Uniforms', 'Historical school uniforms and attire')
ON CONFLICT (Category_Name) DO NOTHING;
