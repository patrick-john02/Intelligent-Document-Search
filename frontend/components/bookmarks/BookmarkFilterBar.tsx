"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

interface BookmarkFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  collections: string[];
  selectedCollection: string;
  onSelectCollection: (col: string) => void;
  onlyPinned: boolean;
  onTogglePinned: () => void;
  sortBy: "date" | "year" | "order" | "title";
  onSortChange: (sort: "date" | "year" | "order" | "title") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenNewCollection: () => void;
}

export default function BookmarkFilterBar({
  searchQuery,
  onSearchChange,
  collections,
  selectedCollection,
  onSelectCollection,
  onlyPinned,
  onTogglePinned,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenNewCollection,
}: BookmarkFilterBarProps) {
  return (
    <Stack spacing={1.5}>
      {/* Top Row: Search input + Sort + View Mode + Add Collection */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: "stretch", justifyContent: "space-between" }}
      >
        <TextField
          size="small"
          placeholder="Filter saved directives by title, order no, personal notes, or tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: { sm: 540 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 1, fontSize: "0.85rem" },
            },
          }}
        />

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          {/* Pinned filter toggle button */}
          <Button
            size="small"
            variant={onlyPinned ? "contained" : "outlined"}
            color={onlyPinned ? "primary" : "inherit"}
            onClick={onTogglePinned}
            startIcon={<PushPinRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              minWidth: "fit-content",
            }}
          >
            {onlyPinned ? "Pinned Only" : "All Items"}
          </Button>

          {/* Sort Selector */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "date" | "year" | "order" | "title")}
              sx={{ borderRadius: 1, fontSize: "0.8rem", height: 36 }}
            >
              <MenuItem value="date">Sort: Saved Date</MenuItem>
              <MenuItem value="year">Sort: Series Year</MenuItem>
              <MenuItem value="order">Sort: Order No.</MenuItem>
              <MenuItem value="title">Sort: Title</MenuItem>
            </Select>
          </FormControl>

          {/* View Toggle Buttons */}
          <Stack
            direction="row"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Button
              size="small"
              onClick={() => onViewModeChange("grid")}
              variant={viewMode === "grid" ? "contained" : "text"}
              color={viewMode === "grid" ? "primary" : "inherit"}
              sx={{
                minWidth: 36,
                px: 1,
                py: 0.5,
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              <GridViewRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
            <Button
              size="small"
              onClick={() => onViewModeChange("list")}
              variant={viewMode === "list" ? "contained" : "text"}
              color={viewMode === "list" ? "primary" : "inherit"}
              sx={{
                minWidth: 36,
                px: 1,
                py: 0.5,
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Stack>

          {/* Create Collection Button */}
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenNewCollection}
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              minWidth: "fit-content",
            }}
          >
            Collection
          </Button>
        </Stack>
      </Stack>

      {/* Bottom Row: Collection Pill Chips */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          overflowX: "auto",
          pb: 0.5,
          alignItems: "center",
          "&::-webkit-scrollbar": { height: 4 },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mr: 0.5,
            fontSize: "0.72rem",
            flexShrink: 0,
          }}
        >
          Collections:
        </Typography>

        {collections.map((col) => {
          const isSelected = selectedCollection === col;
          return (
            <Chip
              key={col}
              label={col}
              size="small"
              onClick={() => onSelectCollection(col)}
              variant={isSelected ? "filled" : "outlined"}
              color={isSelected ? "primary" : "default"}
              sx={{
                borderRadius: 1,
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
