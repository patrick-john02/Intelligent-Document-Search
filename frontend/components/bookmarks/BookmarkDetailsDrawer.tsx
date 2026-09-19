"use client";

import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import BookmarkRemoveRoundedIcon from "@mui/icons-material/BookmarkRemoveRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import Link from "next/link";
import { BookmarkItem } from "./types";

interface BookmarkDetailsDrawerProps {
  item: BookmarkItem | null;
  open: boolean;
  onClose: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export default function BookmarkDetailsDrawer({
  item,
  open,
  onClose,
  onTogglePin,
  onEditNote,
  onRemove,
}: BookmarkDetailsDrawerProps) {
  if (!item) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 460 },
            p: 3,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        },
      }}
    >
      <Box sx={{ overflowY: "auto", pr: 0.5 }}>
        {/* Top Controls: Directive No + Pin + Close */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontWeight: 800,
                color: "primary.main",
                fontSize: "0.85rem",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(59, 130, 246, 0.12)"
                    : "rgba(37, 99, 235, 0.08)",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(59, 130, 246, 0.25)"
                    : "rgba(37, 99, 235, 0.2)",
              }}
            >
              {item.orderNo}
            </Typography>

            <Chip
              label={`Series ${item.seriesYear}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1, height: 22, fontSize: "0.72rem", fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={(e) => onTogglePin(item.id, e)}
              sx={{ color: item.isPinned ? "primary.main" : "text.secondary" }}
            >
              {item.isPinned ? (
                <PushPinRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>

            <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Title & Metadata Tags */}
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.4, mb: 1.5 }}>
          {item.title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: "wrap", gap: 0.5 }}>
          <Chip
            label={item.category}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}
          />
          <Chip
            label={`Collection: ${item.collection}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}
          />
          <Chip
            label={item.clearance}
            size="small"
            color={
              item.clearance === "Public"
                ? "success"
                : item.clearance === "Internal"
                ? "info"
                : "warning"
            }
            sx={{ borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Personal Notes / Annotation Section */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}
            >
              Personal Annotation / Notes
            </Typography>
            <Button
              size="small"
              startIcon={<EditNoteRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onEditNote(item)}
              sx={{ textTransform: "none", fontSize: "0.75rem", p: 0.25 }}
            >
              Edit Note
            </Button>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(15, 23, 42, 0.02)",
              borderLeft: "3px solid",
              borderLeftColor: item.personalNotes ? "warning.main" : "divider",
            }}
          >
            {item.personalNotes ? (
              <Typography variant="body2" sx={{ fontSize: "0.84rem", lineHeight: 1.5 }}>
                {item.personalNotes}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", fontStyle: "italic" }}>
                No personal notes added yet. Click &apos;Edit Note&apos; to attach references or reminders.
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Physical Storage Coordinates */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              display: "block",
              mb: 1,
            }}
          >
            Physical Archive Coordinates
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1.5,
              bgcolor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                Cabinet
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.cabinet}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                Shelf
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.shelf}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                Hardcopy Binder
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.binder}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", display: "block" }}>
                Storage Barcode
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
                {item.shelfLocation.barcode}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Directive Specifications */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              display: "block",
              mb: 1,
            }}
          >
            Document Details
          </Typography>

          <Stack spacing={1}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Official Issuance Date:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {item.officialDate || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Bookmarked On:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {item.dateBookmarked}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Page Count & Size:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {item.pageCount} pages ({item.fileSize})
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Tags */}
        {item.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "text.secondary",
                display: "block",
                mb: 1,
              }}
            >
              Tags
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
              {item.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1, fontSize: "0.7rem" }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Footer Navigation Shortcuts */}
      <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1}>
          <Button
            component={Link}
            href={`/locator?highlight=${encodeURIComponent(item.shelfLocation.barcode)}`}
            variant="outlined"
            size="small"
            startIcon={<PlaceOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            Locate Physical Binder ({item.shelfLocation.barcode})
          </Button>

          <Button
            component={Link}
            href={`/chat?query=${encodeURIComponent(`Explain ${item.orderNo}: ${item.title}`)}`}
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            Ask AI Assistant About Directive
          </Button>

          <Button
            component={Link}
            href={`/documents?q=${encodeURIComponent(item.orderNo)}`}
            variant="outlined"
            size="small"
            startIcon={<FolderOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            Open in Document Archive
          </Button>

          <Button
            variant="text"
            color="error"
            size="small"
            onClick={(e) => {
              onRemove(item.id, e);
              onClose();
            }}
            startIcon={<BookmarkRemoveRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600, mt: 0.5 }}
          >
            Remove from Bookmarks
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
