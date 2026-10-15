-- School Museum Website Database Design
-- MySQL 8+ / compatible MariaDB versions
-- This file creates the database schema and starter categories.
-- It intentionally does NOT create a default administrator account.
-- Create the first administrator using a secure setup script/CLI command
-- that hashes the password; never store a plain-text password here.

CREATE DATABASE IF NOT EXISTS school_museum
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE school_museum;

CREATE TABLE IF NOT EXISTS admins (
    AdminID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
    CategoryID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT NULL,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS museum_items (
    ItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    Public_Token CHAR(36) NOT NULL UNIQUE,
    Item_Name VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Historical_Details TEXT NULL,
    CategoryID INT UNSIGNED NULL,
    CreatedBy INT UNSIGNED NULL,
    UpdatedBy INT UNSIGNED NULL,
    IsPublished BOOLEAN NOT NULL DEFAULT FALSE,
    IsArchived BOOLEAN NOT NULL DEFAULT FALSE,
    Date_Added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

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
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_museum_items_name (Item_Name),
    INDEX idx_museum_items_category (CategoryID),
    INDEX idx_museum_items_public (IsPublished, IsArchived),
    INDEX idx_museum_items_date (Date_Added)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS museum_item_images (
    ImageID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ItemID INT UNSIGNED NOT NULL,
    Image_URL VARCHAR(1000) NOT NULL,
    Image_Public_ID VARCHAR(255) NOT NULL,
    Alt_Text VARCHAR(255) NULL,
    Caption VARCHAR(500) NULL,
    Is_Cover BOOLEAN NOT NULL DEFAULT FALSE,
    Sort_Order INT UNSIGNED NOT NULL DEFAULT 0,
    UploadedBy INT UNSIGNED NULL,
    Uploaded_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_images_item
        FOREIGN KEY (ItemID)
        REFERENCES museum_items(ItemID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_item_images_uploaded_by
        FOREIGN KEY (UploadedBy)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_item_images_item_sort (ItemID, Sort_Order),
    INDEX idx_item_images_cover (ItemID, Is_Cover)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
    LogID BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    AdminID INT UNSIGNED NULL,
    Action VARCHAR(100) NOT NULL,
    Entity_Type VARCHAR(100) NOT NULL,
    Entity_ID VARCHAR(100) NULL,
    Details TEXT NULL,
    Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_logs_admin
        FOREIGN KEY (AdminID)
        REFERENCES admins(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_activity_logs_admin_date (AdminID, Created_At),
    INDEX idx_activity_logs_entity (Entity_Type, Entity_ID),
    INDEX idx_activity_logs_date (Created_At)
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (Category_Name, Description) VALUES
    ('Historical Artifacts', 'Objects connected to the school or its history'),
    ('Photographs', 'Historical and contemporary photographs'),
    ('Documents', 'Letters, records, certificates, and other documents'),
    ('Memorabilia', 'School uniforms, awards, keepsakes, and souvenirs');

-- Relationships:
-- admins (1) to (many) museum_items through CreatedBy / UpdatedBy
-- categories (1) to (many) museum_items
-- museum_items (1) to (many) museum_item_images
-- admins (1) to (many) museum_item_images through UploadedBy
-- admins (1) to (many) activity_logs
