import { ApiDocument, ApiDocumentVersion, ClearanceLevelValue } from "@/lib/documentsApi";
import { ArchiveDocument, DocumentClearance, DocumentFileType } from "./types";
import { formatFileSize } from "./useArchivingTask";

const UI_CLEARANCE: Record<ClearanceLevelValue, DocumentClearance> = {
  public: "Public",
  internal: "Internal",
  confidential: "Confidential",
  secret: "Restricted",
  top_secret: "Restricted",
};

// Current version if flagged, otherwise the highest version number
export function pickCurrentVersion(doc: ApiDocument): ApiDocumentVersion | undefined {
  return (
    doc.versions.find((v) => v.is_current) ??
    [...doc.versions].sort((a, b) => b.version_number - a.version_number)[0]
  );
}

// Pipeline status -> UI badge
function toUiStatus(versionStatus: string | undefined): ArchiveDocument["status"] {
  const s = (versionStatus || "").toLowerCase();
  if (s === "indexed") return "Indexed";
  if (s.startsWith("failed")) return "Failed";
  return "Processing"; // uploaded, extracting, classifying, chunking, embedding...
}

function toFileType(ext: string): DocumentFileType {
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return "xlsx";
  if (ext === "docx" || ext === "doc") return "docx";
  return "pdf";
}

// "Cabinet A • Shelf 1 • Binder 01" -> ["Cabinet A", "Shelf 1", "Binder 01"]
function splitShelfLocation(location: string | null) {
  const parts = (location || "").split("•").map((p) => p.trim());
  return { cabinet: parts[0] || "", shelf: parts[1] || "", folder: parts[2] || "" };
}

function fullName(u: ApiDocument["created_by"]): string {
  if (!u) return "Unknown";
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
}

export function apiDocumentToArchive(doc: ApiDocument): ArchiveDocument {
  const version = pickCurrentVersion(doc);
  const ext = (version?.file_extension || version?.file_name.split(".").pop() || "").toLowerCase();
  const { cabinet, shelf, folder } = splitShelfLocation(doc.physical_shelf_location);
  const status = toUiStatus(version?.status);

  return {
    id: doc.id,
    title: doc.title || version?.file_name || `Document #${doc.id}`,
    orderNo: doc.department_order || "",
    seriesYear: Number((doc.series_years || "").slice(0, 4)) || "",
    category: doc.category?.name || "Uncategorized",
    clearance: UI_CLEARANCE[doc.clearance_level] ?? "Public",
    cabinet,
    shelf,
    folder,
    shelfLocation: doc.physical_shelf_location || "",
    ocrAccuracy: 0, // not returned by /documents/all
    fileSize: version ? formatFileSize(version.file_size) : "0 Bytes",
    pageCount: 0, // not returned by /documents/all
    fileType: toFileType(ext),
    fileName: version?.file_name,
    version: version ? `v${version.version_number}.0` : "v1.0",
    ingestedDate: (doc.created_at || "").split("T")[0],
    status,
    tags: doc.document_tag_assignments.map((t) => ({
      name: t.document_tag.name,
      score: t.confidence_score,
    })),
    summary:
      status === "Failed"
        ? `Ingestion failed: ${version?.status.replace(/^failed:\s*/i, "")}`
        : status === "Processing"
        ? `Ingestion in progress (${version?.status || "uploaded"}).`
        : "",
    uploadedBy: {
      name: fullName(doc.created_by),
      division: doc.created_by?.division || doc.created_by?.office || "",
      position: doc.created_by?.position,
    },
    currentVersionId: version?.id,
    fileExtension: ext,
    ingestionStatus: version?.status,
  };
}
