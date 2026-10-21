"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import { ArchiveDocument } from "../types";
import { downloadDocumentVersion } from "@/lib/documentsApi";

// Formats the browser can display natively
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "bmp", "gif"]);

interface DocumentFileViewerProps {
  document: ArchiveDocument;
  zoomLevel: number;
  onDownload: () => void;
}

// Shows the real uploaded file from GET /api/documents/version/{id}/download
export default function DocumentFileViewer({ document, zoomLevel, onDownload }: DocumentFileViewerProps) {
  const ext = (document.fileExtension || "").toLowerCase();
  const isPdf = ext === "pdf";
  const isImage = IMAGE_EXTENSIONS.has(ext);
  const canPreview = isPdf || isImage;

  // Result is keyed by version id, so switching documents shows the spinner again
  const [result, setResult] = useState<{ versionId: number; url?: string; error?: string } | null>(null);
  const versionId = document.currentVersionId;

  useEffect(() => {
    if (!canPreview || !versionId) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    downloadDocumentVersion(versionId)
      .then((blob) => {
        if (cancelled) return;
        // force the right type so the browser renders instead of downloading
        const typed = isPdf ? new Blob([blob], { type: "application/pdf" }) : blob;
        objectUrl = URL.createObjectURL(typed);
        setResult({ versionId, url: objectUrl });
      })
      .catch((err) => {
        if (!cancelled) setResult({ versionId, error: err?.message || "Could not load file" });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [versionId, canPreview, isPdf]);

  const isCurrent = result?.versionId === versionId;
  const url = isCurrent ? result?.url : undefined;
  const error = isCurrent ? result?.error : undefined;
  const loading = !isCurrent;

  if (!canPreview || error) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Box sx={{ textAlign: "center", maxWidth: 420, color: "#CBD5E1" }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 56, color: "#64748B", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: "#F8FAFC", mb: 0.75 }}>
            {error ? "Could not load this file" : `Preview isn't available for .${ext || "unknown"} files`}
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 2.5 }}>
            {error || "Download the file to open it in its own application."}
          </Typography>
          <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={onDownload} sx={{ textTransform: "none" }}>
            Download {document.fileName}
          </Button>
        </Box>
      </Box>
    );
  }

  if (loading || !url) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isPdf) {
    // the browser's PDF viewer has its own zoom / page / print controls
    return <Box component="iframe" src={url} title={document.title} sx={{ flex: 1, width: "100%", border: 0, bgcolor: "#FFFFFF" }} />;
  }

  return (
    <Box sx={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", p: 3 }}>
      <Box
        component="img"
        src={url}
        alt={document.title}
        sx={{ width: `${zoomLevel}%`, maxWidth: "none", height: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", bgcolor: "#FFFFFF" }}
      />
    </Box>
  );
}
