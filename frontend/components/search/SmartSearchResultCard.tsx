"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Link from "next/link";

// Icons
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import Highlighter from "./Highlighter";
import { SearchResultItem } from "./types";
import { useBookmarks } from "@/context/BookmarkContext";

export type SmartSearchResultItem = SearchResultItem;

export interface SmartSearchResultCardProps {
  item: SearchResultItem;
  searchQuery?: string;
  isSmartMode?: boolean;
  onPreview?: (item: SearchResultItem) => void;
  onAskAi?: (item: SearchResultItem) => void;
}

export default function SmartSearchResultCard({
  item,
  searchQuery = "",
  isSmartMode = false,
  onPreview,
  onAskAi,
}: SmartSearchResultCardProps) {
  const { isBookmarked: checkIsBookmarked, toggleBookmark } = useBookmarks();
  const isBookmarked = checkIsBookmarked(item.id || item.orderNo);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const matchPercentage =
    item.relevanceScore !== undefined
      ? Math.round(item.relevanceScore * 100)
      : null;

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `${item.orderNo}: ${item.title} (${item.seriesYear})`;
    navigator.clipboard?.writeText(citation);
    setToastMessage("Document citation copied to clipboard");
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleBookmark(item);
    setToastMessage(
      added
        ? "Document saved to your bookmarks"
        : "Document removed from bookmarks"
    );
  };

  return (
    <>
      <Card
        variant="outlined"
        onDoubleClick={() => onPreview?.(item)}
        sx={{
          borderRadius: 1.5,
          borderColor: "divider",
          bgcolor: "background.paper",
          width: "100%",
          transition: "all 0.15s ease-in-out",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 16px rgba(0,0,0,0.06)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Header Row: Category & Optional Relevance Match */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                letterSpacing: "0.02em",
              }}
            >
              {item.category}
            </Typography>

            {isSmartMode && matchPercentage !== null && (
              <Chip
                label={`${matchPercentage}% match`}
                size="small"
                color={
                  matchPercentage >= 90
                    ? "success"
                    : matchPercentage >= 75
                    ? "primary"
                    : "default"
                }
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  height: 22,
                  borderRadius: 1,
                }}
              />
            )}
          </Box>

          {/* Document Title */}
          <Typography
            variant="h6"
            onClick={() => onPreview?.(item)}
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: "text.primary",
              lineHeight: 1.35,
              mb: 0.75,
              cursor: onPreview ? "pointer" : "default",
              "&:hover": onPreview
                ? {
                    color: "primary.main",
                  }
                : {},
            }}
          >
            <Highlighter text={item.title} query={searchQuery} />
          </Typography>

          {/* Clean, Non-Cluttered Metadata Line */}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.82rem",
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.75,
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              <Highlighter text={item.orderNo} query={searchQuery} />
            </Box>
            <Box component="span">•</Box>
            <Box component="span">Series {item.seriesYear}</Box>
            <Box component="span">•</Box>
            <Box component="span">{item.shelfLocation}</Box>
            <Box component="span">•</Box>
            <Box component="span">{item.clearance}</Box>
          </Typography>

          {/* Excerpt Snippet with Keyword Highlighting */}
          {item.excerptSnippet && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.03)",
                borderLeft: "3px solid",
                borderColor: "primary.light",
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  lineHeight: 1.6,
                  fontSize: "0.85rem",
                }}
              >
                "<Highlighter text={item.excerptSnippet} query={searchQuery} />"
              </Typography>
            </Box>
          )}

          {/* Clean Footer Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {/* File Info */}
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {item.pageCount ? `${item.pageCount} pages` : ""}
              {item.pageCount && item.fileSize ? " • " : ""}
              {item.fileSize || ""}
            </Typography>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {/* Copy Citation */}
              <Tooltip title="Copy document reference">
                <IconButton size="small" onClick={handleCopyCitation}>
                  <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              {/* Bookmark */}
              <Tooltip title={isBookmarked ? "Saved" : "Save document"}>
                <IconButton
                  size="small"
                  onClick={handleToggleBookmark}
                  color={isBookmarked ? "primary" : "default"}
                >
                  {isBookmarked ? (
                    <BookmarkRoundedIcon sx={{ fontSize: 19 }} />
                  ) : (
                    <BookmarkBorderRoundedIcon sx={{ fontSize: 19 }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* Preview Document */}
              {onPreview && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onPreview(item)}
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 1.5,
                  }}
                >
                  Preview
                </Button>
              )}

              {/* Ask Mayumi */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAi?.(item);
                }}
                size="small"
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  px: 1.5,
                  boxShadow: "none",
                }}
              >
                Ask Mayumi
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Action Snackbar Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={2500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
