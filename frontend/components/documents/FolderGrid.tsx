"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";

import { ArchiveFolder } from "./types";

interface FolderGridProps {
  folders: ArchiveFolder[];
  onOpenFolder: (folderId: string) => void;
  onFolderContextMenu: (event: React.MouseEvent<HTMLElement>, folder: ArchiveFolder) => void;
  getFolderItemCount: (folderId: string) => number;
  onNewSubfolder: () => void;
  isDeletedMode?: boolean;
}

export default function FolderGrid({
  folders,
  onOpenFolder,
  onFolderContextMenu,
  getFolderItemCount,
  onNewSubfolder,
  isDeletedMode = false,
}: FolderGridProps) {
  if (folders.length === 0) return null;

  return (
    <Box sx={{ mb: 3.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: isDeletedMode ? "warning.dark" : "text.secondary",
            fontSize: "0.82rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <FolderRoundedIcon sx={{ fontSize: 16, color: isDeletedMode ? "warning.main" : "text.secondary" }} />
          Folders ({folders.length})
        </Typography>

        {!isDeletedMode && (
          <Button
            size="small"
            onClick={onNewSubfolder}
            startIcon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{ fontSize: "0.75rem", textTransform: "none", fontWeight: 600, color: "primary.main" }}
          >
            New Subfolder
          </Button>
        )}
      </Box>

      {/* Subfolders Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {folders.map((folder) => {
          const itemCount = getFolderItemCount(folder.id);

          return (
            <Paper
              key={folder.id}
              variant="outlined"
              onClick={() => onOpenFolder(folder.id)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: "background.paper",
                borderColor: "divider",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                "&:hover": {
                  borderColor: folder.color || "primary.main",
                  bgcolor: (theme) => alpha(folder.color || theme.palette.primary.main, 0.04),
                  transform: "translateY(-1px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 14px rgba(0,0,0,0.3)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  bgcolor: folder.iconBg || alpha(folder.color || "#F59E0B", 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FolderRoundedIcon sx={{ fontSize: 22, color: folder.color || "#F59E0B" }} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Tooltip title={folder.name}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      lineHeight: 1.25,
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {folder.name}
                  </Typography>
                </Tooltip>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={(e) => onFolderContextMenu(e, folder)}
                sx={{ p: 0.25, color: "text.secondary" }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
