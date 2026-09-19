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
import { ArchiveDocument } from "./types";

interface DocumentDossierInspectorProps {
  document: ArchiveDocument | null;
  onClose?: () => void;
}

export default function DocumentDossierInspector({
  document,
  onClose,
}: DocumentDossierInspectorProps) {
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
          No Document Selected
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 260 }}>
          Select any record from the ledger or cabinet map to inspect its physical shelf coordinates, OCR fidelity, and AI metadata.
        </Typography>
      </Paper>
    );
  }

  const clearanceColor =
    document.clearance === "Public"
      ? "success"
      : document.clearance === "Internal"
      ? "info"
      : document.clearance === "Confidential"
      ? "warning"
      : "error";

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
        width: { xs: "100%", lg: "380px", xl: "420px" },
        flexShrink: 0,
      }}
    >
      {/* 1. Header with Title and Close Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              display: "block",
            }}
          >
            Active Archive Dossier
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {document.orderNo}
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
            Close
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 2. Document Title */}
      <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 1.5, color: "text.primary" }}>
        {document.title}
      </Typography>

      {/* Badges: Category, Clearance, OCR score */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
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
          color={clearanceColor}
          variant="filled"
          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: 1 }}
        />
        <Chip
          label={`${document.ocrAccuracy}% OCR Fidelity`}
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22, borderRadius: 1 }}
        />
      </Box>

      {/* 3. Physical Archive Coordinates */}
      <Box sx={{ mb: 2.5 }}>
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
          Physical Archive Coordinates
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                Storage Cabinet
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {document.cabinet}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                Shelf Level
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {document.shelf}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", display: "block" }}>
            Exact Filing Tag: {document.shelfLocation}
          </Typography>
        </Paper>
      </Box>

      {/* 4. Executive Summary / Ingestion Abstract */}
      <Box sx={{ mb: 2.5 }}>
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
          Summary & Archival Abstract
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

      {/* 5. AI Auto-Classified Tags */}
      {document.tags && document.tags.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
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
            AI Semantic Tags & Confidence
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {document.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={`${tag.name} (${Math.round(tag.score * 100)}%)`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22, borderRadius: 1 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* 6. Technical & File Metadata */}
      <Box sx={{ mb: 2.5 }}>
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
        <Stack spacing={0.5} sx={{ color: "text.secondary" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Series Year:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.seriesYear}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">File Size & Pages:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.fileSize} • {document.pageCount} Pages</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Archival Version:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.version} (Active)</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption">Ingested On:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{document.ingestedDate}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* 7. Action Buttons */}
      <Stack spacing={1} sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
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
            py: 0.8,
          }}
        >
          Open Master PDF Document
        </Button>

        <Button
          component={Link}
          href={`/chat?q=${encodeURIComponent(`Tell me about ${document.title} (${document.orderNo})`)}`}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            py: 0.8,
          }}
        >
          Ask AI Assistant About This Doc
        </Button>
      </Stack>
    </Paper>
  );
}
