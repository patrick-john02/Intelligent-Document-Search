"use client";

import { useState, useCallback } from "react";
import { ArchiveDocument, DocumentClearance, DocumentFileType } from "./types";
import { uploadDocument, ClearanceLevelValue } from "@/lib/documentsApi";
import { ApiError } from "@/lib/api";

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface ArchivingCabinetConfig {
  cabinet: string;
  shelf: string;
  folder: string;
  categoryId: number;
  categoryName: string;
  clearanceLevel: ClearanceLevelValue;
  seriesDate: string; // YYYY-MM-DD
  departmentOrder: string;
}

const AGENT_PIPELINE_STEPS = [
  "Anydoc OCR & Table Structure Parsing",
  "ML Entity Extraction & Document Title Discovery",
  "Vector Embeddings & Semantic Indexing",
  "Physical Cabinet Coordinate & Barcode Registration",
];

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
  config: ArchivingCabinetConfig
): ArchiveDocument {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const fileType: DocumentFileType =
    ext === "xlsx" || ext === "xls" ? "xlsx" : ext === "docx" || ext === "doc" ? "docx" : "pdf";
  const shelfLocation = `${config.cabinet} • ${config.shelf} • ${config.folder}`;

  return {
    id: uploadedId,
    title: titleFromFileName(file.name),
    orderNo: config.departmentOrder,
    seriesYear: Number(config.seriesDate.slice(0, 4)),
    category: config.categoryName,
    clearance: UI_CLEARANCE[config.clearanceLevel],
    cabinet: config.cabinet,
    shelf: config.shelf,
    folder: config.folder,
    shelfLocation,
    ocrAccuracy: 0, // filled in by the ingestion pipeline
    fileSize: formatFileSize(file.size),
    pageCount: 0,
    fileType,
    fileName: file.name,
    version: "v1.0",
    ingestedDate: new Date().toISOString().split("T")[0],
    status: "Processing", // OCR / chunking / embedding run in Celery after upload
    tags: [],
    summary: `Uploaded ${file.name}. OCR, classification and indexing are running in the background.`,
  };
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    // FastAPI 422 returns detail as a list of validation errors
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(AGENT_PIPELINE_STEPS[0]);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [processedDocs, setProcessedDocs] = useState<ArchiveDocument[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const updateFile = (id: string, patch: Partial<QueuedFile>) =>
    setQueuedFiles((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const startArchiving = useCallback(
    async (files: File[], config: ArchivingCabinetConfig) => {
      if (files.length === 0) return;

      const queue: QueuedFile[] = files.map((f, i) => ({
        id: `f-${Date.now()}-${i}`,
        file: f,
        name: f.name,
        sizeFormatted: formatFileSize(f.size),
        status: "pending",
      }));

      setQueuedFiles(queue);
      setIsActive(true);
      setIsMinimized(false);
      setProgress(5);
      setStepIndex(0);
      setCurrentStep(AGENT_PIPELINE_STEPS[0]);
      setIsFinished(false);

      const uploaded: ArchiveDocument[] = [];
      const failed: string[] = [];
      const physicalShelfLocation = `${config.cabinet} • ${config.shelf} • ${config.folder}`;

      // Upload one at a time so the server and OCR queue aren't flooded
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        updateFile(q.id, { status: "processing" });
        setCurrentStep(`Uploading ${q.name} (${i + 1}/${queue.length})`);

        try {
          const res = await uploadDocument(q.file, {
            title: titleFromFileName(q.name),
            departmentOrder: config.departmentOrder,
            seriesDate: config.seriesDate,
            physicalShelfLocation,
            categoryId: config.categoryId,
            clearanceLevel: config.clearanceLevel,
          });
          uploaded.push(toArchiveDocument(q.file, res.id, config));
          updateFile(q.id, { status: "completed" });
        } catch (err) {
          const msg = errorText(err);
          failed.push(`${q.name}: ${msg}`);
          updateFile(q.id, { status: "failed", error: msg });
        }

        const pct = Math.round(((i + 1) / queue.length) * 100);
        setProgress(Math.max(5, pct));
        setStepIndex(Math.min(AGENT_PIPELINE_STEPS.length - 1, Math.floor((pct / 100) * AGENT_PIPELINE_STEPS.length)));
      }

      setProgress(100);
      setStepIndex(AGENT_PIPELINE_STEPS.length - 1);
      setCurrentStep(
        failed.length === 0
          ? `${uploaded.length} file(s) uploaded — indexing in background`
          : `${uploaded.length} uploaded, ${failed.length} failed`
      );
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
    setIsActive(false);
    setIsMinimized(false);
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
    startArchiving,
    minimize,
    maximize,
    dismiss,
  };
}
