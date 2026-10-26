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
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GoogleIcon from "@mui/icons-material/Google";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

interface BookmarkFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  collections: string[];
  selectedCollection: string;
  onSelectCollection: (col: string) => void;
  onlyPinned: boolean;
  onTogglePinned: () => void;
  onlyPhysical: boolean;
  onTogglePhysical: () => void;
  sortBy: "date" | "year" | "order" | "title";
  onSortChange: (sort: "date" | "year" | "order" | "title") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenNewCollection: () => void;
  onOpenExportDialog: () => void;
}

export default function BookmarkFilterBar({
  searchQuery,
  onSearchChange,
  collections,
  selectedCollection,
  onSelectCollection,
  onlyPinned,
  onTogglePinned,
  onlyPhysical,
  onTogglePhysical,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenNewCollection,
  onOpenExportDialog,
}: BookmarkFilterBarProps) {
  return (
    <Stack spacing={2}>
      {/* Top Row: Search input + Toggles + Sort + View Mode + Actions */}
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", lg: "center" }, justifyContent: "space-between" }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search saved directives, order numbers, study notes, or tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: { xs: "1 1 auto", lg: "0 1 420px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Action and Filter Controls */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, justifyContent: { xs: "space-between", lg: "flex-end" } }}
        >
          {/* Pinned toggle */}
          <Button
            size="small"
            variant={onlyPinned ? "contained" : "outlined"}
            color={onlyPinned ? "primary" : "inherit"}
            onClick={onTogglePinned}
            startIcon={
              <StarRoundedIcon
                sx={{
                  fontSize: 16,
                  color: onlyPinned ? "#F59E0B" : "text.secondary",
                }}
              />
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              height: 36,
            }}
          >
            Pinned Only
          </Button>

          {/* Physical records toggle */}
          <Button
            size="small"
            variant={onlyPhysical ? "contained" : "outlined"}
            color={onlyPhysical ? "primary" : "inherit"}
            onClick={onTogglePhysical}
            startIcon={
              <PlaceOutlinedIcon
                sx={{
                  fontSize: 16,
                  color: onlyPhysical ? "#10B981" : "text.secondary",
                }}
              />
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              height: 36,
            }}
          >
            On Shelf
          </Button>

          {/* Sort Selector */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "date" | "year" | "order" | "title")}
              sx={{ borderRadius: 2, fontSize: "0.82rem", bgcolor: "background.paper", height: 36 }}
            >
              <MenuItem value="date">Date Saved</MenuItem>
              <MenuItem value="year">Series Year</MenuItem>
              <MenuItem value="order">Directive No.</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
            </Select>
          </FormControl>

          {/* Grid / List Switcher */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, next) => next && onViewModeChange(next)}
            size="small"
            sx={{ bgcolor: "background.paper", borderRadius: 2 }}
          >
            <Tooltip title="Card Grid View">
              <ToggleButton value="grid" aria-label="grid view" sx={{ px: 1.25 }}>
                <GridViewRoundedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Dense List View">
              <ToggleButton value="list" aria-label="list view" sx={{ px: 1.25 }}>
                <ViewListRoundedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          {/* Export to Google Docs / Drive Button */}
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenExportDialog}
            startIcon={<GoogleIcon sx={{ fontSize: "14px !important", color: "#4285F4" }} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              height: 36,
              whiteSpace: "nowrap",
            }}
          >
            Export to Drive
          </Button>

          {/* + New Collection button */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onOpenNewCollection}
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 700,
              height: 36,
              px: 1.75,
              boxShadow: "none",
              whiteSpace: "nowrap",
            }}
          >
            Collection
          </Button>
        </Stack>
      </Stack>

      {/* Collection Pills Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { height: 4 },
        }}
      >
        {collections.map((col) => {
          const isSelected = selectedCollection === col;
          return (
            <Chip
              key={col}
              label={col}
              onClick={() => onSelectCollection(col)}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              sx={{
                fontWeight: isSelected ? 700 : 500,
                fontSize: "0.78rem",
                borderRadius: 2,
                cursor: "pointer",
                height: 28,
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "primary.main",
                },
              }}
            />
          );
        })}
      </Box>
    </Stack>
  );
}
