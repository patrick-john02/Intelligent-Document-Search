export type SearchMode = "smart" | "keyword";

export interface SearchResultItem {
  id: string | number;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  category: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential" | string;
  relevanceScore?: number; // 0 to 1
  shelfLocation: string;
  excerptSnippet: string;
  summary?: string;
  fileSize?: string;
  pageCount?: number;
  ingestedDate?: string;
  tags?: string[];
}

export type SortOption = "relevance" | "newest" | "oldest" | "title";
