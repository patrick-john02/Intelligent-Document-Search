export type ClearanceLevel = "Public" | "Internal" | "Restricted" | "Confidential";

export interface PhysicalCoordinates {
  cabinet: string;
  shelf: string;
  binder: string;
  barcode: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  clearance: ClearanceLevel;
  dateBookmarked: string;
  collection: string;
  personalNotes?: string;
  tags: string[];
  shelfLocation: PhysicalCoordinates;
  fileSize: string;
  pageCount: number;
  isPinned?: boolean;
  officialDate?: string;
}

export interface BookmarkMetrics {
  totalSaved: number;
  collectionsCount: number;
  pinnedCount: number;
  physicalOnShelfCount: number;
}
