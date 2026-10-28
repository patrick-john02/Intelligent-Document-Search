"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";

import Highlighter from "./Highlighter";
import { SearchResultItem } from "./types";
import { useBookmarks } from "@/context/BookmarkContext";

interface SearchSplitPaneViewProps {
  results: SearchResultItem[];
  searchQuery: string;
  isSmartMode: boolean;
  onPreview: (item: SearchResultItem) => void;
  onAskAi: (item: SearchResultItem) => void;
}

export default function SearchSplitPaneView({
  results,
  searchQuery,
  isSmartMode,
  onPreview,
  onAskAi,
}: SearchSplitPaneViewProps) {
  const [selectedId, setSelectedId] = useState<string | number>(results[0]?.id || "");
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const activeDoc = results.find((r) => r.id === selectedId) || results[0];

  const handleToggleBookmark = (item: SearchResultItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(item);
  };

  const handleCopyCitation = (doc: SearchResultItem) => {
    const text = `${doc.orderNo}: ${doc.title} (${doc.seriesYear}) [${doc.shelfLocation}]`;
    navigator.clipboard?.writeText(text);
  };

  if (!activeDoc) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        minHeight: 580,
      }}
    >
      {/* LEFT PANE: Results List */}
      <Box
        sx={{
          width: { xs: "100%", md: "380px", lg: "420px" },
          borderRight: { xs: "none", md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          overflowY: "auto",
          maxHeight: { xs: 340, md: 680 },
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
            Matches ({results.length})
          </Typography>
        </Box>

        <Stack spacing={0}>
          {results.map((item) => {
            const isSelected = item.id === activeDoc.id;
            const matchScore = item.relevanceScore ? Math.round(item.relevanceScore * 100) : null;
            const isSaved = isBookmarked(item.id || item.orderNo);

            return (
              <Box
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                sx={{
                  p: 1.75,
                  cursor: "pointer",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isSelected ? "action.selected" : "transparent",
                  borderLeft: isSelected ? "3px solid" : "3px solid transparent",
                  borderLeftColor: isSelected ? "primary.main" : "transparent",
                  transition: "all 0.1s ease",
                  "&:hover": {
                    bgcolor: isSelected ? "action.selected" : "action.hover",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.74rem" }}>
                    {item.orderNo}
                  </Typography>

                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    {isSmartMode && matchScore !== null && (
                      <Chip
                        label={`${matchScore}%`}
                        size="small"
                        color={matchScore >= 90 ? "success" : "primary"}
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
                      />
                    )}
                    <IconButton size="small" onClick={(e) => handleToggleBookmark(item, e)} sx={{ p: 0.25 }}>
                      {isSaved ? (
                        <BookmarkRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      ) : (
                        <BookmarkBorderRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      )}
                    </IconButton>
                  </Stack>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 600,
                    fontSize: "0.84rem",
                    color: "text.primary",
                    lineHeight: 1.35,
                    mb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  <Highlighter text={item.title} query={searchQuery} />
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                  }}
                >
                  <Highlighter text={item.excerptSnippet} query={searchQuery} />
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* RIGHT PANE: Selected Document Reader & Dossier Overview */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3 },
          overflowY: "auto",
          maxHeight: 680,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Header & Badges */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.06em" }}>
                {activeDoc.category} • {activeDoc.orderNo}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mt: 0.25 }}>
                <Highlighter text={activeDoc.title} query={searchQuery} />
              </Typography>
            </Box>

            <Chip
              label={activeDoc.clearance}
              size="small"
              color={activeDoc.clearance === "Public" ? "success" : "info"}
              sx={{ fontWeight: 700, borderRadius: 1, height: 22, fontSize: "0.7rem" }}
            />
          </Box>

          {/* Metadata Specs Bar */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Series Year
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {activeDoc.seriesYear}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Physical Archive
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {activeDoc.shelfLocation}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Page Count
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {activeDoc.pageCount || 1} pages
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                File Size
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {activeDoc.fileSize || "1.8 MB"}
              </Typography>
            </Box>
          </Paper>

          {/* Excerpt Snippet */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
              Matched Contextual Excerpt:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                borderLeft: "3px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.65, fontSize: "0.88rem" }}>
                "<Highlighter text={activeDoc.excerptSnippet} query={searchQuery} />"
              </Typography>
            </Paper>
          </Box>

          {/* Summary */}
          {activeDoc.summary && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Executive Abstract:
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                {activeDoc.summary}
              </Typography>
            </Box>
          )}

          {/* Extracted Tags */}
          {activeDoc.tags && activeDoc.tags.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.75 }}>
                Semantic Classification Tags:
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {activeDoc.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    sx={{
                      fontSize: "0.72rem",
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            pt: 2,
            mt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            size="small"
            variant="text"
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleCopyCitation(activeDoc)}
            sx={{ fontSize: "0.78rem", textTransform: "none", color: "text.secondary" }}
          >
            Copy Reference Citation
          </Button>

          <Stack direction="row" spacing={1.25}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onAskAi(activeDoc)}
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: "0.82rem", px: 1.75 }}
            >
              Ask Mayumi
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onPreview(activeDoc)}
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 2, boxShadow: "none" }}
            >
              Open Reader (PDF)
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
