export interface ArchiveDocument {
  id: string | number;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential";
  cabinet: string;
  shelf: string;
  folder: string;
  shelfLocation: string;
  ocrAccuracy: number; // e.g. 98.4
  fileSize: string;
  pageCount: number;
  version: string;
  ingestedDate: string;
  status: "Indexed" | "Processing" | "Archived";
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
}
