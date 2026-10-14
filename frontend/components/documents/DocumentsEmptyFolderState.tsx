"use client";

import React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

interface DocumentsEmptyFolderStateProps {
  isDeletedMode?: boolean;
  onOpenCreateFolder: () => void;
  onOpenUpload: () => void;
}

export default function DocumentsEmptyFolderState({
  isDeletedMode = false,
  onOpenCreateFolder,
  onOpenUpload,
}: DocumentsEmptyFolderStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <FolderOutlinedIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {isDeletedMode ? "No soft-deleted records here" : "This folder is empty"}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", mb: 2.5 }}>
        {isDeletedMode
          ? "There are currently no soft-deleted records or quarantined subfolders in this location."
          : "There are no files or subfolders here yet. You can create a subfolder or upload official documents directly into this location."}
      </Typography>

      {!isDeletedMode && (
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "center" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenCreateFolder}
            startIcon={<CreateNewFolderOutlinedIcon />}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            New Subfolder
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={onOpenUpload}
            startIcon={<CloudUploadOutlinedIcon />}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            Upload File
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
