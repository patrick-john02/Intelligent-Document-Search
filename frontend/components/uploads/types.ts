export type UploadPipelineStatus =
  | "Published"
  | "Processing"
  | "Needs Review"
  | "Draft"
  // Backwards-compatible aliases
  | "Completed"
  | "OCR Processing"
  | "Vectorizing"
  | "Review Required";

export interface PipelineStageInfo {
  status: "completed" | "processing" | "pending" | "failed";
  timestamp?: string;
  detail?: string;
}

export interface VersionEntry {
  version: string;
  date: string;
  fileName: string;
  uploadedBy: string;
  notes?: string;
}

export interface StaffUploadItem {
  id: string;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential";
  fileName: string;
  fileSize: string;
  pageCount: number;
  uploadedAt: string;
  status: UploadPipelineStatus;
  version: string;
  versionHistory: VersionEntry[];
  shelfLocation: {
    cabinet: string;
    shelf: string;
    binder: string;
    barcode: string;
    tagged: boolean;
  };
  stages: {
    upload: PipelineStageInfo;
    textExtraction: PipelineStageInfo;
    indexing: PipelineStageInfo;
    physicalTag: PipelineStageInfo;
    status: PipelineStageInfo;
  };
  extractedSummary: string;
  notes?: string;
  uploadedBy?: {
    name: string;
    division: string;
    position?: string;
    avatar?: string;
  };
}

export interface UploadMetrics {
  totalUploads: number;
  indexedCount: number;
  processingCount: number;
  reviewRequiredCount: number;
  categoriesCount: number;
}

// ==========================================
// Extended Personal Files & Google Drive Types
// ==========================================

export type GoogleSyncStatus = "synced" | "local_only" | "syncing" | "cloud_only" | "error";

export type PersonalFileCategory =
  | "Directives"
  | "Reports"
  | "Forms"
  | "Drafts"
  | "Personal Notes"
  | "General";

export interface PersonalFileItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes?: number;
  mimeType?: string;
  fileExtension: "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "image" | "other";
  uploadedAt: string;
  lastModified: string;
  category: PersonalFileCategory;
  tags: string[];
  isStarred?: boolean;

  // Google Drive Extended Attributes
  isGoogleDriveSynced: boolean;
  googleSyncStatus: GoogleSyncStatus;
  googleDriveFileId?: string;
  googleDriveWebViewLink?: string;
  googleDriveFolder?: string;
  lastSyncedAt?: string;

  // OCR & Intelligence Metadata
  ocrStatus: "completed" | "processing" | "pending" | "failed";
  extractedSummary?: string;
  extractedTextSnippet?: string;
  pageCount?: number;

  // Author & Version info
  version?: string;
  uploadedBy?: {
    name: string;
    email?: string;
    avatar?: string;
  };
}

export interface GoogleDriveAccountMeta {
  isConnected: boolean;
  email?: string;
  storageUsedFormatted?: string;
  storageTotalFormatted?: string;
  storagePercent?: number;
  lastFullSync?: string;
  targetFolder?: string;
}

export interface PersonalFileMetrics {
  totalFiles: number;
  syncedDriveCount: number;
  localVaultCount: number;
  starredCount: number;
}
