"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import GoogleIcon from "@mui/icons-material/Google";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import { PersonalFileCategory, PersonalFileItem } from "./types";

interface GoogleDriveImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportFiles: (files: PersonalFileItem[]) => void;
  userEmail?: string;
}

interface MockDriveFile {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx";
  size: string;
  category: PersonalFileCategory;
  modified: string;
  summary: string;
}

const DRIVE_MOCK_FILES: MockDriveFile[] = [
  {
    id: "gdrive-import-1",
    name: "Executive-Summary-Revenue-Code-Revision.pdf",
    type: "pdf",
    size: "2.8 MB",
    category: "Reports",
    modified: "Yesterday, 3:15 PM",
    summary: "Executive summary detailing proposed amendments to the provincial revenue code.",
  },
  {
    id: "gdrive-import-2",
    name: "Tax-Exemption-Guidelines-Renewable-Energy.docx",
    type: "docx",
    size: "1.2 MB",
    category: "Directives",
    modified: "Oct 12, 2024",
    summary: "Clarification guidelines for real property tax exemptions on commercial solar installations.",
  },
  {
    id: "gdrive-import-3",
    name: "Assessment-Roll-Audit-Checklist-Template.xlsx",
    type: "xlsx",
    size: "1.9 MB",
    category: "Forms",
    modified: "Sep 28, 2024",
    summary: "Standardized audit checklist matrix for validating cadastral parcel numbers against registry deeds.",
  },
];

export default function GoogleDriveImportDialog({
  open,
  onClose,
  onImportFiles,
  userEmail,
}: GoogleDriveImportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    const selected = DRIVE_MOCK_FILES.filter((f) => selectedIds.includes(f.id));
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newFiles: PersonalFileItem[] = selected.map((f) => ({
      id: `pf-gdrive-${Date.now()}-${f.id}`,
      title: f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      fileName: f.name,
      fileSize: f.size,
      fileExtension: f.type,
      uploadedAt: formattedDate,
      lastModified: formattedDate,
      category: f.category,
      tags: ["Google Drive", f.category, "Imported"],
      isStarred: false,
      isGoogleDriveSynced: true,
      googleSyncStatus: "synced",
      googleDriveFileId: f.id,
      googleDriveWebViewLink: `https://drive.google.com/file/d/${f.id}/view`,
      googleDriveFolder: "My Drive / Shared with Me",
      lastSyncedAt: formattedDate,
      ocrStatus: "completed",
      extractedSummary: f.summary,
      extractedTextSnippet: `Imported from Google Drive: ${f.name}. Full text OCR indexing executed successfully.`,
      pageCount: 6,
      version: "v1.0",
    }));

    onImportFiles(newFiles);
    setSelectedIds([]);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <PictureAsPdfRoundedIcon sx={{ color: "#EF4444" }} />;
      case "docx":
        return <DescriptionRoundedIcon sx={{ color: "#2563EB" }} />;
      case "xlsx":
        return <TableChartRoundedIcon sx={{ color: "#10B981" }} />;
      default:
        return <DescriptionRoundedIcon />;
    }
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
        <GoogleIcon sx={{ color: "#4285F4" }} />
        Import from Google Drive
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            Connected to Google Drive account: <strong>{userEmail || "user@organization.gov"}</strong>
          </Alert>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <FolderRoundedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              FOLDER: My Drive / Intelligent Document Search
            </Typography>
          </Box>

          <List sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 0 }}>
            {DRIVE_MOCK_FILES.map((file) => {
              const isChecked = selectedIds.includes(file.id);

              return (
                <ListItem key={file.id} disablePadding divider>
                  <ListItemButton onClick={() => handleToggle(file.id)} sx={{ py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        disableRipple
                        sx={{ "&.Mui-checked": { color: "#4285F4" } }}
                      />
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 36 }}>{getIcon(file.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {file.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {file.size} • Modified {file.modified}
                        </Typography>
                      }
                    />
                    <Chip
                      size="small"
                      label={file.category}
                      variant="outlined"
                      sx={{ fontSize: "0.68rem", height: 20 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0}
          onClick={handleImport}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#4285F4",
            "&:hover": { bgcolor: "#3367D6" },
          }}
        >
          Import Selected ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
