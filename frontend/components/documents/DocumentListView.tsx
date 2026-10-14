"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { ArchiveDocument } from "./types";
import { getFileTypeBadge, getInitials } from "./documentsUtils";

interface DocumentListViewProps {
  documents: ArchiveDocument[];
  selectedDocId?: string | number;
  onSelect: (doc: ArchiveDocument) => void;
  onDoubleClick: (doc: ArchiveDocument) => void;
  onAskAi: (doc: ArchiveDocument) => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, doc: ArchiveDocument) => void;
}

export default function DocumentListView({
  documents,
  selectedDocId,
  onSelect,
  onDoubleClick,
  onAskAi,
  onContextMenu,
}: DocumentListViewProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* List Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
          fontWeight: 700,
          fontSize: "0.78rem",
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        <Box sx={{ flex: { xs: 3, md: 4 }, minWidth: 0 }}>Name</Box>
        <Box sx={{ flex: { xs: 0, md: 2 }, display: { xs: "none", md: "block" } }}>Category / Location</Box>
        <Box sx={{ flex: { xs: 0, lg: 2 }, display: { xs: "none", lg: "block" } }}>Uploaded By</Box>
        <Box sx={{ flex: { xs: 1.5, sm: 1.5 }, textAlign: "right" }}>Modified</Box>
        <Box sx={{ flex: { xs: 1, sm: 1 }, textAlign: "right" }}>Size</Box>
        <Box sx={{ width: 80, textAlign: "right" }}></Box>
      </Box>

      {/* List Rows */}
      <Stack divider={<Divider />}>
        {documents.map((doc) => {
          const isSelected = selectedDocId === doc.id;
          const typeBadge = getFileTypeBadge(doc.fileType);

          return (
            <Box
              key={doc.id}
              onClick={() => onSelect(doc)}
              onDoubleClick={() => onDoubleClick(doc)}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1.25,
                cursor: "pointer",
                bgcolor: isSelected ? "action.selected" : "transparent",
                transition: "background-color 0.1s ease",
                "&:hover": {
                  bgcolor: isSelected ? "action.selected" : "action.hover",
                },
              }}
            >
              {/* Name column */}
              <Box sx={{ flex: { xs: 3, md: 4 }, minWidth: 0, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 0.6,
                    borderRadius: 1,
                    bgcolor: typeBadge.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {typeBadge.icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.86rem",
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                    {doc.orderNo} • {typeBadge.label}
                    {doc.isDeleted && " • Soft-Deleted"}
                  </Typography>
                </Box>
              </Box>

              {/* Category / Location column */}
              <Box sx={{ flex: { xs: 0, md: 2 }, display: { xs: "none", md: "block" }, minWidth: 0, pr: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {doc.category}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {doc.shelfLocation}
                </Typography>
              </Box>

              {/* Uploaded By column */}
              <Box sx={{ flex: { xs: 0, lg: 2 }, display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 22,
                    height: 22,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  {getInitials(doc.uploadedBy?.name)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.uploadedBy?.name}
                  </Typography>
                </Box>
              </Box>

              {/* Ingested Date column */}
              <Box sx={{ flex: { xs: 1.5, sm: 1.5 }, textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                  {doc.ingestedDate}
                </Typography>
              </Box>

              {/* Size column */}
              <Box sx={{ flex: { xs: 1, sm: 1 }, textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.75rem" }}>
                  {doc.fileSize}
                </Typography>
              </Box>

              {/* Actions column */}
              <Box sx={{ width: 80, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="Ask Mayumi AI">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAi(doc);
                    }}
                    sx={{ p: 0.5, color: "text.secondary" }}
                  >
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <IconButton
                  size="small"
                  onClick={(e) => onContextMenu(e, doc)}
                  sx={{ p: 0.5, color: "text.secondary" }}
                >
                  <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
