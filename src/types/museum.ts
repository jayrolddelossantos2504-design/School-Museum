export type AdminRole = 'admin' | 'editor';

export interface AdminUser {
  adminId: number;
  username: string;
  role: AdminRole;
  isActive: boolean;
  name: string;
}

export interface MuseumCategory {
  categoryId: number;
  categoryName: string;
  description: string;
  itemCount?: number;
}

export interface MuseumImage {
  imageId: number;
  itemId: number;
  imageUrl: string;
  imagePublicId: string;
  isCover: boolean;
  caption?: string;
  uploadedAt: string;
}

export interface MuseumItem {
  itemId: number;
  publicToken: string; // Permanent UUID / identifier for QR codes
  itemName: string;
  description: string;
  historicalDetails: string;
  categoryId: number;
  categoryName?: string;
  accessionNumber: string; // e.g. "ACC.GTNHS.1966.001"
  era: string; // e.g. "Revolutionary Era (1896-1898)" or "Post-War Republic (1960s)"
  dimensions?: string;
  mediumMaterials?: string;
  provenance: string; // Donation or acquisition history
  locationInMuseum: string; // e.g. "Cabinet A-2, North Gallery"
  curatorNotes?: string;
  isPublished: boolean;
  isArchived: boolean;
  createdBy: number;
  updatedBy: number;
  dateAdded: string;
  updatedAt: string;
  images: MuseumImage[];
}

export interface ActivityLog {
  logId: number;
  adminId: number;
  adminUsername: string;
  action: 'CREATE' | 'UPDATE' | 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE' | 'UNARCHIVE' | 'DELETE' | 'IMAGE_UPLOAD';
  entityType: 'MUSEUM_ITEM' | 'CATEGORY' | 'ADMIN';
  entityId: string;
  details: string;
  timestamp: string;
}
