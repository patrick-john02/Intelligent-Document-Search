"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

interface CabinetSelectDropdownProps {
  cabinet: string;
  onCabinetChange: (val: string) => void;
  shelf: string;
  onShelfChange: (val: string) => void;
  folder: string;
  onFolderChange: (val: string) => void;
}

const DEFAULT_CABINETS = [
  "Cabinet A",
  "Cabinet B",
  "Cabinet C",
  "Cabinet D",
];

const SHELVES = ["Shelf 1", "Shelf 2", "Shelf 3", "Shelf 4", "Shelf 5"];

export default function CabinetSelectDropdown({
  cabinet,
  onCabinetChange,
  shelf,
  onShelfChange,
  folder,
  onFolderChange,
}: CabinetSelectDropdownProps) {
  const [cabinets, setCabinets] = useState<string[]>(DEFAULT_CABINETS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCabinetInput, setNewCabinetInput] = useState("");

  const handleSelectChange = (val: string) => {
    if (val === "__ADD_NEW__") {
      setNewCabinetInput("");
      setIsAddOpen(true);
    } else {
      onCabinetChange(val);
    }
  };

  const handleAddNewCabinet = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCabinetInput.trim();
    if (!trimmed) return;

    if (!cabinets.includes(trimmed)) {
      setCabinets((prev) => [...prev, trimmed]);
    }
    onCabinetChange(trimmed);
    setIsAddOpen(false);
    setNewCabinetInput("");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "text.secondary",
          display: "block",
          mb: 1.5,
        }}
      >
        Physical Storage Cabinet Assignment
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1.2fr 1fr 1fr" },
          gap: 2,
        }}
      >
        {/* Cabinet Select with "+ Add New" inside */}
        <FormControl size="small" fullWidth>
          <InputLabel id="cabinet-select-label">Storage Cabinet</InputLabel>
          <Select
            labelId="cabinet-select-label"
            value={cabinet}
            label="Storage Cabinet"
            onChange={(e) => handleSelectChange(e.target.value)}
            sx={{ borderRadius: 1 }}
          >
            {cabinets.map((cab) => (
              <MenuItem key={cab} value={cab}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <span>{cab}</span>
                </Stack>
              </MenuItem>
            ))}

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              value="__ADD_NEW__"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.82rem",
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AddRoundedIcon sx={{ fontSize: 18 }} />
                <span>+ Add New Cabinet</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Shelf Select */}
        <FormControl size="small" fullWidth>
          <InputLabel id="shelf-select-label">Shelf Level</InputLabel>
          <Select
            labelId="shelf-select-label"
            value={shelf}
            label="Shelf Level"
            onChange={(e) => onShelfChange(e.target.value)}
            sx={{ borderRadius: 1 }}
          >
            {SHELVES.map((sh) => (
              <MenuItem key={sh} value={sh}>
                {sh}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Folder/Binder Text input */}
        <TextField
          size="small"
          fullWidth
          label="Folder / Binder Ref"
          placeholder="e.g. Binder 07"
          value={folder}
          onChange={(e) => onFolderChange(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
        />
      </Box>

      {/* Add New Cabinet Modal */}
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
          Add New Storage Cabinet
        </DialogTitle>
        <form onSubmit={handleAddNewCabinet}>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", mb: 2 }}>
              Register a new physical cabinet location in the accounting archive room.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Cabinet Name / Identifier"
              placeholder="e.g. Cabinet E (Fiscal Vouchers)"
              value={newCabinetInput}
              onChange={(e) => setNewCabinetInput(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              size="small"
              onClick={() => setIsAddOpen(false)}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              variant="contained"
              disabled={!newCabinetInput.trim()}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Add & Select
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
