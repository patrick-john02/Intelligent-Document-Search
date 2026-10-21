import { api, API_SOURCE, ApiError, getStoredToken } from "./api";

// Matches ClearanceLevel enum in api/models/enums/docs.py
export type ClearanceLevelValue = "public" | "internal" | "confidential" | "secret" | "top_secret";

export const CLEARANCE_OPTIONS: { value: ClearanceLevelValue; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "confidential", label: "Confidential" },
  { value: "secret", label: "Secret" },
  { value: "top_secret", label: "Top Secret" },
];

export interface DocumentCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface UploadMetadata {
  title: string;
  departmentOrder: string;
  seriesDate: string; // YYYY-MM-DD
  physicalShelfLocation: string;
  categoryId: number;
  clearanceLevel: ClearanceLevelValue;
}

// Matches DocumentUploadResponseSchema
export interface UploadedDocument {
  id: number;
  filename: string;
  checksum: string;
  status: string;
  version_id: number | null;
}

export const listCategories = () => api.get<DocumentCategory[]>("/categories/list");

// POST /api/documents/upload (multipart form; field names must match the FastAPI Form(...) params)
export const uploadDocument = (file: File, meta: UploadMetadata) => {
  const form = new FormData();
  form.append("file", file);
  form.append("title", meta.title);
  form.append("department_order", meta.departmentOrder);
  form.append("series_years", meta.seriesDate);
  form.append("physical_shelf_locations", meta.physicalShelfLocation);
  form.append("document_category_id", String(meta.categoryId));
  form.append("clearance_level", meta.clearanceLevel);
  return api.post<UploadedDocument>("/documents/upload", form);
};

// ---------- Document list / detail / download ----------

// Matches CreatedBySchema
export interface ApiUser {
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  position: string;
  office: string;
  division: string;
}

// Matches DocumentVersionSchema
export interface ApiDocumentVersion {
  id: number;
  document_id: number;
  storage_path: string;
  file_name: string;
  file_extension: string;
  file_size: number;
  version_number: number;
  status: string; // uploaded | extracting | classifying | chunking | embedding | indexed | failed: ...
  is_current: boolean;
  uploaded_by: ApiUser | null;
}

// Matches DocumentSchema
export interface ApiDocument {
  id: number;
  title: string | null;
  department_order: string | null;
  series_years: string; // YYYY-MM-DD
  physical_shelf_location: string | null;
  versions: ApiDocumentVersion[];
  status: { name: string } | null;
  is_deleted: boolean;
  document_tag_assignments: {
    confidence_score: number;
    document_tag: { name: string; color_code: string };
  }[];
  category: { name: string } | null;
  created_by: ApiUser | null;
  clearance_level: ClearanceLevelValue;
  created_at: string;
  updated_at: string | null;
}

export const getAllDocuments = () => api.get<ApiDocument[]>("/documents/all");

export const getDocument = (documentId: number) => api.get<ApiDocument>(`/documents/${documentId}`);

// The download endpoint returns a file (not JSON) and needs the auth header,
// so it can't be a plain <a href>. Fetch it as a Blob instead.
export async function downloadDocumentVersion(versionId: number): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(`${API_SOURCE}/documents/version/${versionId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let message = response.statusText || "Download failed";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(response.status, message);
  }
  return response.blob();
}

// Triggers a browser "save file" for a Blob
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
