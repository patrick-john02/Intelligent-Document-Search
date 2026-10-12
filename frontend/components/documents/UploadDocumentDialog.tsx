"use client";

import React, { useState, useRef } from "react";
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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CabinetSelectDropdown from "./CabinetSelectDropdown";
import { formatFileSize, ArchivingCabinetConfig } from "./useArchivingTask";

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onStartArchiving: (files: File[], config: ArchivingCabinetConfig) => void;
}

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

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newArr = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newArr]);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Upload Documents
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Upload 1 file or bulk records. Document title and official metadata will be autonomously discovered by the Archiving Agent.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Autonomous Archiving Notice */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(37, 99, 235, 0.04)",
                borderColor: "rgba(37, 99, 235, 0.2)",
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ color: "primary.main", fontSize: 20, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem", color: "text.primary" }}>
                  Autonomous Title & Metadata Discovery
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem", lineHeight: 1.4 }}>
                  You only need to select the physical cabinet location. Our Archiving Agent and deep learning model automatically extract document titles, circular codes, and summaries directly from the file contents.
                </Typography>
              </Box>
            </Paper>

            {/* Drag & Drop File Zone (Supports 1 or Bulk) */}
            <Paper
              variant="outlined"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "2px dashed",
                borderColor: isDragOver ? "primary.main" : "divider",
                bgcolor: isDragOver ? "action.hover" : "background.default",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.doc,.docx,.tiff,.png,.jpg"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Drop single or bulk files here, or{" "}
                <Box component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>
                  browse
                </Box>
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                Supports PDF, DOCX, TIFF, Scanned Vouchers (Bulk uploads supported)
              </Typography>
            </Paper>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Selected Files ({selectedFiles.length})
                  </Typography>
                  <Chip
                    size="small"
                    label={formatFileSize(totalBytes)}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                  />
                </Box>

                <Stack spacing={1} sx={{ maxHeight: 180, overflowY: "auto", pr: 0.5 }}>
                  {selectedFiles.map((file, idx) => (
                    <Paper
                      key={`${file.name}-${idx}`}
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", overflow: "hidden" }}>
                        <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
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

            {/* Physical Storage Coordinates Dropdown (Can add new inside) */}
            <CabinetSelectDropdown
              cabinet={cabinet}
              onCabinetChange={setCabinet}
              shelf={shelf}
              onShelfChange={setShelf}
              folder={folder}
              onFolderChange={setFolder}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={onClose}
            sx={{ borderRadius: 1.5, textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>

          {/* Prompt specified: "change the confirm & ingest into 'save'" */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={selectedFiles.length === 0}
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              px: 3,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
