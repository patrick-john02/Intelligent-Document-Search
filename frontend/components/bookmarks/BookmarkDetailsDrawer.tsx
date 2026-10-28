"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { BookmarkItem } from "./types";
import { getClearanceColor } from "./BookmarkCard";

interface BookmarkDetailsDrawerProps {
  item: BookmarkItem | null;
  open: boolean;
  onClose: () => void;
  onPreview?: (item: BookmarkItem) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem) => void;
  onSaveInlineNote: (id: string, note: string) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export default function BookmarkDetailsDrawer({
  item,
  open,
  onClose,
  onPreview,
  onTogglePin,
  onEditNote,
  onSaveInlineNote,
  onRemove,
}: BookmarkDetailsDrawerProps) {
  const router = useRouter();
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineNoteText, setInlineNoteText] = useState("");

  if (!item) return null;

  const handleStartEdit = () => {
    setInlineNoteText(item.personalNotes || "");
    setIsEditingInline(true);
  };

  const handleSaveInline = () => {
    onSaveInlineNote(item.id, inlineNoteText);
    setIsEditingInline(false);
  };

  const handleCopyCitation = () => {
    const citation = `${item.orderNo}: "${item.title}" (Series ${item.seriesYear}). Category: ${item.category}.`;
    navigator.clipboard.writeText(citation);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 480 },
            p: 3,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Top Header: Order No, Year, Clearance, Star Pin, Close */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              bgcolor: "action.hover",
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {item.orderNo}
          </Typography>

          <Chip
            size="small"
            label={item.seriesYear}
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
          />

          <Chip
            size="small"
            label={item.clearance}
            color={getClearanceColor(item.clearance)}
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={item.isPinned ? "Unpin directive" : "Pin directive"}>
            <IconButton
              size="small"
              onClick={(e) => onTogglePin(item.id, e)}
              sx={{ color: item.isPinned ? "#F59E0B" : "text.secondary" }}
            >
              {item.isPinned ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
            </IconButton>
          </Tooltip>

          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Stack>

      {/* Title & Metadata */}
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 1 }}>
        {item.title}
      </Typography>

      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
        Collection: <strong>{item.collection}</strong> • Promulgated: {item.officialDate || "2024"} • Size: {item.fileSize} ({item.pageCount} pages)
      </Typography>

      {/* Main Document Viewer Action */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<DescriptionOutlinedIcon />}
          onClick={() => onPreview?.(item)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 0.9,
            boxShadow: "none",
          }}
        >
          Open Document Viewer
        </Button>

        <Tooltip title="Copy formal citation to clipboard">
          <IconButton
            onClick={handleCopyCitation}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              px: 1.5,
            }}
          >
            <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={2.5}>
          {/* Section 1: Personal Study Notes & Annotations */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(245, 158, 11, 0.3)",
              bgcolor: "rgba(245, 158, 11, 0.05)",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <NoteAltOutlinedIcon sx={{ color: "#D97706", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Personal Study Notes
                </Typography>
              </Stack>

              {!isEditingInline && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<EditNoteRoundedIcon />}
                  onClick={handleStartEdit}
                  sx={{ textTransform: "none", fontSize: "0.75rem", color: "#D97706", fontWeight: 600 }}
                >
                  Edit Note
                </Button>
              )}
            </Stack>

            {isEditingInline ? (
              <Stack spacing={1.5}>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  value={inlineNoteText}
                  onChange={(e) => setInlineNoteText(e.target.value)}
                  placeholder="Record your legal observations, statutory precedents, or audit notes..."
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 1.5,
                    "& .MuiOutlinedInput-root": { fontSize: "0.82rem" },
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setIsEditingInline(false)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveInline}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Save Note
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.5, fontSize: "0.82rem" }}>
                {item.personalNotes || (
                  <span style={{ fontStyle: "italic", color: "gray" }}>
                    No personal notes recorded yet. Click &quot;Edit Note&quot; to add your annotations.
                  </span>
                )}
              </Typography>
            )}
          </Box>

          {/* Section 2: Physical Custody & Shelf Coordinates */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <PlaceOutlinedIcon sx={{ color: "#10B981", fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Physical Archival Coordinates
              </Typography>
            </Stack>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                mb: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
                SHELF MAPPING & BARCODE
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", mt: 0.25 }}>
                {item.shelfLocation.cabinet} • {item.shelfLocation.shelf} • {item.shelfLocation.binder}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#10B981", fontWeight: 700, display: "block", mt: 0.25 }}>
                BARCODE: {item.shelfLocation.barcode}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<PlaceOutlinedIcon />}
              onClick={() => router.push(`/locator?barcode=${encodeURIComponent(item.shelfLocation.barcode)}`)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: "#10B981",
                borderColor: "#10B981",
                "&:hover": { borderColor: "#059669", bgcolor: "rgba(16, 185, 129, 0.05)" },
              }}
            >
              View on Physical Locator Map
            </Button>
          </Box>

          {/* Section 3: AI Document Intelligence */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <AutoAwesomeOutlinedIcon sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                AI Document Intelligence
              </Typography>
            </Stack>

            {item.extractedSummary && (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", mb: 1.5, lineHeight: 1.45 }}>
                {item.extractedSummary}
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth
              startIcon={<AutoAwesomeOutlinedIcon />}
              onClick={() => router.push(`/chat?directive=${encodeURIComponent(item.orderNo)}`)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Ask AI Assistant about this Directive
            </Button>
          </Box>

          {/* Section 4: Google Workspace Cloud Access */}
          {item.googleDriveLink && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(66, 133, 244, 0.3)",
                bgcolor: "rgba(66, 133, 244, 0.04)",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <GoogleIcon sx={{ color: "#4285F4", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Google Drive Cloud Copy
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                This directive is synchronized with your Google Drive personal archive.
              </Typography>

              <Button
                variant="outlined"
                size="small"
                fullWidth
                component="a"
                href={item.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GoogleIcon sx={{ fontSize: "15px !important", color: "#4285F4" }} />}
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "rgba(66, 133, 244, 0.4)",
                  color: "#1976D2",
                }}
              >
                Open in Google Drive / Docs
              </Button>
            </Box>
          )}

          {/* Tags */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
              SUBJECT TAGS
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {item.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontSize: "0.72rem" }} />
              ))}
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Drawer Footer Actions */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
        <Button
          size="small"
          variant="text"
          color="error"
          startIcon={<DeleteOutlineRoundedIcon />}
          onClick={(e) => {
            onRemove(item.id, e);
            onClose();
          }}
          sx={{ textTransform: "none", fontSize: "0.78rem" }}
        >
          Remove from Saved
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<EditNoteRoundedIcon />}
          onClick={() => onEditNote(item)}
          sx={{ textTransform: "none", fontSize: "0.78rem" }}
        >
          Move / Edit Collection
        </Button>
      </Stack>
    </Drawer>
  );
}
