"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

interface NewCollectionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function NewCollectionModal({
  open,
  onClose,
  onCreate,
}: NewCollectionModalProps) {
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = collectionName.trim();
    if (!trimmed) {
      setError("Please enter a collection name.");
      return;
    }
    onCreate(trimmed);
    setCollectionName("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1,
            p: 1,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Collection
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Group your saved directives into subject-matter collections.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Collection Name"
              size="small"
              fullWidth
              value={collectionName}
              onChange={(e) => {
                setCollectionName(e.target.value);
                if (error) setError("");
              }}
              error={Boolean(error)}
              helperText={error || "e.g. 2025 Audit Guidelines, Revenue Codes..."}
              slotProps={{
                input: {
                  sx: { borderRadius: 1 },
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 700 }}
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
