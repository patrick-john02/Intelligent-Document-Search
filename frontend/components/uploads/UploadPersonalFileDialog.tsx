"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import GoogleIcon from "@mui/icons-material/Google";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import { PersonalFileCategory, PersonalFileItem } from "./types";

interface UploadPersonalFileDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: (item: PersonalFileItem) => void;
  isDriveConnected: boolean;
}

export default function UploadPersonalFileDialog({
  open,
  onClose,
  onUploadSuccess,
  isDriveConnected,
}: UploadPersonalFileDialogProps) {
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<PersonalFileCategory>("Directives");
  const [tagsInput, setTagsInput] = useState("Directives, Personal");
  const [summary, setSummary] = useState("");
  const [syncToDrive, setSyncToDrive] = useState(isDriveConnected);
  const [dragActive, setDragActive] = useState(false);

  // Sync state default to isDriveConnected when dialog opens
  React.useEffect(() => {
    if (open) {
      setSyncToDrive(isDriveConnected);
    }
  }, [open, isDriveConnected]);

  const handleSimulateFileSelect = (name: string, size: string) => {
    setFileName(name);
    if (!title) {
      const cleanTitle = name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanTitle);
    }
  };

  const getExtension = (name: string): "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "image" | "other" => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "docx" || ext === "doc") return "docx";
    if (ext === "xlsx" || ext === "xls" || ext === "csv") return "xlsx";
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") return "image";
    if (ext === "txt") return "txt";
    return "other";
  };

  const handleSubmit = () => {
    if (!fileName.trim()) return;

    const ext = getExtension(fileName);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: PersonalFileItem = {
      id: `pf-${Date.now()}`,
      title: title.trim() || fileName,
      fileName: fileName.trim(),
      fileSize: "2.4 MB",
      fileSizeBytes: 2516582,
      fileExtension: ext,
      uploadedAt: formattedDate,
      lastModified: formattedDate,
      category: category,
      tags: tags.length ? tags : ["Personal", category],
      isStarred: false,
      isGoogleDriveSynced: syncToDrive && isDriveConnected,
      googleSyncStatus: syncToDrive && isDriveConnected ? "synced" : "local_only",
      googleDriveFileId:
        syncToDrive && isDriveConnected ? `gdrive_${Date.now()}_file` : undefined,
      googleDriveWebViewLink:
        syncToDrive && isDriveConnected
          ? `https://drive.google.com/file/d/gdrive_${Date.now()}/view`
          : undefined,
      googleDriveFolder:
        syncToDrive && isDriveConnected
          ? "My Drive / Intelligent Document Search / Personal Files"
          : undefined,
      lastSyncedAt: syncToDrive && isDriveConnected ? formattedDate : undefined,
      ocrStatus: "completed",
      extractedSummary:
        summary.trim() ||
        `Personal ${category} document uploaded to user vault. OCR text extracted and indexed into vector search.`,
      extractedTextSnippet: `Document Title: ${title || fileName}. Ingested into personal files archive on ${formattedDate}. All text segments vectorized for full-text search.`,
      pageCount: 5,
      version: "v1.0",
    };

    onUploadSuccess(newItem);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTitle("");
    setFileName("");
    setCategory("Directives");
    setTagsInput("Directives, Personal");
    setSummary("");
    setSyncToDrive(isDriveConnected);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
        <CloudUploadRoundedIcon color="primary" />
        Upload to Personal Files & Extended Drive
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Dropzone Area */}
          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) {
                const f = e.dataTransfer.files[0];
                handleSimulateFileSelect(f.name, `${(f.size / (1024 * 1024)).toFixed(1)} MB`);
              }
            }}
            onClick={() => {
              // Simulated upload picker
              const mockFiles = [
                "2024-property-tax-ordinance-review.pdf",
                "revised-assessor-inspection-report.docx",
                "special-education-fund-allocation.xlsx",
                "cashier-workflow-procedural-notes.txt",
              ];
              const random = mockFiles[Math.floor(Math.random() * mockFiles.length)];
              handleSimulateFileSelect(random, "2.6 MB");
            }}
            sx={(theme) => ({
              p: 3,
              borderRadius: 2.5,
              border: "2px dashed",
              borderColor: dragActive ? "primary.main" : "divider",
              bgcolor: dragActive
                ? "action.selected"
                : theme.vars
                  ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.5)`
                  : "action.hover",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            })}
          >
            <CloudUploadRoundedIcon sx={{ fontSize: 36, color: "text.secondary", mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {fileName ? fileName : "Click to select or drag and drop a file"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Supports PDF, Word (DOCX), Excel (XLSX), Plain Text, and Images (up to 50MB)
            </Typography>
          </Box>

          {/* Title & Metadata */}
          <TextField
            label="Document Title"
            size="small"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Regional Land Tax Assessment"
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value as PersonalFileCategory)}
              >
                <MenuItem value="Directives">Directives</MenuItem>
                <MenuItem value="Reports">Reports</MenuItem>
                <MenuItem value="Forms">Forms</MenuItem>
                <MenuItem value="Drafts">Drafts</MenuItem>
                <MenuItem value="Personal Notes">Personal Notes</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Keywords / Tags (comma separated)"
              size="small"
              fullWidth
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </Stack>

          <TextField
            label="Brief Description / Summary (optional)"
            size="small"
            multiline
            rows={2}
            fullWidth
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add brief notes or context for the OCR summary..."
          />

          {/* Extended Google Drive Sync Checkbox */}
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: syncToDrive ? "#4285F4" : "divider",
              bgcolor: theme.vars
                ? syncToDrive
                  ? "rgba(66, 133, 244, 0.05)"
                  : `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
                : "action.hover",
            })}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={syncToDrive}
                  disabled={!isDriveConnected}
                  onChange={(e) => setSyncToDrive(e.target.checked)}
                  sx={{ "&.Mui-checked": { color: "#4285F4" } }}
                />
              }
              label={
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <GoogleIcon sx={{ fontSize: 16, color: "#4285F4" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Automatically sync to my Google Drive
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    {isDriveConnected
                      ? "A copy will be uploaded to: My Drive / Intelligent Document Search / Personal Files"
                      : "Connect Google SSO in the top banner to enable automatic cloud backup"}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!fileName.trim()}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
          }}
        >
          Upload & Ingest
        </Button>
      </DialogActions>
    </Dialog>
  );
}
