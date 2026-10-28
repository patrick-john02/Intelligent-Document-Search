"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Slide from "@mui/material/Slide";
import { alpha } from "@mui/material/styles";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SelectAllRoundedIcon from "@mui/icons-material/SelectAllRounded";

interface BookmarkBatchActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  collections: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onMoveToCollection: (collectionName: string) => void;
  onTogglePinSelected: () => void;
  onExportSelected: () => void;
  onSynthesizeAi: () => void;
  onRemoveSelected: () => void;
}

export default function BookmarkBatchActionBar({
  selectedCount,
  totalFilteredCount,
  collections,
  onSelectAll,
  onClearSelection,
  onMoveToCollection,
  onTogglePinSelected,
  onExportSelected,
  onSynthesizeAi,
  onRemoveSelected,
}: BookmarkBatchActionBarProps) {
  const [collectionMenuAnchor, setCollectionMenuAnchor] = useState<null | HTMLElement>(null);

  if (selectedCount === 0) return null;

  const handleOpenCollectionMenu = (e: React.MouseEvent<HTMLElement>) => {
    setCollectionMenuAnchor(e.currentTarget);
  };

  const handleSelectCollection = (col: string) => {
    onMoveToCollection(col);
    setCollectionMenuAnchor(null);
  };

  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <Box
        sx={(theme) => ({
          position: "sticky",
          bottom: 24,
          zIndex: 1000,
          mx: "auto",
          width: "100%",
          maxWidth: 960,
          p: 1.5,
          px: 2.5,
          borderRadius: 3,
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "#1E293B",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        })}
      >
        {/* Left: Count and selection controls */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <CheckCircleRoundedIcon sx={{ color: "#10B981", fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff" }}>
            {selectedCount} directive{selectedCount > 1 ? "s" : ""} selected
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {selectedCount < totalFilteredCount && (
              <Button
                size="small"
                variant="text"
                onClick={onSelectAll}
                startIcon={<SelectAllRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.75rem",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { color: "#fff" },
                }}
              >
                Select All ({totalFilteredCount})
              </Button>
            )}

            <Button
              size="small"
              variant="text"
              onClick={onClearSelection}
              startIcon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: "#94A3B8",
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { color: "#fff" },
              }}
            >
              Clear
            </Button>
          </Box>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          {/* Move to Collection */}
          <Button
            size="small"
            variant="outlined"
            onClick={handleOpenCollectionMenu}
            startIcon={<DriveFileMoveOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: "#F1F5F9",
              borderColor: "rgba(255, 255, 255, 0.2)",
              fontSize: "0.75rem",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            Move to Collection
          </Button>

          {/* Pin/Unpin */}
          <Tooltip title="Toggle Star / Pin for selected items">
            <Button
              size="small"
              variant="outlined"
              onClick={onTogglePinSelected}
              startIcon={<StarRoundedIcon sx={{ fontSize: 16, color: "#F59E0B" }} />}
              sx={{
                color: "#F1F5F9",
                borderColor: "rgba(255, 255, 255, 0.2)",
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              Pin / Star
            </Button>
          </Tooltip>

          {/* AI Synthesis */}
          <Tooltip title="Synthesize and compare selected directives using AI Assistant">
            <Button
              size="small"
              variant="contained"
              onClick={onSynthesizeAi}
              startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: "#fff" }} />}
              sx={{
                bgcolor: "#6366F1",
                color: "#fff",
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
                "&:hover": {
                  bgcolor: "#4F46E5",
                },
              }}
            >
              Synthesize with AI
            </Button>
          </Tooltip>

          {/* Export Selected */}
          <Tooltip title="Export selected directives to PDF / Google Docs / CSV">
            <Button
              size="small"
              variant="outlined"
              onClick={onExportSelected}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: "#F1F5F9",
                borderColor: "rgba(255, 255, 255, 0.2)",
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              Export ({selectedCount})
            </Button>
          </Tooltip>

          {/* Remove Selected */}
          <Tooltip title="Remove selected directives from bookmarks">
            <IconButton
              size="small"
              onClick={onRemoveSelected}
              sx={{
                color: "#EF4444",
                p: 0.75,
                bgcolor: "rgba(239, 68, 68, 0.15)",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.25)",
                },
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Move to Collection Menu */}
        <Menu
          anchorEl={collectionMenuAnchor}
          open={Boolean(collectionMenuAnchor)}
          onClose={() => setCollectionMenuAnchor(null)}
          transformOrigin={{ horizontal: "center", vertical: "bottom" }}
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              },
            },
          }}
        >
          {collections
            .filter((c) => c !== "All")
            .map((col) => (
              <MenuItem
                key={col}
                onClick={() => handleSelectCollection(col)}
                sx={{ fontSize: "0.82rem", py: 0.8 }}
              >
                {col}
              </MenuItem>
            ))}
        </Menu>
      </Box>
    </Slide>
  );
}
