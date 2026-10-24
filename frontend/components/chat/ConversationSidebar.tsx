"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

// Icons
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

export interface ConversationItem {
  id: string;
  title: string;
  date: string;
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename?: (id: string, newTitle: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
}: ConversationSidebarProps) {
  // Context Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);

  // Rename Dialog State
  const [isRenameOpen, setIsRenameOpen] = useState<boolean>(false);
  const [renameTitle, setRenameTitle] = useState<string>("");
  const [isSubmittingRename, setIsSubmittingRename] = useState<boolean>(false);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, conv: ConversationItem) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setSelectedConv(conv);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // --- Rename Handlers ---
  const handleOpenRename = () => {
    if (!selectedConv) return;
    setRenameTitle(selectedConv.title);
    setIsRenameOpen(true);
    handleCloseMenu();
  };

  const handleCloseRename = () => {
    if (isSubmittingRename) return;
    setIsRenameOpen(false);
    setRenameTitle("");
    setSelectedConv(null);
  };

  const handleConfirmRename = async () => {
    if (!selectedConv || !renameTitle.trim() || !onRename) return;
    if (renameTitle.trim() === selectedConv.title) {
      handleCloseRename();
      return;
    }
    setIsSubmittingRename(true);
    try {
      await onRename(selectedConv.id, renameTitle.trim());
      handleCloseRename();
    } catch (err) {
      console.error("Failed to rename conversation", err);
    } finally {
      setIsSubmittingRename(false);
    }
  };

  // --- Delete Handlers ---
  const handleOpenDelete = () => {
    if (!selectedConv) return;
    setIsDeleteOpen(true);
    handleCloseMenu();
  };

  const handleCloseDelete = () => {
    if (isSubmittingDelete) return;
    setIsDeleteOpen(false);
    setSelectedConv(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConv || !onDelete) return;
    setIsSubmittingDelete(true);
    try {
      await onDelete(selectedConv.id);
      handleCloseDelete();
    } catch (err) {
      console.error("Failed to delete conversation", err);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "100%", md: "250px" },
        borderRadius: 1.5,
        bgcolor: "background.paper",
        borderColor: "divider",
        p: 1.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* 1. Header with Title and Solo New Chat Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 0.5,
          py: 0.5,
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: "0.88rem",
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Conversations
        </Typography>

        {/* Solo New Chat Icon Button */}
        <Tooltip title="New Chat" placement="right">
          <IconButton
            onClick={onNewChat}
            size="small"
            sx={{
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              p: 0.75,
              color: "text.primary",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
            aria-label="New Chat"
          >
            <EditNoteRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* 2. Conversation List with Hover 3-Dots Action */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        {conversations.length > 0 ? (
          <Stack spacing={0.5}>
            {conversations.map((conv) => {
              const isSelected = conv.id === activeId;
              const isItemMenuOpen = selectedConv?.id === conv.id && isMenuOpen;

              return (
                <Box
                  key={conv.id}
                  component="div"
                  onClick={() => onSelect(conv.id)}
                  sx={(theme) => ({
                    px: 1.25,
                    py: 1,
                    textAlign: "left",
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                    border: "1px solid",
                    borderColor: isSelected ? alpha(theme.palette.primary.main, 0.25) : "transparent",
                    borderLeft: isSelected ? "3px solid" : "3px solid transparent",
                    borderLeftColor: isSelected ? "primary.main" : "transparent",
                    borderRadius: 1.25,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0.75,
                    position: "relative",
                    "&:hover": {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "action.hover",
                      "& .conv-actions": {
                        opacity: 1,
                      },
                    },
                    "& .conv-actions": {
                      opacity: isItemMenuOpen || isSelected ? 1 : 0,
                      transition: "opacity 0.15s ease",
                    },
                  })}
                >
                  {/* Title and Timestamp */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "primary.main" : "text.primary",
                        fontSize: "0.82rem",
                        lineHeight: 1.3,
                        mb: 0.25,
                      }}
                    >
                      {conv.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.68rem",
                        display: "block",
                      }}
                    >
                      {conv.date}
                    </Typography>
                  </Box>

                  {/* 3-Dots Action Button (Visible on Hover / Selected) */}
                  {(onRename || onDelete) && (
                    <Box className="conv-actions" sx={{ flexShrink: 0 }}>
                      <Tooltip title="Conversation options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, conv)}
                          sx={{
                            p: 0.4,
                            borderRadius: 1,
                            color: isItemMenuOpen ? "primary.main" : "text.secondary",
                            bgcolor: isItemMenuOpen ? "action.selected" : "transparent",
                            "&:hover": {
                              bgcolor: "action.hover",
                              color: "text.primary",
                            },
                          }}
                          aria-label={`Options for ${conv.title}`}
                        >
                          <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          /* Empty conversations state */
          <Box sx={{ p: 2, textAlign: "center", my: "auto" }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 24, color: "text.disabled", mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontWeight: 600 }}>
              No conversations yet
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem", display: "block", mt: 0.25 }}>
              Click + above to start
            </Typography>
          </Box>
        )}
      </Box>

      {/* 3-Dots Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 1.5,
              minWidth: 140,
              py: 0.5,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        {onRename && (
          <MenuItem onClick={handleOpenRename} sx={{ py: 0.75, px: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
              <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Rename
            </Typography>
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem onClick={handleOpenDelete} sx={{ py: 0.75, px: 1.5, color: "error.main" }}>
            <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600, color: "error.main" }}>
              Delete
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={isRenameOpen}
        onClose={handleCloseRename}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 0.5 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          Rename Conversation
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Inquiry Title"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmRename();
              }
            }}
            disabled={isSubmittingRename}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            onClick={handleCloseRename}
            disabled={isSubmittingRename}
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleConfirmRename}
            disabled={!renameTitle.trim() || isSubmittingRename}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.25 }}
          >
            {isSubmittingRename ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 0.5 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>
          Delete Conversation?
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
            Are you sure you want to delete{" "}
            <strong>"{selectedConv?.title}"</strong>? All associated messages and cited excerpts will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            onClick={handleCloseDelete}
            disabled={isSubmittingDelete}
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isSubmittingDelete}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.25 }}
          >
            {isSubmittingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
