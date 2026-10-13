"use client";

import { useState, useRef, useCallback } from "react";
import { ArchiveDocument, DocumentFileType } from "./types";

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  status: "pending" | "processing" | "completed";
}

export interface ArchivingCabinetConfig {
  cabinet: string;
  shelf: string;
  folder: string;
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

// Generate intelligent document title from file name using simulated ML
function generateDiscoveredMetadata(fileName: string, index: number, cabinetConfig: ArchivingCabinetConfig): ArchiveDocument {
  const cleanBase = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .trim();

  // Simulated ML title discovery
  const titleVariants = [
    `Official Assessment Directive on ${cleanBase.toUpperCase()}`,
    `Treasury Advisory & Disbursement Register: ${cleanBase}`,
    `Executive Resolution on ${cleanBase} and Compliance Standards`,
    `Revenue Audit & Inspection Memorandum - ${cleanBase}`,
  ];
  const discoveredTitle = titleVariants[index % titleVariants.length];

  const year = new Date().getFullYear();
  const orderNum = `BLGF-ARC-${year}-${String(100 + Math.floor(Math.random() * 900))}`;
  const ext = fileName.split(".").pop()?.toLowerCase();
  const fileType: DocumentFileType =
    ext === "xlsx" || ext === "xls" ? "xlsx" : ext === "docx" || ext === "doc" ? "docx" : "pdf";

  return {
    id: `doc-${Date.now()}-${index}`,
    title: discoveredTitle,
    orderNo: orderNum,
    seriesYear: year,
    category: index % 2 === 0 ? "Assessment Regulations" : "Treasury Advisories",
    clearance: "Public",
    cabinet: cabinetConfig.cabinet,
    shelf: cabinetConfig.shelf,
    folder: cabinetConfig.folder,
    shelfLocation: `${cabinetConfig.cabinet} • ${cabinetConfig.shelf} • ${cabinetConfig.folder}`,
    ocrAccuracy: +(97.5 + Math.random() * 2).toFixed(1),
    fileSize: "3.2 MB",
    pageCount: Math.floor(Math.random() * 18) + 6,
    fileType,
    fileName,
    version: "v1.0",
    ingestedDate: new Date().toISOString().split("T")[0],
    status: "Indexed",
    tags: [
      { name: "ML-Discovered", score: 0.98 },
      { name: "Anydoc Parsed", score: 0.95 },
    ],
    summary: `Autonomous archiving completed for ${fileName}. Intelligent document classification derived title: "${discoveredTitle}". Mapped to ${cabinetConfig.cabinet}.`,
    uploadedBy: {
      name: "Records Officer",
      division: "Central Archival Operations",
      position: "Archival Custodian",
    },
    executiveBrief: {
      statutoryMandate: `Discovered and cataloged directive under ${orderNum}. Automatic entity extraction completed by Archiving Agent.`,
      targetEntities: "Provincial & Municipal Accounting Offices, Internal Revenue Custodians.",
      archivalDisposition: `Active record • Mapped to ${cabinetConfig.cabinet} • ${cabinetConfig.shelf} (${cabinetConfig.folder}).`,
    },
  };
}

export function useArchivingTask(onComplete?: (docs: ArchiveDocument[]) => void) {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(AGENT_PIPELINE_STEPS[0]);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [processedDocs, setProcessedDocs] = useState<ArchiveDocument[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startArchiving = useCallback(
    (files: File[], cabinetConfig: ArchivingCabinetConfig) => {
      if (files.length === 0) return;

      const queue: QueuedFile[] = files.map((f, i) => ({
        id: `f-${Date.now()}-${i}`,
        file: f,
        name: f.name,
        sizeFormatted: formatFileSize(f.size),
        status: "processing",
      }));

      setQueuedFiles(queue);
      setIsActive(true);
      setIsMinimized(false);
      setProgress(5);
      setStepIndex(0);
      setCurrentStep(AGENT_PIPELINE_STEPS[0]);
      setIsFinished(false);

      if (timerRef.current) clearInterval(timerRef.current);

      let currentPct = 5;
      timerRef.current = setInterval(() => {
        currentPct += Math.floor(Math.random() * 8) + 5;

        if (currentPct >= 100) {
          currentPct = 100;
          if (timerRef.current) clearInterval(timerRef.current);

          setProgress(100);
          setStepIndex(3);
          setCurrentStep(AGENT_PIPELINE_STEPS[3]);
          setIsFinished(true);

          // Generate newly archived documents
          const newlyDiscovered = queue.map((q, idx) =>
            generateDiscoveredMetadata(q.name, idx, cabinetConfig)
          );
          setProcessedDocs(newlyDiscovered);

          if (onComplete) {
            onComplete(newlyDiscovered);
          }
        } else {
          setProgress(currentPct);
          if (currentPct > 75) {
            setStepIndex(3);
            setCurrentStep(AGENT_PIPELINE_STEPS[3]);
          } else if (currentPct > 50) {
            setStepIndex(2);
            setCurrentStep(AGENT_PIPELINE_STEPS[2]);
          } else if (currentPct > 25) {
            setStepIndex(1);
            setCurrentStep(AGENT_PIPELINE_STEPS[1]);
          }
        }
      }, 400);
    },
    [onComplete]
  );

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
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
