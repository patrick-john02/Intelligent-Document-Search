"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

// Icons
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import { BookmarkMetrics } from "./types";

export type SmartFilterType = "ALL" | "PINNED" | "PHYSICAL" | "NOTES" | null;

interface BookmarkCollectionsSidebarProps {
  collections: string[];
  selectedCollection: string;
  onSelectCollection: (col: string) => void;
  smartFilter: SmartFilterType;
  onSelectSmartFilter: (filter: SmartFilterType) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  metrics: BookmarkMetrics;
  collectionCounts: Record<string, number>;
  onOpenNewCollection: () => void;
  onDeleteCollection: (name: string) => void;
  onRenameCollection: (oldName: string, newName: string) => void;
}

export default function BookmarkCollectionsSidebar({
  collections,
  selectedCollection,
  onSelectCollection,
  smartFilter,
  onSelectSmartFilter,
  selectedTag,
  onSelectTag,
  allTags,
  metrics,
  collectionCounts,
  onOpenNewCollection,
  onDeleteCollection,
  onRenameCollection,
}: BookmarkCollectionsSidebarProps) {
  // Context menu for collection actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCollectionName, setActiveCollectionName] = useState<string | null>(null);

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");

  const handleOpenCollectionMenu = (e: React.MouseEvent<HTMLElement>, col: string) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setActiveCollectionName(col);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleTriggerRename = () => {
    if (activeCollectionName) {
      setNewNameInput(activeCollectionName);
      setRenameDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleConfirmRename = () => {
    if (activeCollectionName && newNameInput.trim()) {
      onRenameCollection(activeCollectionName, newNameInput.trim());
      setRenameDialogOpen(false);
      setActiveCollectionName(null);
    }
  };

  const handleTriggerDelete = () => {
    if (activeCollectionName) {
      onDeleteCollection(activeCollectionName);
      handleCloseMenu();
      setActiveCollectionName(null);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "100%", md: 270 },
        flexShrink: 0,
        borderRadius: 2.5,
        p: 2,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "fit-content",
      }}
    >
      {/* 1. Smart Views Section */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            px: 1,
            mb: 0.75,
            display: "block",
            fontSize: "0.68rem",
          }}
        >
          Directives Library
        </Typography>

        <List dense disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {/* All Directives */}
          <ListItemButton
            selected={smartFilter === "ALL" && selectedCollection === "All" && !selectedTag}
            onClick={() => {
              onSelectSmartFilter("ALL");
              onSelectCollection("All");
              onSelectTag(null);
            }}
            sx={(theme) => ({
              borderRadius: 2,
              py: 0.8,
              px: 1.25,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 28, color: smartFilter === "ALL" && selectedCollection === "All" && !selectedTag ? "primary.main" : "text.secondary" }}>
              <BookmarkBorderRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: smartFilter === "ALL" && selectedCollection === "All" && !selectedTag ? 700 : 500,
                  }}
                >
                  All Directives
                </Typography>
              }
            />
            <Chip
              label={metrics.totalSaved}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: smartFilter === "ALL" && selectedCollection === "All" ? "primary.main" : "action.hover",
                color: smartFilter === "ALL" && selectedCollection === "All" ? "primary.contrastText" : "text.secondary",
              }}
            />
          </ListItemButton>

          {/* Starred / Pinned */}
          <ListItemButton
            selected={smartFilter === "PINNED"}
            onClick={() => {
              onSelectSmartFilter("PINNED");
              onSelectCollection("All");
              onSelectTag(null);
            }}
            sx={(theme) => ({
              borderRadius: 2,
              py: 0.8,
              px: 1.25,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: "warning.dark",
                fontWeight: 700,
                "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.18) },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 28, color: "#F59E0B" }}>
              <StarRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: smartFilter === "PINNED" ? 700 : 500,
                  }}
                >
                  Starred / Pinned
                </Typography>
              }
            />
            <Chip
              label={metrics.pinnedCount}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: smartFilter === "PINNED" ? "#F59E0B" : "action.hover",
                color: smartFilter === "PINNED" ? "#fff" : "text.secondary",
              }}
            />
          </ListItemButton>

          {/* Physical Custody */}
          <ListItemButton
            selected={smartFilter === "PHYSICAL"}
            onClick={() => {
              onSelectSmartFilter("PHYSICAL");
              onSelectCollection("All");
              onSelectTag(null);
            }}
            sx={(theme) => ({
              borderRadius: 2,
              py: 0.8,
              px: 1.25,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: "success.dark",
                fontWeight: 700,
                "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.18) },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 28, color: "#10B981" }}>
              <PlaceOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: smartFilter === "PHYSICAL" ? 700 : 500,
                  }}
                >
                  Physical Archive
                </Typography>
              }
            />
            <Chip
              label={metrics.physicalOnShelfCount}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: smartFilter === "PHYSICAL" ? "#10B981" : "action.hover",
                color: smartFilter === "PHYSICAL" ? "#fff" : "text.secondary",
              }}
            />
          </ListItemButton>

          {/* With Research Notes */}
          <ListItemButton
            selected={smartFilter === "NOTES"}
            onClick={() => {
              onSelectSmartFilter("NOTES");
              onSelectCollection("All");
              onSelectTag(null);
            }}
            sx={(theme) => ({
              borderRadius: 2,
              py: 0.8,
              px: 1.25,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: "info.dark",
                fontWeight: 700,
                "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.18) },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 28, color: "#3B82F6" }}>
              <NoteAltOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: smartFilter === "NOTES" ? 700 : 500,
                  }}
                >
                  With Study Notes
                </Typography>
              }
            />
            <Chip
              label={metrics.withNotesCount || 0}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: smartFilter === "NOTES" ? "#3B82F6" : "action.hover",
                color: smartFilter === "NOTES" ? "#fff" : "text.secondary",
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Divider />

      {/* 2. Custom Collections Section */}
      <Box>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 1, mb: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.68rem",
            }}
          >
            Collections ({collections.filter((c) => c !== "All").length})
          </Typography>
          <Tooltip title="Create new collection">
            <IconButton
              size="small"
              onClick={onOpenNewCollection}
              sx={{
                p: 0.5,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" },
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <List dense disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {collections
            .filter((c) => c !== "All")
            .map((col) => {
              const count = collectionCounts[col] || 0;
              const isSelected = selectedCollection === col && !smartFilter;

              return (
                <ListItemButton
                  key={col}
                  selected={isSelected}
                  onClick={() => {
                    onSelectCollection(col);
                    onSelectSmartFilter(null);
                    onSelectTag(null);
                  }}
                  sx={(theme) => ({
                    borderRadius: 2,
                    py: 0.75,
                    px: 1.25,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                      fontWeight: 700,
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                    },
                    "&:hover .col-actions": {
                      opacity: 1,
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 26, color: isSelected ? "primary.main" : "text.secondary" }}>
                    {isSelected ? <FolderOpenRoundedIcon sx={{ fontSize: 17 }} /> : <FolderRoundedIcon sx={{ fontSize: 17 }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        {col}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        bgcolor: isSelected ? "primary.main" : "action.hover",
                        color: isSelected ? "primary.contrastText" : "text.secondary",
                      }}
                    />
                    <IconButton
                      className="col-actions"
                      size="small"
                      onClick={(e) => handleOpenCollectionMenu(e, col)}
                      sx={{
                        p: 0.25,
                        opacity: 0,
                        transition: "opacity 0.15s ease",
                        color: "text.secondary",
                        "&:hover": { color: "text.primary" },
                      }}
                    >
                      <MoreVertRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </ListItemButton>
              );
            })}
        </List>
      </Box>

      {/* 3. Tags Cloud Section */}
      {allTags.length > 0 && (
        <>
          <Divider />
          <Box>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 1, mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.68rem",
                }}
              >
                Subject Tags
              </Typography>
              {selectedTag && (
                <Typography
                  variant="caption"
                  onClick={() => onSelectTag(null)}
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Clear Tag
                </Typography>
              )}
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, px: 0.5 }}>
              {allTags.map((tag) => {
                const isTagActive = selectedTag === tag;
                return (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    onClick={() => onSelectTag(isTagActive ? null : tag)}
                    color={isTagActive ? "primary" : "default"}
                    variant={isTagActive ? "filled" : "outlined"}
                    icon={<LabelOutlinedIcon sx={{ fontSize: "12px !important" }} />}
                    sx={{
                      height: 22,
                      fontSize: "0.68rem",
                      fontWeight: isTagActive ? 700 : 500,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {/* 4. Storage & Sync Status Footer */}
      <Box
        sx={{
          mt: "auto",
          pt: 1.5,
          borderTop: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CloudDoneOutlinedIcon sx={{ fontSize: 16, color: "#10B981" }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem", color: "text.primary", display: "block" }}>
              Active Storage Sync
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", display: "block" }}>
              {metrics.totalSaved} records mirrored in personal workspace.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Collection Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: { borderRadius: 2, minWidth: 150, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
          },
        }}
      >
        <MenuItem onClick={handleTriggerRename} sx={{ fontSize: "0.82rem" }}>
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: "0.82rem" }}>Rename</Typography>} />
        </MenuItem>
        <MenuItem
          onClick={handleTriggerDelete}
          sx={{ fontSize: "0.82rem", color: "error.main", "&:hover": { bgcolor: "error.lighter" } }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: "0.82rem", color: "error.main" }}>Delete</Typography>} />
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, fontSize: "1rem", fontWeight: 700 }}>Rename Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            margin="dense"
            label="Collection Name"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRenameDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button onClick={handleConfirmRename} variant="contained" size="small" disabled={!newNameInput.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
