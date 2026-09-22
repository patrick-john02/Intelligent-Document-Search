export type UploadPipelineStatus =
  | "Published"
  | "Processing"
  | "Needs Review"
  | "Draft"
  // Backwards-compatible aliases if needed
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
