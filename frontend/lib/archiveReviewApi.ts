import { api } from "./api";

// ---------- Types (mirror the backend so TypeScript catches typos) ----------

// Matches ProposalStatus in api/models/enums/docs.py
export type ProposalStatus = "pending" | "accepted" | "edited" | "rejected" | "failed" | "superseded";

// Matches KeyField / DuplicateWarning / ArchiveProposal in agents/archiving_agent/schema.py
export interface KeyField {
  name: string;
  value: string;
  page: number | null;
}

export interface DuplicateWarning {
  document_id: number;
  title: string;
  match_type: string;
  similarity: number; // 0.0 - 1.0
}

export interface AlonProposal {
  title: string;
  document_type: string;
  document_type_confidence: number;
  document_type_reason: string;
  agrees_with_classifier: boolean;
  suggested_new_type: string | null;
  series_year: number | null;
  department_order: string | null;
  key_fields: KeyField[];
  suggested_shelf_location: string | null; // note: NOT physical_shelf_location
  shelf_location_reason: string | null;
  duplicates: DuplicateWarning[];
  summary: string;
  issues: string[];
  needs_human_review: boolean;
}

// Matches CurrentValues in api/schema/archive_review_schema.py
export interface CurrentValues {
  title: string;
  document_type: string | null;
  series_year: number | null;
  department_order: string | null;
  physical_shelf_location: string | null;
}

// Matches ArchiveProposalResponse
export interface ArchiveProposal {
  id: number;
  document_version_id: number;
  document_id: number;
  file_name: string;
  current: CurrentValues;
  status: ProposalStatus;
  proposal: AlonProposal | null; // null when Alon failed
  final_values: Record<string, unknown> | null; // set after accept
  needs_human_review: boolean;
  model_name: string | null;
  error_message: string | null;
  created_at: string;
  reviewed_by_id: number | null;
  reviewed_at: string | null;
  review_note: string | null;
}

// Matches AcceptProposalSchema: send ONLY the fields the reviewer changed
export interface AcceptBody {
  title?: string;
  document_type?: string;
  series_year?: number;
  department_order?: string;
  physical_shelf_location?: string;
  review_note?: string;
}

export interface ReviewActionResult {
  proposal_id: number;
  status: ProposalStatus;
  final_values?: Record<string, unknown>;
  reindex_queued?: boolean;
}

// ---------- API calls (router prefix is /archive) ----------

export const listQueue = (status: ProposalStatus = "pending", limit = 50) =>
  api.get<ArchiveProposal[]>(`/archive/queue?status=${status}&limit=${limit}`);

export const getProposal = (id: number) =>
  api.get<ArchiveProposal>(`/archive/${id}`);

export const getLatestForVersion = (versionId: number) =>
  api.get<ArchiveProposal>(`/archive/version/${versionId}/latest`);

export const acceptProposal = (id: number, body: AcceptBody = {}) =>
  api.post<ReviewActionResult>(`/archive/${id}/accept`, body);

export const rejectProposal = (id: number, reviewNote: string) =>
  api.post<ReviewActionResult>(`/archive/${id}/reject`, { review_note: reviewNote });

export const rerunAlon = (versionId: number) =>
  api.post<{ version_id: number; queued: boolean }>(`/archive/version/${versionId}/rerun`);

export const listDocumentTypes = () =>
  api.get<string[]>(`/archive/document-types`);

// Browser event fired after a review action, so the menu badge (pending count) refreshes immediately
export const ARCHIVE_REVIEW_CHANGED = "archive-review-changed";

export const countPending = async (): Promise<number> => (await listQueue("pending", 200)).length;
