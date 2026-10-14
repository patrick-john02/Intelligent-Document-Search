"use client";

import React, { useState, useRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";

// Clean MUI Icons (Zero Emojis)
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WavesRoundedIcon from "@mui/icons-material/WavesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import CabinetSelectDropdown from "./CabinetSelectDropdown";
import { formatFileSize, ArchivingCabinetConfig } from "./useArchivingTask";

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onStartArchiving: (files: File[], config: ArchivingCabinetConfig) => void;
}

export const MAX_BULK_FILES = 25;

const ALON_SPEECH_TEXT =
  "Drop any municipal scan, ordinance, or assessment register. I will autonomously parse high-resolution OCR, extract circular order codes, and index them into the archive.";

export default function UploadDocumentDialog({
  open,
  onClose,
  onStartArchiving,
}: UploadDocumentDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cabinet, setCabinet] = useState("Cabinet A");
  const [shelf, setShelf] = useState("Shelf 1");
  const [folder, setFolder] = useState("Binder 01");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Alon Typewriter Effect
  const [typedContent, setTypedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!open) {
      setTypedContent("");
      setIsTyping(false);
      return;
    }

    setTypedContent("");
    setIsTyping(true);
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex += 1;
      setTypedContent(ALON_SPEECH_TEXT.slice(0, currentIndex));
      if (currentIndex >= ALON_SPEECH_TEXT.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [open]);

  const fillPercent = Math.min(100, Math.round((selectedFiles.length / MAX_BULK_FILES) * 100));
  const isCapacityFull = selectedFiles.length >= MAX_BULK_FILES;

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newArr = Array.from(files);
    setSelectedFiles((prev) => {
      const combined = [...prev, ...newArr];
      if (combined.length > MAX_BULK_FILES) {
        return combined.slice(0, MAX_BULK_FILES);
      }
      return combined;
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    onStartArchiving(selectedFiles, {
      cabinet,
      shelf,
      folder,
    });

    // Reset and close upload modal
    setSelectedFiles([]);
    onClose();
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
      return <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />;
    }
    if (ext === "docx" || ext === "doc") {
      return <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />;
    }
    return <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            width: "100%",
            maxWidth: { xs: "95vw", sm: 880, md: 1040, lg: 1120 },
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 40px rgba(0,0,0,0.85)"
                : "0 16px 48px rgba(6, 182, 212, 0.14)",
          },
        },
      }}
    >
      {/* Top Cyan Gradient Accent Bar */}
      <Box
        sx={{
          height: 3.5,
          background: "linear-gradient(90deg, #06B6D4, #3B82F6, #10B981)",
        }}
      />

      {/* Clean Header (Zero header circles, ready for 3D spotlight below) */}
      <DialogTitle
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(6, 182, 212, 0.05)"
              : "rgba(6, 182, 212, 0.03)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>
              Upload Documents
            </Typography>
            <Chip
              icon={<WavesRoundedIcon sx={{ fontSize: "13px !important", color: "#06B6D4" }} />}
              label="Alon (Archiving Agent)"
              size="small"
              sx={{
                height: 22,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: alpha("#06B6D4", 0.12),
                color: "#0284C7",
                border: "1px solid",
                borderColor: alpha("#06B6D4", 0.3),
                borderRadius: 1,
              }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
            Autonomous OCR extraction, entity discovery, and physical coordinate mapping
          </Typography>
        </Box>

        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Assistant Welcome Card featuring 3D Spotlight Container & Typewriter Effect */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha("#06B6D4", 0.08)
                    : alpha("#06B6D4", 0.04),
                border: "1.5px solid",
                borderColor: alpha("#06B6D4", 0.25),
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.25} sx={{ alignItems: { sm: "center" } }}>
                {/* 3D Model / Image Spotlight Slot for Alon */}
                <Box
                  sx={{
                    width: { xs: 76, sm: 88 },
                    height: { xs: 76, sm: 88 },
                    borderRadius: 2.5,
                    p: 0.75,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(6, 182, 212, 0.12)"
                        : "rgba(6, 182, 212, 0.08)",
                    border: "2px solid",
                    borderColor: alpha("#06B6D4", 0.4),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    boxShadow: "0 4px 18px rgba(6, 182, 212, 0.22)",
                    background:
                      "radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0.03) 75%)",
                  }}
                >
                  <Avatar
                    src="/alon.png"
                    alt="Alon 3D"
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 2,
                    }}
                  />
                  {/* 3D Identifier Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -7,
                      px: 0.85,
                      py: 0.2,
                      bgcolor: "#06B6D4",
                      color: "#FFFFFF",
                      borderRadius: 1,
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      boxShadow: "0 2px 6px rgba(6, 182, 212, 0.4)",
                    }}
                  >
                    ALON AGENT
                  </Box>
                </Box>

                {/* Typewriter Speech Area */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.86rem",
                      lineHeight: 1.6,
                      color: "text.primary",
                      minHeight: 48,
                    }}
                  >
                    <strong>Alon&apos;s Ingestion Assistant:</strong> {typedContent}
                    {isTyping && (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          width: "2px",
                          height: "1em",
                          bgcolor: "#06B6D4",
                          ml: 0.5,
                          verticalAlign: "text-bottom",
                          animation: "cursorBlink 0.8s infinite",
                          "@keyframes cursorBlink": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0 },
                          },
                        }}
                      />
                    )}
                  </Typography>

                  <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: "wrap", gap: 0.5 }}>
                    <Chip
                      size="small"
                      label="Anydoc OCR Engine Armed"
                      icon={<VerifiedRoundedIcon sx={{ fontSize: "12px !important", color: "#06B6D4" }} />}
                      sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700, bgcolor: "background.paper", border: "1px solid", borderColor: alpha("#06B6D4", 0.3) }}
                    />
                    <Chip
                      size="small"
                      label="Auto-Title Discovery"
                      icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "12px !important", color: "#0284C7" }} />}
                      sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                    />
                    <Chip
                      size="small"
                      label="Vector Embeddings"
                      icon={<DescriptionOutlinedIcon sx={{ fontSize: "12px !important", color: "#8B5CF6" }} />}
                      sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Interactive Drag & Drop Water Tank Zone (Alon Wave Motif) */}
            <Paper
              variant="outlined"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!isCapacityFull) {
                  fileInputRef.current?.click();
                }
              }}
              sx={{
                p: { xs: 3, sm: 4 },
                minHeight: 200,
                borderRadius: 2.5,
                border: "2px dashed",
                borderColor: isCapacityFull
                  ? "success.main"
                  : isDragOver
                  ? "primary.main"
                  : selectedFiles.length > 0
                  ? "primary.light"
                  : "divider",
                bgcolor: isCapacityFull
                  ? alpha("#10B981", 0.04)
                  : isDragOver
                  ? alpha("#06B6D4", 0.08)
                  : "background.default",
                textAlign: "center",
                cursor: isCapacityFull ? "default" : "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  borderColor: isCapacityFull ? "success.main" : "primary.main",
                  bgcolor: isCapacityFull ? alpha("#10B981", 0.06) : alpha("#06B6D4", 0.03),
                },
                "@keyframes alonWaveMove": {
                  "0%": { transform: "translateX(0)" },
                  "100%": { transform: "translateX(-50%)" },
                },
              }}
            >
              {/* Dynamic Fluid Ocean Wave rising inside the tank */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: selectedFiles.length === 0 ? "24px" : isCapacityFull ? "100%" : `${Math.max(22, fillPercent)}%`,
                  transition: "height 0.6s cubic-bezier(0.34, 1.25, 0.64, 1)",
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                {/* Wave Crest SVG */}
                <Box
                  sx={{
                    width: "100%",
                    height: 34,
                    flexShrink: 0,
                    overflow: "hidden",
                    opacity: isCapacityFull ? 0.95 : 0.85,
                  }}
                >
                  <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{
                      width: "200%",
                      height: "100%",
                      animation: isDragOver ? "alonWaveMove 2.5s linear infinite" : "alonWaveMove 5s linear infinite",
                    }}
                  >
                    <path
                      d="M0,35 C150,85 350,5 500,50 C650,95 900,15 1200,55 L1200,120 L0,120 Z"
                      fill={isCapacityFull ? "rgba(16, 185, 129, 0.38)" : "rgba(6, 182, 212, 0.32)"}
                    />
                    <path
                      d="M0,55 C200,105 400,15 600,65 C800,115 1000,25 1200,70 L1200,120 L0,120 Z"
                      fill={isCapacityFull ? "rgba(5, 150, 105, 0.45)" : "rgba(2, 132, 199, 0.38)"}
                    />
                  </svg>
                </Box>

                {/* Submerged Water Body filling the bottom */}
                <Box
                  sx={{
                    width: "100%",
                    flex: 1,
                    background: isCapacityFull
                      ? "linear-gradient(180deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.42) 100%)"
                      : "linear-gradient(180deg, rgba(6, 182, 212, 0.16) 0%, rgba(2, 132, 199, 0.3) 100%)",
                  }}
                />
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.doc,.docx,.tiff,.png,.jpg,.xlsx,.xls"
                disabled={isCapacityFull}
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              {/* Tank Foreground Content */}
              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: isCapacityFull ? alpha("#10B981", 0.14) : (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: isCapacityFull ? "success.main" : "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.25,
                  }}
                >
                  {isCapacityFull ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 30 }} />
                  ) : (
                    <CloudUploadOutlinedIcon sx={{ fontSize: 30 }} />
                  )}
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  {isCapacityFull ? (
                    <Box component="span" sx={{ color: "success.main" }}>
                      Bulk Capacity Reached ({selectedFiles.length}/{MAX_BULK_FILES})
                    </Box>
                  ) : (
                    <>
                      Drag and drop records here, or{" "}
                      <Box component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>
                        browse files
                      </Box>
                    </>
                  )}
                </Typography>

                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontSize: "0.8rem" }}>
                  Supports PDF, DOCX, XLSX, Scanned TIF and JPG vouchers
                </Typography>

                {/* Metric Display inside the tank: {number}/25 */}
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    label={`${selectedFiles.length}/${MAX_BULK_FILES}`}
                    color={isCapacityFull ? "success" : selectedFiles.length > 0 ? "primary" : "default"}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                      height: 26,
                      px: 0.5,
                      boxShadow: isCapacityFull ? "0 2px 8px rgba(16, 185, 129, 0.25)" : "none",
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Standard, Clean Staged Files List (No heavy animations, optimal for PC performance) */}
            {selectedFiles.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}>
                      Staged Records ({selectedFiles.length}/{MAX_BULK_FILES})
                    </Typography>
                    <Chip
                      size="small"
                      label={formatFileSize(totalBytes)}
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                    />
                  </Stack>

                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setSelectedFiles([])}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      minWidth: "auto",
                      p: 0,
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    Clear all
                  </Button>
                </Box>

                <Stack spacing={0.75} sx={{ maxHeight: 180, overflowY: "auto", pr: 0.5 }}>
                  {selectedFiles.map((file, idx) => (
                    <Paper
                      key={`${file.name}-${idx}`}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        px: 1.5,
                        borderRadius: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", overflow: "hidden", minWidth: 0 }}>
                        {getFileIcon(file.name)}
                        <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(idx)}
                        sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Physical Storage Coordinates Dropdown */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "text.secondary",
                  display: "block",
                  mb: 1,
                }}
              >
                Physical Archival Vault Coordinates
              </Typography>
              <CabinetSelectDropdown
                cabinet={cabinet}
                onCabinetChange={setCabinet}
                shelf={shelf}
                onShelfChange={setShelf}
                folder={folder}
                onFolderChange={setFolder}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.75, fontSize: "0.74rem" }}>
                Alon will bind physical shelf coordinates ({cabinet} • {shelf} • {folder}) to the digital index upon archiving.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>

          {/* Standard normal button color */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={selectedFiles.length === 0}
            startIcon={<SaveOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
