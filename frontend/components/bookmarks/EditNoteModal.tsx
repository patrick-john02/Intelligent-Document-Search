"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { BookmarkItem } from "./types";

interface EditNoteModalProps {
  open: boolean;
  item: BookmarkItem | null;
  collections: string[];
  onClose: () => void;
  onSave: (id: string, notes: string, collection: string) => void;
}

export default function EditNoteModal({
  open,
  item,
  collections,
  onClose,
  onSave,
}: EditNoteModalProps) {
  const [notes, setNotes] = useState("");
  const [collection, setCollection] = useState("");

  useEffect(() => {
    if (item) {
      setNotes(item.personalNotes || "");
      setCollection(item.collection || "General Operations");
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onSave(item.id, notes, collection);
    onClose();
  };

  const availableCollections = collections.filter((c) => c !== "All");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Edit Note & Collection
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {item.orderNo} — {item.title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="edit-collection-label">Collection</InputLabel>
            <Select
              labelId="edit-collection-label"
              value={collection}
              label="Collection"
              onChange={(e) => setCollection(e.target.value)}
              sx={{ borderRadius: 1 }}
            >
              {availableCollections.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Personal Notes / Annotations"
            multiline
            rows={4}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal notes, cross-references, or statutory reminders regarding this directive..."
            slotProps={{
              input: {
                sx: { borderRadius: 1, fontSize: "0.85rem" },
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: 1, textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          sx={{ borderRadius: 1, textTransform: "none", fontWeight: 700 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
