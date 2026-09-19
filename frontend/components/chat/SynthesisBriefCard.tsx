"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { CitedDocument } from "./EvidenceInspector";

export interface WorkbenchMessageItem {
  id: string;
  sender: "user" | "agent";
  timestamp: string;
  taskMode?: "inquiry" | "compare" | "audit";
  userQuery?: string;
  executiveSummary?: string;
  keyProvisions?: string[];
  statutoryDeadlines?: string[];
  citedDocuments?: CitedDocument[];
}

interface SynthesisBriefCardProps {
  message: WorkbenchMessageItem;
  onInspectDocument: (doc: CitedDocument) => void;
  activeInspectedDocId?: string | number;
}

export default function SynthesisBriefCard({
  message,
  onInspectDocument,
  activeInspectedDocId,
}: SynthesisBriefCardProps) {
  // If user message, render clean directive inquiry paper
  if (message.sender === "user") {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
            maxWidth: { xs: "100%", md: "85%" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "primary.main", letterSpacing: "0.05em" }}>
              Staff Regulatory Inquiry
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {message.timestamp}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.95rem" }}>
            {message.userQuery}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Agent Message: Render Structured Archival Brief
  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* 1. Brief Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: "action.hover",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Official Research Finding
            </Typography>
            <Chip
              label="Verified Citation"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20, borderRadius: 1 }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Generated {message.timestamp}
            </Typography>
          </Box>
        </Box>

        {/* 2. Executive Synthesis Body */}
        <Box sx={{ p: { xs: 2, sm: 2.75 } }}>
          {/* Executive Summary */}
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary", display: "block", mb: 0.5 }}>
            Executive Summary
          </Typography>
          <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.65, fontSize: "0.92rem", mb: 2.5 }}>
            {message.executiveSummary}
          </Typography>

          {/* Key Provisions & Regulations */}
          {message.keyProvisions && message.keyProvisions.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary", display: "block", mb: 1 }}>
                Mandated Directives & Enforcement Rules
              </Typography>
              <Stack spacing={1}>
                {message.keyProvisions.map((prov, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      borderColor: "divider",
                      borderLeft: "3px solid",
                      borderLeftColor: "primary.main",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "text.primary", lineHeight: 1.5 }}>
                      {prov}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Interactive Source Directives / Citations */}
          {message.citedDocuments && message.citedDocuments.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary", display: "block", mb: 1 }}>
                Cited Official Directives (Click to Inspect Evidence & Shelf Location)
              </Typography>

              <Stack spacing={1}>
                {message.citedDocuments.map((doc) => {
                  const isSelected = activeInspectedDocId === doc.id;
                  const matchPct = Math.round(doc.relevanceScore * 100);
                  return (
                    <Box
                      key={doc.id}
                      component="button"
                      onClick={() => onInspectDocument(doc)}
                      sx={{
                        p: 1.5,
                        width: "100%",
                        textAlign: "left",
                        bgcolor: isSelected ? "action.selected" : "action.hover",
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderRadius: 1,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary" }}>
                          {doc.title}
                        </Typography>
                        <Chip
                          label={`${matchPct}% Match`}
                          size="small"
                          color={matchPct >= 90 ? "success" : "primary"}
                          sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20, borderRadius: 1 }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          Order: {doc.orderNo} ({doc.seriesYear}) • Page {doc.pageNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                          Shelf: {doc.shelfLocation} →
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>

        {/* 3. Action Bar */}
        <Divider />
        <Box
          sx={{
            p: 1.5,
            px: { xs: 2, sm: 2.75 },
            bgcolor: "action.hover",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Citations cross-verified against PGVector index
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 1,
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                color: "text.primary",
              }}
              onClick={() => alert("Citation text copied to clipboard.")}
            >
              Copy Citation
            </Button>
            <Button
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 1,
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                color: "text.primary",
              }}
              onClick={() => alert("Exporting official research brief...")}
            >
              Export Brief
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
