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
import Divider from "@mui/material/Divider";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Link from "next/link";
import { ArchiveDocument } from "./types";

interface DocumentDossierInspectorProps {
  document: ArchiveDocument | null;
  onClose?: () => void;
  onAskAi?: (document: ArchiveDocument) => void;
}

export default function DocumentDossierInspector({
  document,
  onClose,
  onAskAi,
}: DocumentDossierInspectorProps) {
  if (!document) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 1.5,
          bgcolor: "background.paper",
          borderColor: "divider",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: { xs: "100%", lg: "340px", xl: "380px" },
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          No Document Selected
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 240 }}>
          Select any file from the directory to view its summary, location, and file details.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 1.5,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        width: { xs: "100%", lg: "340px", xl: "380px" },
        flexShrink: 0,
      }}
    >
      {/* 1. Header with Order No & Close Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              display: "block",
            }}
          >
            Document Details
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {document.orderNo}
          </Typography>
        </Box>

        {onClose && (
          <Tooltip title="Close (Esc)">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 2. Document Title */}
      <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 1.5, color: "text.primary" }}>
        {document.title}
      </Typography>

      {/* Badges: Category & Clearance */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Chip
          label={document.category}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22, borderRadius: 1 }}
        />
        <Chip
          label={document.clearance}
          size="small"
          color={document.clearance === "Public" ? "success" : "default"}
          variant="filled"
          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: 1 }}
        />
      </Box>

      {/* 3. Filing Location */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
            display: "block",
            mb: 0.75,
          }}
        >
          Filing Location
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
            {document.shelfLocation}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Series {document.seriesYear}
          </Typography>
        </Paper>
      </Box>

      {/* 4. Document Summary */}
      {document.summary && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              display: "block",
              mb: 0.75,
            }}
          >
            Summary
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.55, color: "text.secondary" }}>
              {document.summary}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* 5. Key Topics */}
      {document.tags && document.tags.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              display: "block",
              mb: 0.75,
            }}
          >
            Topics
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {document.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag.name}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.72rem", height: 22, borderRadius: 1 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* 6. File Specifications */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
            display: "block",
            mb: 0.75,
          }}
        >
          File Specifications
        </Typography>
        <Stack spacing={0.75} sx={{ color: "text.secondary" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Pages & Size:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
              {document.pageCount} pages • {document.fileSize}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Date Added:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
              {document.ingestedDate}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* 7. Clean Action Buttons */}
      <Stack spacing={1} sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          component={Link}
          href="/documents"
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          startIcon={<PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            py: 0.75,
          }}
        >
          Open Document
        </Button>

        <Button
          onClick={() => (onAskAi ? onAskAi(document) : null)}
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            py: 0.75,
          }}
        >
          Ask AI Assistant
        </Button>
      </Stack>
    </Paper>
  );
}
