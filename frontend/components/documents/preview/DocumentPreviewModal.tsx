"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { alpha } from "@mui/material/styles";

// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { ArchiveDocument } from "../types";
import DocumentPdfRenderer from "./DocumentPdfRenderer";
import DocumentSpreadsheetRenderer from "./DocumentSpreadsheetRenderer";
import DocumentWordRenderer from "./DocumentWordRenderer";
import DocumentFileViewer from "./DocumentFileViewer";
import { downloadDocumentVersion, saveBlob } from "@/lib/documentsApi";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface DocumentPreviewModalProps {
  document: ArchiveDocument | null;
  open: boolean;
  onClose: () => void;
  onAskMayumi?: (doc: ArchiveDocument) => void;
}

export default function DocumentPreviewModal({
  document,
  open,
  onClose,
  onAskMayumi,
}: DocumentPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showOcrLayer, setShowOcrLayer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!document) return null;

  const totalPages = document.pageCount || 1;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 175));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // GET /api/documents/version/{version_id}/download
  const handleDownload = async () => {
    if (!document.currentVersionId) {
      setToastMessage("This document has no uploaded file to download.");
      return;
    }
    setToastMessage(`Downloading "${document.fileName || document.title}"...`);
    try {
      const blob = await downloadDocumentVersion(document.currentVersionId);
      saveBlob(blob, document.fileName || `document-${document.id}`);
    } catch (err) {
      setToastMessage(`Download failed: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  };

  const handlePrint = () => {
    setToastMessage(`Preparing print preview for Order: "${document.orderNo}"`);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const getFormatIcon = () => {
    if (document.fileType === "xlsx") {
      return <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />;
    }
    if (document.fileType === "docx") {
      return <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />;
    }
    return <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />;
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{ transition: Transition }}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#0F172A",
          color: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* 1. Top Enterprise Control Bar */}
      <Box
        sx={{
          height: 56,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#1E293B",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
          zIndex: 1200,
          gap: 1.5,
        }}
      >
        {/* Left: Close/Back, Format Icon, Title, Clearance */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
          <Tooltip title="Close Viewer (Esc)">
            <IconButton onClick={onClose} size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: "flex", alignItems: "center" }}>{getFormatIcon()}</Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#F8FAFC", lineHeight: 1.2 }}
            >
              {document.title}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "#94A3B8", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{document.orderNo}</span>
              <span>•</span>
              <span>{document.shelfLocation}</span>
              <span>•</span>
              <span>Series {document.seriesYear}</span>
            </Typography>
          </Box>

          <Chip
            label={document.clearance}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor:
                document.clearance === "Public"
                  ? alpha("#10B981", 0.2)
                  : document.clearance === "Internal"
                  ? alpha("#3B82F6", 0.2)
                  : document.clearance === "Restricted"
                  ? alpha("#F59E0B", 0.2)
                  : alpha("#EF4444", 0.2),
              color:
                document.clearance === "Public"
                  ? "#34D399"
                  : document.clearance === "Internal"
                  ? "#60A5FA"
                  : document.clearance === "Restricted"
                  ? "#FBBF24"
                  : "#F87171",
              border: "1px solid",
              borderColor: "rgba(255, 255, 255, 0.1)",
              display: { xs: "none", md: "inline-flex" },
            }}
          />
        </Stack>

        {/* Center: Page Controls & Zoom Controls */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", display: { xs: "none", sm: "flex" } }}>
          {/* Page Navigator */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              bgcolor: "rgba(0, 0, 0, 0.25)",
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              sx={{ color: "#94A3B8", p: 0.25, "&:disabled": { color: "#475569" } }}
            >
              <NavigateBeforeRoundedIcon fontSize="small" />
            </IconButton>

            <Typography variant="caption" sx={{ fontSize: "0.76rem", fontWeight: 700, px: 0.5, color: "#E2E8F0" }}>
              {currentPage} / {totalPages}
            </Typography>

            <IconButton
              size="small"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              sx={{ color: "#94A3B8", p: 0.25, "&:disabled": { color: "#475569" } }}
            >
              <NavigateNextRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Zoom Controls */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              bgcolor: "rgba(0, 0, 0, 0.25)",
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              sx={{ color: "#94A3B8", p: 0.25, "&:disabled": { color: "#475569" } }}
            >
              <ZoomOutRoundedIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="caption"
              onClick={handleResetZoom}
              sx={{
                fontSize: "0.76rem",
                fontWeight: 700,
                width: 44,
                textAlign: "center",
                cursor: "pointer",
                color: "#E2E8F0",
                "&:hover": { color: "#38BDF8" },
              }}
            >
              {zoomLevel}%
            </Typography>

            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 175}
              sx={{ color: "#94A3B8", p: 0.25, "&:disabled": { color: "#475569" } }}
            >
              <ZoomInRoundedIcon fontSize="small" />
            </IconButton>

            <Tooltip title="Fit to 100%">
              <IconButton size="small" onClick={handleResetZoom} sx={{ color: "#94A3B8", p: 0.25 }}>
                <FitScreenRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* OCR Highlight Toggle */}
          {document.fileType !== "xlsx" && (
            <Tooltip title={showOcrLayer ? "Hide OCR Text Layer" : "Highlight OCR Text Layer"}>
              <Button
                size="small"
                variant={showOcrLayer ? "contained" : "outlined"}
                onClick={() => setShowOcrLayer(!showOcrLayer)}
                startIcon={showOcrLayer ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  height: 30,
                  ...(showOcrLayer
                    ? { bgcolor: "#10B981", color: "#FFFFFF", "&:hover": { bgcolor: "#059669" } }
                    : { borderColor: "rgba(255, 255, 255, 0.2)", color: "#CBD5E1" }),
                }}
              >
                OCR Layer
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Right: Ask Mayumi, Download, Print, Close */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {onAskMayumi && (
            <Tooltip title="Ask Mayumi AI about this specific record">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#EC4899" }} />}
                onClick={() => {
                  onClose();
                  onAskMayumi(document);
                }}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.76rem",
                  height: 32,
                  px: 1.25,
                  borderColor: "rgba(236, 72, 153, 0.4)",
                  color: "#F472B6",
                  bgcolor: "rgba(236, 72, 153, 0.08)",
                  "&:hover": {
                    borderColor: "#EC4899",
                    bgcolor: "rgba(236, 72, 153, 0.16)",
                  },
                }}
              >
                Ask Mayumi
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Download Official Archival Copy">
            <IconButton onClick={handleDownload} size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
              <DownloadRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Print Document">
            <IconButton onClick={handlePrint} size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
              <PrintRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Close (Esc)">
            <IconButton onClick={onClose} size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 2. Main High-Resolution Viewport Canvas */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          bgcolor: "#0B0F19",
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {document.currentVersionId ? (
          // real file from the backend
          <Box sx={{ alignSelf: "stretch", flex: 1, display: "flex", minHeight: 0 }}>
            <DocumentFileViewer document={document} zoomLevel={zoomLevel} onDownload={handleDownload} />
          </Box>
        ) : document.fileType === "xlsx" ? (
          <DocumentSpreadsheetRenderer document={document} zoomLevel={zoomLevel} />
        ) : document.fileType === "docx" ? (
          <DocumentWordRenderer document={document} zoomLevel={zoomLevel} currentPage={currentPage} />
        ) : (
          <DocumentPdfRenderer
            document={document}
            zoomLevel={zoomLevel}
            showOcrLayer={showOcrLayer}
            currentPage={currentPage}
          />
        )}
      </Box>

      {/* Action Toast Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="info"
          variant="filled"
          sx={{ borderRadius: 1.5, fontSize: "0.82rem" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
