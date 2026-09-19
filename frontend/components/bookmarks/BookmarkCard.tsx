"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import BookmarkRemoveRoundedIcon from "@mui/icons-material/BookmarkRemoveRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { BookmarkItem } from "./types";

interface BookmarkCardProps {
  item: BookmarkItem;
  isSelected?: boolean;
  onSelect: (item: BookmarkItem) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem, e: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export default function BookmarkCard({
  item,
  isSelected,
  onSelect,
  onTogglePin,
  onEditNote,
  onRemove,
}: BookmarkCardProps) {
  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect(item)}
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: isSelected ? "action.selected" : "background.paper",
        borderColor: isSelected ? "primary.main" : "divider",
        borderLeft: isSelected ? "4px solid" : "1px solid",
        borderLeftColor: isSelected ? "primary.main" : "divider",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.15s ease",
        position: "relative",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 14px rgba(0,0,0,0.3)"
              : "0 4px 14px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box>
        {/* Top Header: Directive Number, Year, Collection & Pin Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            mb: 1,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(59, 130, 246, 0.12)"
                    : "rgba(37, 99, 235, 0.08)",
                px: 0.75,
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
              label={item.collection}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRadius: 1,
              }}
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
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 600,
                borderRadius: 1,
              }}
            />
          </Stack>

          {/* Quick Pin Toggle Button */}
          <Tooltip title={item.isPinned ? "Unpin Directive" : "Pin Directive"} arrow>
            <IconButton
              size="small"
              onClick={(e) => onTogglePin(item.id, e)}
              sx={{
                color: item.isPinned ? "primary.main" : "text.secondary",
                p: 0.5,
              }}
            >
              {item.isPinned ? (
                <PushPinRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Directive Title */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.92rem",
            color: "text.primary",
            lineHeight: 1.35,
            mb: 1,
          }}
        >
          {item.title}
        </Typography>

        {/* Personal Notes / Annotation Box */}
        {item.personalNotes && (
          <Box
            sx={{
              p: 1.25,
              mb: 1.5,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(15, 23, 42, 0.03)",
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "3px solid",
              borderLeftColor: "warning.main",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.primary",
                fontSize: "0.78rem",
                display: "block",
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              “{item.personalNotes}”
            </Typography>
          </Box>
        )}

        {/* Physical Coordinates Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            py: 0.75,
            px: 1,
            mb: 1.5,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.02)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.74rem",
            }}
          >
            Shelf:{" "}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.74rem" }}
            >
              {item.shelfLocation.cabinet} • {item.shelfLocation.shelf} ({item.shelfLocation.binder})
            </Typography>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {item.shelfLocation.barcode}
          </Typography>
        </Box>
      </Box>

      {/* Footer Meta & Actions */}
      <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
            Saved {item.dateBookmarked}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Edit Note" arrow>
              <IconButton
                size="small"
                onClick={(e) => onEditNote(item, e)}
                sx={{ color: "text.secondary", p: 0.5 }}
              >
                <EditNoteRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Remove Bookmark" arrow>
              <IconButton
                size="small"
                onClick={(e) => onRemove(item.id, e)}
                sx={{ color: "text.secondary", p: 0.5, "&:hover": { color: "error.main" } }}
              >
                <BookmarkRemoveRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Button
              size="small"
              variant="outlined"
              onClick={() => onSelect(item)}
              sx={{
                borderRadius: 1,
                fontSize: "0.74rem",
                fontWeight: 600,
                textTransform: "none",
                py: 0.25,
                px: 1,
              }}
            >
              Open
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
