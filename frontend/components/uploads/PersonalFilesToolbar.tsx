"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import GoogleIcon from "@mui/icons-material/Google";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FolderSpecialRoundedIcon from "@mui/icons-material/FolderSpecialRounded";
import { PersonalFileCategory } from "./types";

export type FilterTab = "all" | "gdrive" | "local" | "starred";

interface PersonalFilesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterTab: FilterTab;
  onFilterTabChange: (tab: FilterTab) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenUploadModal: () => void;
  onOpenDriveImportModal: () => void;
  isDriveConnected: boolean;
  totalCount: number;
  syncedCount: number;
  localCount: number;
  starredCount: number;
}

export default function PersonalFilesToolbar({
  searchQuery,
  onSearchChange,
  activeFilterTab,
  onFilterTabChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onOpenUploadModal,
  onOpenDriveImportModal,
  isDriveConnected,
  totalCount,
  syncedCount,
  localCount,
  starredCount,
}: PersonalFilesToolbarProps) {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {/* Upper Row: Search, Category Filter, View Switcher & Action Buttons */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search personal files, directives, extracted text..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: { xs: "1 1 auto", md: "0 1 360px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        {/* Right side controls: Category, View Switcher & Action Buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: { xs: "space-between", md: "flex-end" },
          }}
        >
          {/* Category Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "background.paper", fontSize: "0.85rem" }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="Directives">Directives</MenuItem>
              <MenuItem value="Reports">Reports</MenuItem>
              <MenuItem value="Forms">Forms</MenuItem>
              <MenuItem value="Drafts">Drafts</MenuItem>
              <MenuItem value="Personal Notes">Personal Notes</MenuItem>
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

          {/* Import from Google Drive (Secondary Action) */}
          <Tooltip
            title={
              isDriveConnected
                ? "Browse and import files from your Google Drive"
                : "Connect Google SSO to import directly from Google Drive"
            }
          >
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<GoogleIcon sx={{ fontSize: "15px !important", color: "#4285F4" }} />}
                onClick={onOpenDriveImportModal}
                disabled={!isDriveConnected}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  height: 38,
                  whiteSpace: "nowrap",
                }}
              >
                Import from Drive
              </Button>
            </span>
          </Tooltip>

          {/* Primary Upload Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CloudUploadRoundedIcon />}
            onClick={onOpenUploadModal}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              height: 38,
              px: 2,
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            Upload File
          </Button>
        </Stack>
      </Stack>

      {/* Filter Tabs Bar */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs
          value={activeFilterTab}
          onChange={(_, next: FilterTab) => onFilterTabChange(next)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.84rem",
              py: 0.5,
              px: 1.75,
            },
          }}
        >
          <Tab
            value="all"
            label={`All Files (${totalCount})`}
            icon={<FolderSpecialRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
          <Tab
            value="gdrive"
            label={`Synced to Drive (${syncedCount})`}
            icon={<GoogleIcon sx={{ fontSize: 14, color: "#4285F4" }} />}
            iconPosition="start"
          />
          <Tab
            value="local"
            label={`Local Vault Only (${localCount})`}
            iconPosition="start"
          />
          <Tab
            value="starred"
            label={`Starred (${starredCount})`}
            icon={<StarRoundedIcon sx={{ fontSize: 16, color: "#F59E0B" }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>
    </Stack>
  );
}
