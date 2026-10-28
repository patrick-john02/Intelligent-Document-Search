"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArchiveDocument, DocumentClearance, DocumentFileType } from "./types";
import { uploadDocument, ClearanceLevelValue } from "@/lib/documentsApi";
import { ApiError } from "@/lib/api";
import { getLatestForVersion, ProposalStatus } from "@/lib/archiveReviewApi";

// Alon's review of one uploaded file (filled by polling GET /archive/version/{id}/latest)
export type AlonReview =
  | { state: "waiting" } // OCR / indexing / Alon still running
  | {
      state: "ready";
      proposalId: number;
      status: ProposalStatus;
      title?: string;
      documentType?: string;
      issueCount: number;
      needsReview: boolean;
    }
  | { state: "failed"; proposalId: number; error?: string } // Alon ran but failed (can be re-run)
  | { state: "timeout" }; // still not done after the polling window

export interface StagedUploadItem {
  file: File;
  customTitle?: string;
  customDepartmentOrder?: string;
  customSeriesDate?: string;
}

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  versionId?: number; // from the upload response, used to find Alon's proposal
  alon?: AlonReview;
  customTitle?: string;
  customDepartmentOrder?: string;
  customSeriesDate?: string;
}

export interface ArchivingCabinetConfig {
  cabinet: string;
  shelf: string;
  folder: string;
  categoryId: number;
  categoryName: string;
  clearanceLevel: ClearanceLevelValue;
  seriesDate?: string; // YYYY-MM-DD
  departmentOrder?: string;
}

// The real stages: upload here, the rest runs in background / Celery
const AGENT_PIPELINE_STEPS = [
  "Upload files",
  "OCR, classification & indexing (background)",
  "Alon's archive review (about 1–2 min per file)",
];

const POLL_EVERY_MS = 5000; // check for Alon's proposal every 5 s
const POLL_MAX_MS = 5 * 60_000; // give up after 5 min (proposal still appears in Archive Review later)

// Helper to format bytes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// "Disbursement_Voucher-2024.pdf" -> "Disbursement Voucher 2024"
export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim() || fileName;
}

const UI_CLEARANCE: Record<ClearanceLevelValue, DocumentClearance> = {
  public: "Public",
  internal: "Internal",
  confidential: "Confidential",
  secret: "Restricted",
  top_secret: "Restricted",
};

function toArchiveDocument(
  file: File,
  uploadedId: number,
  config: ArchivingCabinetConfig,
  overrides?: { title?: string; orderNo?: string; seriesDate?: string }
): ArchiveDocument {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const fileType: DocumentFileType =
    ext === "xlsx" || ext === "xls" ? "xlsx" : ext === "docx" || ext === "doc" ? "docx" : "pdf";
  const shelfLocation = `${config.cabinet} • ${config.shelf} • ${config.folder}`;
  const seriesYear = Number(
    (overrides?.seriesDate || config.seriesDate || new Date().toISOString()).slice(0, 4)
  );

  return {
    id: uploadedId,
    title: overrides?.title?.trim() || titleFromFileName(file.name),
    orderNo: overrides?.orderNo?.trim() || config.departmentOrder?.trim() || "Pending Review",
    seriesYear: isNaN(seriesYear) ? new Date().getFullYear() : seriesYear,
    category: config.categoryName,
    clearance: UI_CLEARANCE[config.clearanceLevel],
    cabinet: config.cabinet,
    shelf: config.shelf,
    folder: config.folder,
    shelfLocation,
    ocrAccuracy: 0,
    fileSize: formatFileSize(file.size),
    pageCount: 0,
    fileType,
    fileName: file.name,
    version: "v1.0",
    ingestedDate: new Date().toISOString().split("T")[0],
    status: "Processing",
    tags: [],
    summary: `Uploaded ${file.name}. OCR, classification and indexing are running in the background.`,
  };
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    if (Array.isArray(err.data?.detail)) {
      return err.data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ");
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Upload failed";
}

export function useArchivingTask(
  onComplete?: (docs: ArchiveDocument[]) => void,
  onError?: (message: string) => void
) {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(AGENT_PIPELINE_STEPS[0]);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [processedDocs, setProcessedDocs] = useState<ArchiveDocument[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Polling timer for Alon's proposals (cleared on dismiss / unmount)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = () => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = null;
  };
  useEffect(() => stopPolling, []);

  // True while at least one uploaded file is still waiting for Alon
  const isReviewing = queuedFiles.some((q) => q.alon?.state === "waiting");

  const updateFile = (id: string, patch: Partial<QueuedFile>) =>
    setQueuedFiles((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const startArchiving = useCallback(
    async (
      files: (File | StagedUploadItem)[],
      config: ArchivingCabinetConfig,
      options?: { startMinimized?: boolean }
    ) => {
      if (files.length === 0) return;

      const queue: QueuedFile[] = files.map((item, i) => {
        const f = item instanceof File ? item : item.file;
        const customTitle = item instanceof File ? undefined : item.customTitle;
        const customDepartmentOrder = item instanceof File ? undefined : item.customDepartmentOrder;
        const customSeriesDate = item instanceof File ? undefined : item.customSeriesDate;

        return {
          id: `f-${Date.now()}-${i}`,
          file: f,
          name: f.name,
          sizeFormatted: formatFileSize(f.size),
          status: "pending",
          customTitle,
          customDepartmentOrder,
          customSeriesDate,
        };
      });

      setQueuedFiles(queue);
      setIsActive(true);
      setIsMinimized(options?.startMinimized ?? true);
      setProgress(5);
      setStepIndex(0);
      setCurrentStep(AGENT_PIPELINE_STEPS[0]);
      setIsFinished(false);

      const uploaded: ArchiveDocument[] = [];
      const failed: string[] = [];
      const waiting: { fileId: string; versionId: number }[] = [];
      const physicalShelfLocation = `${config.cabinet} • ${config.shelf} • ${config.folder}`;

      // Upload sequentially so server and worker queues aren't overwhelmed
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        updateFile(q.id, { status: "processing" });
        setCurrentStep(`Uploading ${q.name} (${i + 1}/${queue.length})`);

        const uploadTitle = q.customTitle?.trim() || titleFromFileName(q.name);
        const uploadDeptOrder =
          q.customDepartmentOrder?.trim() ||
          config.departmentOrder?.trim() ||
          "PENDING_EXTRACTION";
        const uploadSeriesDate =
          q.customSeriesDate?.trim() ||
          config.seriesDate?.trim() ||
          new Date().toISOString().split("T")[0];

        try {
          const res = await uploadDocument(q.file, {
            title: uploadTitle,
            departmentOrder: uploadDeptOrder,
            seriesDate: uploadSeriesDate,
            physicalShelfLocation,
            categoryId: config.categoryId,
            clearanceLevel: config.clearanceLevel,
          });
          uploaded.push(
            toArchiveDocument(q.file, res.id, config, {
              title: uploadTitle,
              orderNo: uploadDeptOrder,
              seriesDate: uploadSeriesDate,
            })
          );
          updateFile(q.id, {
            status: "completed",
            versionId: res.version_id ?? undefined,
            alon: res.version_id ? { state: "waiting" } : undefined,
          });
          if (res.version_id) waiting.push({ fileId: q.id, versionId: res.version_id });
        } catch (err) {
          const msg = errorText(err);
          failed.push(`${q.name}: ${msg}`);
          updateFile(q.id, { status: "failed", error: msg });
        }

        setProgress(Math.max(5, Math.round(((i + 1) / queue.length) * 100)));
      }

      setProgress(100);
      setStepIndex(waiting.length > 0 ? 1 : AGENT_PIPELINE_STEPS.length);
      setCurrentStep(
        failed.length === 0
          ? `${uploaded.length} file(s) uploaded — processing on server`
          : `${uploaded.length} uploaded, ${failed.length} failed`
      );

      // Poll for Alon's real proposal for each uploaded version
      stopPolling();
      if (waiting.length > 0) {
        const started = Date.now();
        let pending = [...waiting];

        pollTimer.current = setInterval(async () => {
          const timedOut = Date.now() - started > POLL_MAX_MS;
          const stillPending: typeof pending = [];

          for (const w of pending) {
            try {
              const p = await getLatestForVersion(w.versionId);
              setStepIndex(2);
              updateFile(w.fileId, {
                alon:
                  p.status === "failed" || !p.proposal
                    ? { state: "failed", proposalId: p.id, error: p.error_message ?? undefined }
                    : {
                        state: "ready",
                        proposalId: p.id,
                        status: p.status,
                        title: p.proposal.title,
                        documentType: p.proposal.document_type,
                        issueCount: p.proposal.issues.length,
                        needsReview: p.needs_human_review,
                      },
              });
            } catch (err) {
              if (timedOut) updateFile(w.fileId, { alon: { state: "timeout" } });
              else stillPending.push(w);
              if (!(err instanceof ApiError && err.status === 404)) console.warn("[archiving] poll error", err);
            }
          }

          pending = stillPending;
          if (pending.length === 0) {
            stopPolling();
            setStepIndex(AGENT_PIPELINE_STEPS.length);
            setCurrentStep("Alon finished. Proposals are ready for review.");
          }
        }, POLL_EVERY_MS);
      }
      setProcessedDocs(uploaded);
      setIsFinished(true);

      if (uploaded.length > 0 && onComplete) onComplete(uploaded);
      if (failed.length > 0 && onError) {
        onError(`Upload failed for ${failed.length} file(s): ${failed.join(" | ")}`);
      }
    },
    [onComplete, onError]
  );

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const dismiss = useCallback(() => {
    stopPolling();
    setIsActive(false);
    setIsMinimized(true);
    setProgress(0);
    setIsFinished(false);
    setQueuedFiles([]);
  }, []);

  return {
    isActive,
    isMinimized,
    progress,
    stepIndex,
    currentStep,
    steps: AGENT_PIPELINE_STEPS,
    queuedFiles,
    processedDocs,
    isFinished,
    isReviewing,
    startArchiving,
    minimize,
    maximize,
    dismiss,
  };
}
