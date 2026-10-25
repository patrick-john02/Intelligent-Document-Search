"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { ArchiveFolder } from "./types";
import { FOLDER_COLOR_PALETTE } from "./mockData";

export interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
  currentFolderName?: string;
}

export function CreateFolderDialog({
  open,
  onClose,
  onCreate,
  currentFolderName,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");

  useEffect(() => {
    if (open) {
      setName("");
      setColor("#F59E0B");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, fontSize: "1.05rem" }}>
        Create New Folder
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
          Creating folder inside: <strong>{currentFolderName || "Home"}</strong>
        </Typography>

        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Folder Name"
          placeholder="e.g. Series 2025 Assessment Directives"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          sx={{ mb: 2.5 }}
        />

        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
          Select Folder Color:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {FOLDER_COLOR_PALETTE.map((p) => (
            <Box
              key={p.hex}
              onClick={() => setColor(p.hex)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: p.hex,
                cursor: "pointer",
                border: color === p.hex ? "2.5px solid" : "1px solid transparent",
                borderColor: color === p.hex ? "primary.contrastText" : "transparent",
                boxShadow: color === p.hex ? `0 0 0 2px ${p.hex}` : "none",
                transition: "all 0.12s ease",
              }}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim()}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Create Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface RenameFolderDialogProps {
  folder: ArchiveFolder | null;
  onClose: () => void;
  onRename: (folder: ArchiveFolder, newName: string) => void;
}

export function RenameFolderDialog({ folder, onClose, onRename }: RenameFolderDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    }
  }, [folder]);

  const handleSubmit = () => {
    if (!folder || !name.trim()) return;
    onRename(folder, name.trim());
  };

  return (
    <Dialog
      open={Boolean(folder)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, fontSize: "1.05rem" }}>
        Rename Folder
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Folder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim()}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Save Name
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface DeleteFolderDialogProps {
  folder: ArchiveFolder | null;
  onClose: () => void;
  onDelete: (folder: ArchiveFolder) => void;
}

export function DeleteFolderDialog({ folder, onClose, onDelete }: DeleteFolderDialogProps) {
  return (
    <Dialog
      open={Boolean(folder)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700, fontSize: "1.05rem" }}>
        Delete Folder
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Are you sure you want to delete &quot;<strong>{folder?.name}</strong>&quot;? Documents inside will be preserved and moved up to the parent folder.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          size="small"
          color="error"
          variant="contained"
          onClick={() => folder && onDelete(folder)}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
