"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "next/link";

export interface CitedDocument {
  id: string | number;
  orderNo: string;
  title: string;
  seriesYear: number | string;
  category: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential" | string;
  relevanceScore: number; // 0.0 - 1.0
  shelfLocation: string;
  cabinet: string;
  shelf: string;
  folder?: string;
  pageNumber: number;
  excerpt: string;
  fileSize: string;
  pageCount: number;
  checksum: string;
  ingestedDate: string;
}

interface EvidenceInspectorProps {
  document: CitedDocument | null;
  onClose?: () => void;
}

export default function EvidenceInspector({ document, onClose }: EvidenceInspectorProps) {
  if (!document) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Evidence Inspector Idle
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 280 }}>
          Select any cited directive or referenced passage in the synthesis console to verify source text and physical archive coordinates.
        </Typography>
      </Paper>
    );
  }

  const matchPercent = Math.round(document.relevanceScore * 100);
  const scoreColor = matchPercent >= 90 ? "success" : matchPercent >= 75 ? "primary" : "warning";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Pane Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary", display: "block" }}>
            Evidence & Verification
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Source Document Inspector
          </Typography>
        </Box>
        {onClose && (
          <Button
            size="small"
            onClick={onClose}
            sx={{
              minWidth: "auto",
              p: "2px 8px",
              fontSize: "0.75rem",
              borderRadius: 1,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Collapse
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Badges & Match Gauge */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
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
            color="info"
            sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: 1 }}
          />
        </Box>
        <Chip
          label={`${matchPercent}% Vector Match`}
          size="small"
          color={scoreColor}
          sx={{ fontWeight: 700, fontSize: "0.75rem", height: 22, borderRadius: 1 }}
        />
      </Box>

      {/* Document Title & Directive Code */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 1 }}>
        {document.title}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2.5, color: "text.secondary" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
          Order: {document.orderNo}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: "0.8rem" }}>
          Series: {document.seriesYear}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: "0.8rem" }}>
          Page {document.pageNumber} of {document.pageCount}
        </Typography>
      </Stack>

      {/* Physical Archive Coordinates (Critical Government Archival Requirement) */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 0.75 }}>
          Physical Archive Coordinates
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.75,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                Storage Cabinet
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {document.cabinet}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                Shelf Level
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {document.shelf}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
            Full Location: {document.shelfLocation}
          </Typography>
        </Paper>
      </Box>

      {/* Extracted Passage Chunk with Semantic Highlight */}
      <Box sx={{ mb: 2.5, flexGrow: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 0.75 }}>
          Verified Passage Excerpt (Page {document.pageNumber})
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              fontSize: "0.84rem",
              lineHeight: 1.65,
              fontStyle: "normal",
            }}
          >
            "{document.excerpt}"
          </Typography>
        </Paper>
      </Box>

      {/* Document Verification & Integrity */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 0.75 }}>
          Integrity & Cryptographic Audit
        </Typography>
        <Stack spacing={0.5} sx={{ color: "text.secondary" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">File Size:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.fileSize}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Ingestion Date:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.ingestedDate}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">SHA-256 Checksum:</Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.primary" }}>
              {document.checksum.substring(0, 16)}...
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Stack spacing={1} sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          component={Link}
          href="/documents"
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            py: 0.75,
          }}
        >
          Open Master PDF Document
        </Button>
      </Stack>
    </Paper>
  );
}
