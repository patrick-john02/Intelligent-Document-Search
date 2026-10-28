import { api } from "./api";

// A document the user can target with "@" in chat (from GET /chat/mentionable-documents)
export interface MentionableDocument {
  id: number;            // document id -> sent as attachment_ids
  versionId: number;
  title: string;
  fileName: string;
  label: string;         // short token shown in the message: @[label]
  docType: string | null;
  seriesYear: number | null;
  shelfLocation: string | null;
  clearance: string;
}

// Backend shape (MentionableDocumentOut in api/schema/chat_schema.py)
interface MentionableDocumentApi {
  id: number;
  version_id: number;
  title: string;
  file_name: string;
  doc_type: string | null;
  series_year: number | null;
  shelf_location: string | null;
  clearance: string;
}

// "2024-11-20-CLR-01.pdf" -> "2024-11-20-CLR-01". No spaces or brackets, so it fits the @[...] chip format.
export const mentionLabel = (fileName: string, title: string): string =>
  (fileName.replace(/\.[^/.]+$/, "") || title).replace(/[[\]\s]+/g, "-");

const toMentionable = (d: MentionableDocumentApi): MentionableDocument => ({
  id: d.id,
  versionId: d.version_id,
  title: d.title,
  fileName: d.file_name,
  label: mentionLabel(d.file_name, d.title),
  docType: d.doc_type,
  seriesYear: d.series_year,
  shelfLocation: d.shelf_location,
  clearance: d.clearance,
});

// Server-side search: only documents this user may see and that finished indexing
export const searchMentionableDocuments = async (
  q: string,
  limit = 8,
  signal?: AbortSignal
): Promise<MentionableDocument[]> => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q.trim()) params.set("q", q.trim());
  const data = await api.get<MentionableDocumentApi[]>(`/chat/mentionable-documents?${params}`, { signal });
  return data.map(toMentionable);
};
