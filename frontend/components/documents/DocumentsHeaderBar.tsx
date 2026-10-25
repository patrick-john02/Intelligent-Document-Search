"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import DocumentsBreadcrumbs from "./DocumentsBreadcrumbs";
import { IntelligenceTab } from "./DocumentIntelligencePane";

export interface DocumentsHeaderBarProps {
  breadcrumbTrail: { id: string | null; name: string }[];
  currentFolderId: string | null;
  onNavigateFolder: (folderId: string | null) => void;
  onNavigateBack: () => void;
  folderCount: number;
  fileCount: number;
  viewMode: "grid" | "list" | "cabinet";
  onViewModeChange: (mode: "grid" | "list" | "cabinet") => void;
  isIntelligenceOpen: boolean;
  intelligenceTab: IntelligenceTab;
  onToggleInspector: () => void;
  isDeletedMode: boolean;
  totalDeletedCount: number;
  onToggleDeletedMode: () => void;
  onOpenUpload: () => void;
}

export default function DocumentsHeaderBar({
  breadcrumbTrail,
  currentFolderId,
  onNavigateFolder,
  onNavigateBack,
  folderCount,
  fileCount,
  viewMode,
  onViewModeChange,
  isIntelligenceOpen,
  intelligenceTab,
  onToggleInspector,
  isDeletedMode,
  totalDeletedCount,
  onToggleDeletedMode,
  onOpenUpload,
}: DocumentsHeaderBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: "wrap",
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      {/* Clickable Breadcrumbs Path */}
      <DocumentsBreadcrumbs
        breadcrumbTrail={breadcrumbTrail}
        currentFolderId={currentFolderId}
        onNavigate={onNavigateFolder}
        onBack={onNavigateBack}
        folderCount={folderCount}
        fileCount={fileCount}
      />

      {/* Right Action Controls: View Switcher, Info, Divider, Deleted Vault, Upload */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
        {/* Compact Icon-Only View Switcher: Grid, List, Cabinet */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
          size="small"
          aria-label="View mode selection"
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: 1.5,
              py: 0.5,
              px: 1,
              height: 34,
              minWidth: 36,
            },
          }}
        >
          <Tooltip title="Grid layout">
            <ToggleButton value="grid" aria-label="Grid layout">
              <GridViewRoundedIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="List view table">
            <ToggleButton value="list" aria-label="List view table">
              <ViewListRoundedIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Physical cabinet view">
            <ToggleButton value="cabinet" aria-label="Physical cabinet view">
              <MapOutlinedIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        {/* Details Inspector Button */}
        <Tooltip
          title={
            isIntelligenceOpen && intelligenceTab === "dossier"
              ? "Hide Details Inspector (i)"
              : "Show Details Inspector (i)"
          }
        >
          <IconButton
            size="small"
            onClick={onToggleInspector}
            color={isIntelligenceOpen && intelligenceTab === "dossier" ? "primary" : "default"}
            aria-label="Toggle details inspector"
            sx={{
              borderRadius: 1.5,
              border: "1px solid",
              borderColor:
                isIntelligenceOpen && intelligenceTab === "dossier" ? "primary.main" : "divider",
              bgcolor:
                isIntelligenceOpen && intelligenceTab === "dossier"
                  ? "action.selected"
                  : "background.paper",
              width: 34,
              height: 34,
            }}
          >
            {isIntelligenceOpen && intelligenceTab === "dossier" ? (
              <InfoRoundedIcon sx={{ fontSize: 19 }} />
            ) : (
              <InfoOutlinedIcon sx={{ fontSize: 19 }} />
            )}
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ height: 20, my: "auto" }} />

        {/* Universal Soft-Delete Records Vault Toggle */}
        <Tooltip
          title={
            isDeletedMode
              ? "Switch back to Active Records Archive"
              : "Switch to Soft-Deleted Records Vault (is_deleted = True)"
          }
        >
          <Button
            variant={isDeletedMode ? "contained" : "outlined"}
            size="small"
            startIcon={
              isDeletedMode ? (
                <RestoreFromTrashRoundedIcon sx={{ fontSize: 17 }} />
              ) : (
                <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
              )
            }
            onClick={onToggleDeletedMode}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 1.5,
              height: 34,
              ...(isDeletedMode
                ? {
                    bgcolor: "#F59E0B",
                    color: "#FFFFFF",
                    border: "1px solid #D97706",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
                    "&:hover": { bgcolor: "#D97706" },
                  }
                : {
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": { borderColor: "warning.main", color: "warning.dark" },
                  }),
            }}
          >
            {isDeletedMode ? `Deleted Vault (${totalDeletedCount})` : `Deleted (${totalDeletedCount})`}
          </Button>
        </Tooltip>

        {!isDeletedMode && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onOpenUpload}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              px: 2,
              height: 34,
            }}
          >
            Upload
          </Button>
        )}
      </Stack>
    </Box>
  );
}
