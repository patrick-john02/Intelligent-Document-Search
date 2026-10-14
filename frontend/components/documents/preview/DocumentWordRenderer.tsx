"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

// Icons
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

import { ArchiveDocument } from "../types";

interface DocumentWordRendererProps {
  document: ArchiveDocument;
  zoomLevel: number;
  currentPage: number;
}

export default function DocumentWordRenderer({
  document,
  zoomLevel,
  currentPage,
}: DocumentWordRendererProps) {
  const scale = zoomLevel / 100;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100%",
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: 794, // Standard A4 width at 96 DPI
          minHeight: 1123,
          p: "60px 70px",
          bgcolor: "#FFFFFF",
          color: "#0F172A",
          borderRadius: 1,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease-out",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.2)",
          fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
          mb: 4,
        }}
      >
        {/* Top Header Strip with Word Document Accent */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ArticleRoundedIcon sx={{ color: "#3B82F6", fontSize: 24 }} />
            <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E3A8A" }}>
              MUNICIPAL ADMINISTRATIVE DIRECTIVE
            </Typography>
          </Stack>

          <Chip
            icon={<ShieldRoundedIcon sx={{ fontSize: 14 }} />}
            label={`Classification: ${document.clearance}`}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor: alpha("#3B82F6", 0.12),
              color: "#1E40AF",
            }}
          />
        </Box>

        <Divider sx={{ mb: 3, borderColor: "#3B82F6", borderWidth: 1 }} />

        {/* Administrative Memorandum Metadata Block */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3.5,
            bgcolor: "#F8FAFC",
            borderColor: "#E2E8F0",
            borderRadius: 1.5,
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 1, fontSize: "0.85rem" }}>
            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>MEMORANDUM FOR:</Typography>
            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
              All Department Heads, Assessor&apos;s Office, and Municipal Treasury
            </Typography>

            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>THROUGH:</Typography>
            <Typography sx={{ fontWeight: 600, color: "#334155" }}>
              Office of the Municipal Administrator
            </Typography>

            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>FROM:</Typography>
            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
              {document.uploadedBy?.name || "Legal Affairs & Archival Registry"}
            </Typography>

            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>DATE:</Typography>
            <Typography sx={{ fontWeight: 600, color: "#334155" }}>{document.ingestedDate}</Typography>

            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>SUBJECT:</Typography>
            <Typography sx={{ fontWeight: 800, color: "#1E40AF" }}>{document.title}</Typography>

            <Typography sx={{ fontWeight: 700, color: "#64748B" }}>ORDER REF:</Typography>
            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>
              {document.orderNo} (Series of {document.seriesYear})
            </Typography>
          </Box>
        </Paper>

        {/* Document Content Sections */}
        <Stack spacing={2.5} sx={{ lineHeight: 1.65, fontSize: "0.92rem", color: "#1E293B" }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A", mb: 0.75 }}>
              1. Executive Context & Objective
            </Typography>
            <Typography sx={{ textAlign: "justify" }}>
              {document.summary}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A", mb: 0.75 }}>
              2. Statutory Authority & Legal Basis
            </Typography>
            <Typography sx={{ textAlign: "justify" }}>
              {document.executiveBrief?.statutoryMandate ||
                "This directive is promulgated in strict conformity with Department of Finance regulations, the Local Government Code of 1991, and municipal executive issuances."}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A", mb: 0.75 }}>
              3. Operational Implementation Guidelines
            </Typography>
            <Typography sx={{ textAlign: "justify" }}>
              All target entities specified under archival registry code <strong>{document.shelfLocation}</strong> are
              instructed to implement standardized digital logging, verification seals, and retention schedules.
              Archival disposition mandate: {document.executiveBrief?.archivalDisposition || "Standard permanent retention."}
            </Typography>
          </Box>
        </Stack>

        {/* Signatures Block */}
        <Box sx={{ mt: 8, pt: 3, borderTop: "1px solid #E2E8F0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ width: 220 }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mb: 3 }}>Submitted by:</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "0.88rem" }}>
                {document.uploadedBy?.name || "Maria Santos"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                {document.uploadedBy?.position || "Senior Records Officer"}
              </Typography>
            </Box>

            <Box sx={{ width: 220, textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mb: 3 }}>Noted and Recorded:</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "0.88rem" }}>Atty. Karen Reyes</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Legal Counsel & Chief Archivist</Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer Page Number */}
        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "0.72rem",
            color: "#94A3B8",
          }}
        >
          Page {currentPage} of {document.pageCount || 1} • {document.fileName || document.orderNo}
        </Box>
      </Paper>
    </Box>
  );
}
