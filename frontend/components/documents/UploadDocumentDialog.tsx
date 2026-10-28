"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha } from "@mui/material/styles";

// MUI Icons
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

import CabinetSelectDropdown from "./CabinetSelectDropdown";
import {
  formatFileSize,
  titleFromFileName,
  ArchivingCabinetConfig,
  StagedUploadItem,
} from "./useArchivingTask";
import {
  listCategories,
  CLEARANCE_OPTIONS,
  ClearanceLevelValue,
  DocumentCategory,
} from "@/lib/documentsApi";
import { ArchiveDocument, ArchiveFolder } from "./types";

export const MAX_BULK_FILES = 25;

export interface StagedItem {
  id: string;
  file: File;
  title: string;
  departmentOrder: string;
  seriesDate: string;
}

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onStartArchiving: (
    files: (File | StagedUploadItem)[],
    config: ArchivingCabinetConfig
  ) => void;
  currentFolder?: ArchiveFolder | null;
  breadcrumbTrail?: { id: string | null; name: string }[];
  initialFiles?: File[];
  existingDocuments?: ArchiveDocument[];
}

export default function UploadDocumentDialog({
  open,
  onClose,
  onStartArchiving,
  currentFolder,
  breadcrumbTrail,
  initialFiles = [],
  existingDocuments = [],
}: UploadDocumentDialogProps) {
  // Mode: "autonomous" (Alon AI extracts metadata) vs "precision" (Manual metadata override)
  const [ingestionMode, setIngestionMode] = useState<"autonomous" | "precision">("autonomous");

  const [stagedFiles, setStagedFiles] = useState<StagedItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Metadata
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevelValue>("public");
  const [bulkSeriesDate, setBulkSeriesDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [bulkDepartmentOrder, setBulkDepartmentOrder] = useState("");

  // Physical storage coordinates
  const [cabinet, setCabinet] = useState("Cabinet A");
  const [shelf, setShelf] = useState("Shelf 1");
  const [folder, setFolder] = useState("Folder 01");

  // Load Categories on Open
  useEffect(() => {
    if (!open) return;
    setIsLoadingCategories(true);
    listCategories()
      .then((data) => {
        setCategoriesError(null);
        setCategories(data);
        setCategoryId((prev) => (prev === "" && data.length > 0 ? data[0].id : prev));
      })
      .catch((err) => setCategoriesError(err?.message || "Could not load categories"))
      .finally(() => setIsLoadingCategories(false));
  }, [open]);

  // Sync initialFiles (e.g. from workspace drag-and-drop)
  useEffect(() => {
    if (!open) {
      setStagedFiles([]);
      return;
    }
    if (initialFiles && initialFiles.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const items: StagedItem[] = initialFiles.slice(0, MAX_BULK_FILES).map((f, i) => ({
        id: `init-${Date.now()}-${i}-${f.name}`,
        file: f,
        title: titleFromFileName(f.name),
        departmentOrder: "",
        seriesDate: today,
      }));
      setStagedFiles(items);
    }
  }, [open, initialFiles]);

  const handleFilesAdded = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const today = bulkSeriesDate || new Date().toISOString().split("T")[0];

    setStagedFiles((prev) => {
      const remainingSlots = MAX_BULK_FILES - prev.length;
      if (remainingSlots <= 0) return prev;
      const validToAdd = incoming.slice(0, remainingSlots);

      const mapped: StagedItem[] = validToAdd.map((f, i) => ({
        id: `staged-${Date.now()}-${i}-${f.name}`,
        file: f,
        title: titleFromFileName(f.name),
        departmentOrder: bulkDepartmentOrder || "",
        seriesDate: today,
      }));
      return [...prev, ...mapped];
    });
  };

  const handleRemoveFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, patch: Partial<StagedItem>) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleApplyBulkOrderNo = () => {
    if (!bulkDepartmentOrder.trim()) return;
    setStagedFiles((prev) =>
      prev.map((item) => ({
        ...item,
        departmentOrder: bulkDepartmentOrder.trim(),
      }))
    );
  };

  // Drag-and-drop inside the dialog zone
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

  // Validation
  const isCapacityFull = stagedFiles.length >= MAX_BULK_FILES;
  const totalBytes = stagedFiles.reduce((acc, f) => acc + f.file.size, 0);

  const canSubmit = useMemo(() => {
    if (stagedFiles.length === 0 || categoryId === "") return false;
    if (ingestionMode === "precision") {
      // In precision mode, ensure each item or bulk order has an order number
      return stagedFiles.every(
        (f) => f.departmentOrder.trim() !== "" || bulkDepartmentOrder.trim() !== ""
      );
    }
    // In autonomous mode, Alon extracts missing metadata
    return true;
  }, [stagedFiles, categoryId, ingestionMode, bulkDepartmentOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload: StagedUploadItem[] = stagedFiles.map((item) => ({
      file: item.file,
      customTitle: item.title.trim() || titleFromFileName(item.file.name),
      customDepartmentOrder:
        item.departmentOrder.trim() ||
        bulkDepartmentOrder.trim() ||
        (ingestionMode === "autonomous" ? "AUTO_EXTRACT" : "UNASSIGNED"),
      customSeriesDate: item.seriesDate || bulkSeriesDate,
    }));

    onStartArchiving(payload, {
      cabinet,
      shelf,
      folder,
      categoryId: Number(categoryId),
      categoryName: categories.find((c) => c.id === categoryId)?.name ?? "General",
      clearanceLevel,
      seriesDate: bulkSeriesDate,
      departmentOrder:
        bulkDepartmentOrder.trim() ||
        (ingestionMode === "autonomous" ? "AUTO_EXTRACT" : "UNASSIGNED"),
    });

    setStagedFiles([]);
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
      return <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />;
    }
    if (ext === "docx" || ext === "doc") {
      return <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />;
    }
    if (ext === "pdf") {
      return <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />;
    }
    return <InsertDriveFileRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />;
  };

  // Check duplicate filename against existing document catalog
  const checkDuplicate = (filename: string) => {
    const clean = filename.toLowerCase();
    return existingDocuments.some(
      (doc) => doc.fileName?.toLowerCase() === clean || doc.title?.toLowerCase() === clean
    );
  };

  const destinationPath = useMemo(() => {
    if (breadcrumbTrail && breadcrumbTrail.length > 0) {
      return breadcrumbTrail.map((b) => b.name).join(" / ");
    }
    return currentFolder ? currentFolder.name : "Archive Root";
  }, [breadcrumbTrail, currentFolder]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            width: "100%",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 12px 40px rgba(0, 0, 0, 0.85)"
                : "0 12px 40px rgba(15, 23, 42, 0.12)",
          },
        },
      }}
    >
      {/* Top Accent Strip */}
      <Box
        sx={{
          height: 3,
          background: "linear-gradient(90deg, #06B6D4, #3B82F6, #10B981)",
          flexShrink: 0,
        }}
      />

      {/* Header Bar */}
      <DialogTitle
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha("#06B6D4", 0.02),
          flexShrink: 0,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.2 }}>
              Upload Records & Scans
            </Typography>
            <Chip
              icon={<FolderOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label={destinationPath}
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                fontSize: "0.72rem",
                fontWeight: 600,
                borderColor: alpha("#06B6D4", 0.35),
                bgcolor: alpha("#06B6D4", 0.05),
              }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
            Ingest official documents, scanned ordinances, executive orders, and vouchers.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {/* Mode Switcher */}
          <ToggleButtonGroup
            value={ingestionMode}
            exclusive
            onChange={(_, val) => val && setIngestionMode(val)}
            size="small"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
              borderRadius: 2,
              p: 0.25,
              "& .MuiToggleButton-root": {
                py: 0.4,
                px: 1.2,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 1.5,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  color: "primary.main",
                },
              },
            }}
          >
            <ToggleButton value="autonomous">
              <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                <SmartToyOutlinedIcon sx={{ fontSize: 14, color: "#06B6D4" }} />
                <span>Autonomous (Alon AI)</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="precision">
              <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                <TuneRoundedIcon sx={{ fontSize: 14 }} />
                <span>Manual Indexing</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      {/* Main Form Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogContent sx={{ p: 3, flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Stack spacing={2.5}>
            {/* Alon Agent Telemetry Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha("#06B6D4", 0.25),
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha("#06B6D4", 0.08)
                    : alpha("#06B6D4", 0.04),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Avatar
                  src="/alon.png"
                  alt="Agent Alon"
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "#FFFFFF",
                    border: "1.5px solid #06B6D4",
                    boxShadow: "0 2px 6px rgba(6,182,212,0.25)",
                    "& img": { objectFit: "contain", p: 0.25 },
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.82rem", lineHeight: 1.2 }}>
                    Agent Alon • Archiving Ingestion Pipeline
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
                    {ingestionMode === "autonomous"
                      ? "Autonomous mode: Drops are auto-parsed with high-resolution OCR, circular code extraction, and draft proposals."
                      : "Precision mode: Explicitly define department orders and shelf coordinates per document."}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={`${stagedFiles.length}/${MAX_BULK_FILES} records`}
                size="small"
                color={isCapacityFull ? "success" : "default"}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                }}
              />
            </Paper>

            {/* Drop Zone */}
            <Paper
              variant="outlined"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!isCapacityFull) fileInputRef.current?.click();
              }}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2.5,
                border: "2px dashed",
                borderColor: isCapacityFull
                  ? "success.main"
                  : isDragOver
                  ? "primary.main"
                  : stagedFiles.length > 0
                  ? alpha("#06B6D4", 0.4)
                  : "divider",
                bgcolor: isCapacityFull
                  ? alpha("#10B981", 0.04)
                  : isDragOver
                  ? alpha("#06B6D4", 0.08)
                  : (theme) => alpha(theme.palette.background.default, 0.5),
                cursor: isCapacityFull ? "default" : "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: isCapacityFull ? "success.main" : "primary.main",
                  bgcolor: alpha("#06B6D4", 0.03),
                },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.doc,.docx,.tiff,.png,.jpg,.jpeg,.xlsx,.xls"
                disabled={isCapacityFull}
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: isCapacityFull
                    ? alpha("#10B981", 0.12)
                    : isDragOver
                    ? alpha("#06B6D4", 0.16)
                    : alpha("#06B6D4", 0.08),
                  color: isCapacityFull ? "success.main" : "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1,
                  transform: isDragOver ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              >
                {isCapacityFull ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 26 }} />
                ) : (
                  <CloudUploadOutlinedIcon sx={{ fontSize: 26 }} />
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                {isCapacityFull ? (
                  "Batch capacity reached (25 files)"
                ) : isDragOver ? (
                  "Drop files here to stage for archiving"
                ) : (
                  <>
                    Drag & drop files here, or{" "}
                    <Box component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>
                      browse computer
                    </Box>
                  </>
                )}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontSize: "0.76rem" }}>
                Supports PDF, DOCX, XLSX, Scanned TIFF and JPEG vouchers (up to 100MB each)
              </Typography>
            </Paper>

            {/* Staged Records Section */}
            {stagedFiles.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "text.secondary",
                      }}
                    >
                      Staged Records ({stagedFiles.length})
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
                    onClick={() => setStagedFiles([])}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    Clear all
                  </Button>
                </Box>

                {/* Staged Items Table / List */}
                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 220,
                    overflowY: "auto",
                    borderRadius: 2,
                    p: 0.5,
                  }}
                >
                  <Stack spacing={0.75}>
                    {stagedFiles.map((item) => {
                      const isDup = checkDuplicate(item.file.name);
                      return (
                        <Paper
                          key={item.id}
                          elevation={0}
                          sx={{
                            p: 1.25,
                            px: 1.5,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: isDup ? "warning.light" : "divider",
                            bgcolor: isDup
                              ? alpha("#F59E0B", 0.04)
                              : "background.paper",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            transition: "all 0.15s ease",
                            "&:hover": {
                              borderColor: "primary.main",
                              boxShadow: "0 2px 8px rgba(6,182,212,0.08)",
                            },
                          }}
                        >
                          {/* File Icon */}
                          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                            {getFileIcon(item.file.name)}
                          </Box>

                          {/* File Name & Size */}
                          <Box sx={{ minWidth: 160, flex: 1 }}>
                            <Tooltip title={item.file.name}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.3 }}
                              >
                                {item.file.name}
                              </Typography>
                            </Tooltip>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.25 }}>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                              >
                                {formatFileSize(item.file.size)}
                              </Typography>
                              {isDup && (
                                <Chip
                                  size="small"
                                  icon={<WarningAmberRoundedIcon sx={{ fontSize: "11px !important" }} />}
                                  label="Potential Duplicate"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700 }}
                                />
                              )}
                            </Stack>
                          </Box>

                          {/* Per-file inputs depending on mode */}
                          {ingestionMode === "precision" ? (
                            <Stack direction="row" spacing={1} sx={{ flex: 1.4, minWidth: 0 }}>
                              <TextField
                                size="small"
                                placeholder="Document Title"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { title: e.target.value })
                                }
                                sx={{
                                  flex: 1,
                                  "& .MuiInputBase-input": {
                                    fontSize: "0.76rem",
                                    py: 0.6,
                                    px: 1,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                placeholder="Order No (e.g. PAO-2024)"
                                value={item.departmentOrder}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { departmentOrder: e.target.value })
                                }
                                sx={{
                                  width: 140,
                                  "& .MuiInputBase-input": {
                                    fontSize: "0.76rem",
                                    py: 0.6,
                                    px: 1,
                                  },
                                }}
                              />
                            </Stack>
                          ) : (
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <Chip
                                size="small"
                                icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "11px !important", color: "#06B6D4" }} />}
                                label="Alon Auto-Extract"
                                sx={{
                                  height: 22,
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  bgcolor: alpha("#06B6D4", 0.08),
                                  color: "#0284C7",
                                }}
                              />
                            </Stack>
                          )}

                          {/* Remove Button */}
                          <Tooltip title="Remove record">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(item.id)}
                              sx={{
                                color: "text.secondary",
                                flexShrink: 0,
                                p: 0.5,
                                "&:hover": { color: "error.main" },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>
            )}

            <Divider />

            {/* Metadata & Storage Settings (2 Columns) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
                gap: 2.5,
              }}
            >
              {/* Left Column: Classification & Security */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "text.secondary",
                    display: "block",
                    mb: 1.25,
                  }}
                >
                  Classification & Security
                </Typography>

                {categoriesError && (
                  <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.78rem" }}>
                    {categoriesError}
                  </Alert>
                )}

                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      select
                      required
                      size="small"
                      label="Document Category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      disabled={isLoadingCategories || categories.length === 0}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      required
                      size="small"
                      label="Clearance Level"
                      value={clearanceLevel}
                      onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevelValue)}
                    >
                      {CLEARANCE_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      size="small"
                      type="date"
                      label="Series Date"
                      value={bulkSeriesDate}
                      onChange={(e) => setBulkSeriesDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                      size="small"
                      label={
                        ingestionMode === "autonomous"
                          ? "Default Order No (Optional)"
                          : "Batch Department / Order No"
                      }
                      placeholder={
                        ingestionMode === "autonomous"
                          ? "Leave blank for Alon OCR"
                          : "e.g. PAO-2024-001"
                      }
                      value={bulkDepartmentOrder}
                      onChange={(e) => setBulkDepartmentOrder(e.target.value)}
                    />
                  </Box>

                  {ingestionMode === "precision" && bulkDepartmentOrder && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={handleApplyBulkOrderNo}
                      sx={{
                        fontSize: "0.72rem",
                        textTransform: "none",
                        alignSelf: "flex-start",
                        p: 0,
                      }}
                    >
                      Apply &quot;{bulkDepartmentOrder}&quot; to all staged records
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* Right Column: Physical Coordinates */}
              <Box>
                <CabinetSelectDropdown
                  cabinet={cabinet}
                  onCabinetChange={setCabinet}
                  shelf={shelf}
                  onShelfChange={setShelf}
                  folder={folder}
                  onFolderChange={setFolder}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            py: 1.75,
            px: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.8)
                : alpha(theme.palette.background.default, 0.5),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 14, color: "#06B6D4" }} />
            Ingestion runs non-blocking in the background.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={onClose}
              color="inherit"
              size="small"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.82rem" }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={!canSubmit}
              startIcon={<CloudUploadOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                px: 2.5,
                borderRadius: 1.75,
                boxShadow: "0 2px 8px rgba(6, 182, 212, 0.25)",
              }}
            >
              {stagedFiles.length > 0
                ? `Ingest & Archive (${stagedFiles.length})`
                : "Ingest & Archive"}
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
