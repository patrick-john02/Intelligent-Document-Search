"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { alpha } from "@mui/material/styles";

import type { MentionableDocument } from "@/lib/chatApi";

export type { MentionableDocument };

interface DocumentMentionDropdownProps {
  open: boolean;
  query: string;
  docs: MentionableDocument[];   // results come from the composer (server-side search)
  loading: boolean;
  selectedIndex: number;
  onSelect: (doc: MentionableDocument) => void;
}

// Presentational only: shows the real documents the composer fetched for the current "@query"
export default function DocumentMentionDropdown({
  open,
  query,
  docs,
  loading,
  selectedIndex,
  onSelect,
}: DocumentMentionDropdownProps) {
  if (!open) return null;

  return (
    <Paper
      elevation={8}
      variant="elevation"
      sx={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        mb: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
        zIndex: 1300,
        overflow: "hidden",
        maxHeight: 340,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Target a document
        </Typography>
        {loading && <CircularProgress size={12} />}
      </Box>

      {/* Results */}
      <List dense sx={{ p: 0.5, overflowY: "auto", flexGrow: 1 }}>
        {docs.length > 0 ? (
          docs.map((doc, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <ListItem key={doc.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  // onMouseDown keeps focus in the input (onClick would blur it first)
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(doc);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                    "&.Mui-selected": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) },
                    },
                  }}
                >
                  <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 16, color: isSelected ? "primary.main" : "text.secondary" }} />
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{ fontWeight: 700, fontSize: "0.82rem", color: isSelected ? "primary.main" : "text.primary" }}
                      >
                        {doc.fileName}
                      </Typography>
                      {doc.docType && doc.docType !== "unknown" && (
                        <Chip label={doc.docType.replace(/_/g, " ")} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600 }} />
                      )}
                      <Chip label={doc.clearance} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 600, textTransform: "capitalize" }} />
                    </Stack>

                    {doc.shelfLocation && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.7rem", maxWidth: 160 }}>
                          {doc.shelfLocation}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <Typography variant="body2" noWrap sx={{ fontSize: "0.78rem", color: "text.secondary", width: "100%", textAlign: "left" }}>
                    {doc.title}
                    {doc.seriesYear ? ` · ${doc.seriesYear}` : ""}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {loading
                ? "Searching your documents…"
                : query
                ? `No indexed documents match "@${query}"`
                : "No indexed documents you can access yet"}
            </Typography>
          </Box>
        )}
      </List>

      {/* Footer Helper */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(15, 23, 42, 0.02)"),
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
          Use <b>↑ ↓</b> to navigate, <b>Enter</b> to select, <b>Esc</b> to close · up to 3 documents
        </Typography>
      </Box>
    </Paper>
  );
}
