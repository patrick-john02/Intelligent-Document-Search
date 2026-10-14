"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
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
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  viewMode: "grid" | "list" | "cabinet";
  onViewModeChange: (mode: "grid" | "list" | "cabinet") => void;
  isIntelligenceOpen: boolean;
  intelligenceTab: IntelligenceTab;
  onToggleInspector: () => void;
  onOpenMayumi: () => void;
  isDeletedMode: boolean;
  totalDeletedCount: number;
  onToggleDeletedMode: () => void;
  onOpenCreateFolder: () => void;
  onOpenUpload: () => void;
}

export default function DocumentsHeaderBar({
  breadcrumbTrail,
  currentFolderId,
  onNavigateFolder,
  onNavigateBack,
  folderCount,
  fileCount,
  isSidebarOpen,
  onToggleSidebar,
  viewMode,
  onViewModeChange,
  isIntelligenceOpen,
  intelligenceTab,
  onToggleInspector,
  onOpenMayumi,
  isDeletedMode,
  totalDeletedCount,
  onToggleDeletedMode,
  onOpenCreateFolder,
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

      {/* Right Action Controls: Toggle, View Switcher, Info, Mayumi, Soft-Delete, New Folder, Upload */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Tooltip title={isSidebarOpen ? "Collapse Directory tree" : "Expand Directory tree"}>
          <Button
            size="small"
            variant="outlined"
            onClick={onToggleSidebar}
            startIcon={
              isSidebarOpen ? (
                <ViewSidebarRoundedIcon sx={{ fontSize: 17 }} />
              ) : (
                <ViewSidebarOutlinedIcon sx={{ fontSize: 17 }} />
              )
            }
            sx={{
              borderRadius: 1.5,
              fontSize: "0.8rem",
              textTransform: "none",
              fontWeight: 600,
              height: 34,
            }}
          >
            Directory
          </Button>
        </Tooltip>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              py: 0.5,
              px: 1.25,
              height: 34,
            },
          }}
        >
          <Tooltip title="Grid layout">
            <ToggleButton value="grid">
              <GridViewRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Grid
            </ToggleButton>
          </Tooltip>
          <Tooltip title="List view table">
            <ToggleButton value="list">
              <ViewListRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              List
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Physical cabinet view">
            <ToggleButton value="cabinet">
              <MapOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Cabinet
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

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

        {/* Mayumi Document Management Agent Button */}
        <Tooltip title="Ask Mayumi - Document Management Agent">
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#EC4899" }} />}
            onClick={onOpenMayumi}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 1.5,
              height: 34,
              borderColor:
                isIntelligenceOpen && intelligenceTab === "mayumi"
                  ? "#EC4899"
                  : alpha("#EC4899", 0.4),
              color: "#DB2777",
              bgcolor:
                isIntelligenceOpen && intelligenceTab === "mayumi"
                  ? alpha("#EC4899", 0.12)
                  : alpha("#EC4899", 0.04),
              "&:hover": {
                borderColor: "#EC4899",
                bgcolor: alpha("#EC4899", 0.12),
              },
            }}
          >
            Ask Mayumi
          </Button>
        </Tooltip>

        {/* Universal Soft-Delete Switch Button */}
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
          <>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={onOpenCreateFolder}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                px: 1.75,
                height: 34,
                borderColor: "divider",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              New Folder
            </Button>

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
          </>
        )}
      </Stack>
    </Box>
  );
}
