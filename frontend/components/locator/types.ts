export interface PhysicalDocumentItem {
  id: string;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  cabinet: string;
  shelf: string;
  shelfLevel: number; // 1 to 4
  binder: string;
  barcode: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential";
  status: "On Shelf" | "Checked Out" | "Under Audit";
  custodyOfficer?: string;
}

export interface CabinetUnit {
  id: string;
  name: string;
  room: string;
  totalCapacity: number;
  currentCount: number;
  primaryCategory: string;
  shelvesCount: number;
}
