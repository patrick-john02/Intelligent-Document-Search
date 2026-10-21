export type DocumentFileType = "pdf" | "xlsx" | "docx";

export type DocumentClearance = "Public" | "Internal" | "Restricted" | "Confidential";
export type DocumentClearanceFilterOption = "All" | DocumentClearance;

export interface ArchiveDocument {
  id: string | number;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  clearance: DocumentClearance;
  cabinet: string;
  shelf: string;
  folder: string;
  folderId?: string;
  shelfLocation: string;
  ocrAccuracy: number; // e.g. 98.4
  fileSize: string;
  pageCount: number;
  fileType: DocumentFileType;
  fileName?: string;
  version: string;
  ingestedDate: string; // ISO date format YYYY-MM-DD
  status: "Indexed" | "Processing" | "Archived" | "Failed";
  // Set for documents loaded from the backend (GET /api/documents/all)
  currentVersionId?: number;
  fileExtension?: string; // real extension, e.g. "png" (fileType only covers pdf/xlsx/docx)
  ingestionStatus?: string; // raw document_version.status from the pipeline
  tags: { name: string; score: number }[];
  summary: string;
  uploadedBy?: {
    name: string;
    division: string;
    position?: string;
    avatar?: string;
  };
  executiveBrief?: {
    statutoryMandate: string;
    targetEntities: string;
    archivalDisposition: string;
  };
  // Soft Delete Lifecycle
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
}

export type DocumentSortOption =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "order-asc"
  | "size-desc"
  | "type";

export interface ArchiveFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  iconBg?: string;
  createdAt?: string;
  // Soft Delete Lifecycle
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}
