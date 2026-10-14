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
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

import { ArchiveDocument } from "../types";

interface DocumentPdfRendererProps {
  document: ArchiveDocument;
  zoomLevel: number;
  showOcrLayer: boolean;
  currentPage: number;
}

export default function DocumentPdfRenderer({
  document,
  zoomLevel,
  showOcrLayer,
  currentPage,
}: DocumentPdfRendererProps) {
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
      {/* Printable Sheet Canvas */}
      <Paper
        elevation={6}
        sx={{
          width: 794, // Standard A4 width at 96 DPI
          minHeight: 1123, // Standard A4 height at 96 DPI
          p: "60px 70px",
          bgcolor: "#FFFFFF",
          color: "#1E293B",
          borderRadius: 1,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease-out",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.25)",
          userSelect: "text",
          fontFamily: "'Times New Roman', Times, Georgia, serif",
          mb: 4,
        }}
      >
        {/* Subtle Archival Watermark */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-35deg)",
            fontSize: "4.8rem",
            fontWeight: 900,
            color: "rgba(0, 0, 0, 0.03)",
            letterSpacing: "0.2em",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {document.clearance === "Confidential" ? "CONFIDENTIAL ARCHIVE" : "OFFICIAL RECORD"}
        </Box>

        {/* OCR Layer Overlay Highlighting */}
        {showOcrLayer && (
          <Box
            sx={{
              position: "absolute",
              top: 14,
              right: 18,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid #10B981",
              px: 1.25,
              py: 0.4,
              borderRadius: 1,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#059669" }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#059669",
                fontFamily: "sans-serif",
              }}
            >
              OCR Layer Active • {document.ocrAccuracy}% Accuracy
            </Typography>
          </Box>
        )}

        {/* 1. Official Republic Header with Seal */}
        <Box sx={{ textAlign: "center", mb: 3.5, position: "relative" }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              mx: "auto",
              mb: 1.25,
              borderRadius: "50%",
              bgcolor: "#0F172A",
              color: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <GavelRoundedIcon sx={{ fontSize: 28, color: "#F59E0B" }} />
          </Box>

          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#334155",
            }}
          >
            Republic of the Philippines
          </Typography>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#64748B",
            }}
          >
            Department of the Interior and Local Government
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#0F172A",
              mt: 0.5,
            }}
          >
            Office of the Municipal Mayor & Sangguniang Bayan
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontStyle: "italic",
              color: "#64748B",
            }}
          >
            Central Archival Custody • Record Code: {document.shelfLocation}
          </Typography>

          <Divider sx={{ my: 2, borderColor: "#0F172A", borderWidth: 1 }} />
        </Box>

        {/* 2. Order Metadata & Series Heading */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
              SERIES OF {document.seriesYear}
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0F172A", letterSpacing: "0.02em" }}>
              {document.orderNo}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
              DATE OF ISSUANCE:
            </Typography>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#1E293B" }}>
              {document.ingestedDate}
            </Typography>
            <Chip
              label={`Security Clearance: ${document.clearance}`}
              size="small"
              sx={{
                mt: 0.5,
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                fontFamily: "sans-serif",
                bgcolor:
                  document.clearance === "Public"
                    ? alpha("#10B981", 0.15)
                    : document.clearance === "Internal"
                    ? alpha("#3B82F6", 0.15)
                    : document.clearance === "Restricted"
                    ? alpha("#F59E0B", 0.15)
                    : alpha("#EF4444", 0.15),
                color:
                  document.clearance === "Public"
                    ? "#065F46"
                    : document.clearance === "Internal"
                    ? "#1E40AF"
                    : document.clearance === "Restricted"
                    ? "#92400E"
                    : "#991B1B",
              }}
            />
          </Box>
        </Box>

        {/* 3. Ordinance / Directive Title */}
        <Box
          sx={{
            textAlign: "center",
            my: 3,
            p: 2,
            bgcolor: showOcrLayer ? "rgba(254, 240, 138, 0.45)" : "transparent",
            borderRadius: 1,
            border: showOcrLayer ? "1px dashed #CA8A04" : "none",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.4,
              color: "#0F172A",
            }}
          >
            {document.title}
          </Typography>
        </Box>

        {/* 4. Formal Preamble Clauses */}
        <Stack spacing={2} sx={{ mb: 3.5, textAlign: "justify", lineHeight: 1.7, fontSize: "0.94rem" }}>
          <Box
            sx={{
              p: showOcrLayer ? 1 : 0,
              bgcolor: showOcrLayer ? "rgba(254, 240, 138, 0.3)" : "transparent",
              borderRadius: 1,
            }}
          >
            <Typography component="span" sx={{ fontWeight: 800 }}>
              WHEREAS,{" "}
            </Typography>
            pursuant to the statutory provisions of Republic Act No. 7160, otherwise known as the Local
            Government Code of 1991, local government units are vested with regulatory prerogatives to enact
            advisories, enforce revenue collection policies, and administer municipal property valuation registries;
          </Box>

          <Box
            sx={{
              p: showOcrLayer ? 1 : 0,
              bgcolor: showOcrLayer ? "rgba(254, 240, 138, 0.3)" : "transparent",
              borderRadius: 1,
            }}
          >
            <Typography component="span" sx={{ fontWeight: 800 }}>
              WHEREAS,{" "}
            </Typography>
            {document.summary}
          </Box>

          {document.executiveBrief?.statutoryMandate && (
            <Box
              sx={{
                p: showOcrLayer ? 1 : 0,
                bgcolor: showOcrLayer ? "rgba(254, 240, 138, 0.3)" : "transparent",
                borderRadius: 1,
              }}
            >
              <Typography component="span" sx={{ fontWeight: 800 }}>
                WHEREAS,{" "}
              </Typography>
              under the statutory mandate of {document.executiveBrief.statutoryMandate}, it is necessary to mandate
              compliance across all covered entities, namely: {document.executiveBrief.targetEntities};
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
            <Typography component="span" sx={{ fontWeight: 800 }}>
              NOW, THEREFORE, BE IT RESOLVED,{" "}
            </Typography>
            as it is hereby resolved by the authorities of this jurisdiction, that all municipal officers, records
            custodians, and department heads are directed to execute the dispositions outlined herein in strict
            observance of legal standards and archival retention directives.
          </Box>

          {/* Section 1 */}
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.95rem" }}>
              SECTION 1. Scope and Category.
            </Typography>
            <Typography sx={{ textIndent: "2rem" }}>
              This document falls under the official archival classification of{" "}
              <strong>&quot;{document.category}&quot;</strong>. Physical custody is officially assigned to{" "}
              <strong>{document.shelfLocation}</strong>, with verified optical character recognition integrity.
            </Typography>
          </Box>

          {/* Section 2 */}
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: "0.95rem" }}>
              SECTION 2. Archival Disposition.
            </Typography>
            <Typography sx={{ textIndent: "2rem" }}>
              {document.executiveBrief?.archivalDisposition ||
                "Subject to statutory 10-year archival preservation under the National Archives of the Philippines General Circular No. 2."}
            </Typography>
          </Box>
        </Stack>

        {/* 5. Official Signatories & Dry Seal Stamp */}
        <Box sx={{ mt: 6, pt: 3, borderTop: "1px dashed #CBD5E1" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            {/* Left Signatory */}
            <Box sx={{ width: 260, textAlign: "center" }}>
              <Typography sx={{ fontStyle: "italic", fontSize: "0.82rem", color: "#64748B", mb: 3 }}>
                Digitized and verified by:
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", textTransform: "uppercase" }}>
                {document.uploadedBy?.name || "Roberto Morales"}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#475569" }}>
                {document.uploadedBy?.position || "Senior Records Archivist"}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>
                {document.uploadedBy?.division || "Custodial Archives Unit"}
              </Typography>
            </Box>

            {/* Center Circular Dry Seal Stamp */}
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "2px double #DC2626",
                color: "#DC2626",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 0.75,
                transform: "rotate(-12deg)",
                userSelect: "none",
                opacity: 0.88,
              }}
            >
              <Typography sx={{ fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.08em" }}>
                MUNICIPAL ARCHIVE
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 900 }}>CERTIFIED</Typography>
              <Typography sx={{ fontSize: "0.52rem", fontWeight: 700 }}>TRUE COPY</Typography>
              <Typography sx={{ fontSize: "0.48rem", color: "#991B1B" }}>{document.ingestedDate}</Typography>
            </Box>

            {/* Right Signatory */}
            <Box sx={{ width: 260, textAlign: "center" }}>
              <Typography sx={{ fontStyle: "italic", fontSize: "0.82rem", color: "#64748B", mb: 3 }}>
                Approved and sealed by:
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", textTransform: "uppercase" }}>
                Hon. Alicia Tan, M.D.
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#475569" }}>Municipal Executive Officer</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>Regional Archive Directorate</Typography>
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
            fontFamily: "sans-serif",
          }}
        >
          Page {currentPage} of {document.pageCount || 1} • Registered Document Reference: {document.orderNo}
        </Box>
      </Paper>
    </Box>
  );
}
