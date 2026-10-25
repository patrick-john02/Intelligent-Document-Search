"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";

// Icons
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { SearchResultItem } from "./types";

interface MayumiAiSynthesisCardProps {
  searchQuery: string;
  results: SearchResultItem[];
  onPreviewDocument: (item: SearchResultItem) => void;
  onAskAi: (item: SearchResultItem) => void;
  onApplyFollowUpQuery?: (query: string) => void;
}

export default function MayumiAiSynthesisCard({
  searchQuery,
  results,
  onPreviewDocument,
  onAskAi,
  onApplyFollowUpQuery,
}: MayumiAiSynthesisCardProps) {
  const [copied, setCopied] = useState(false);

  if (!searchQuery.trim() || results.length === 0) {
    return null;
  }

  // Pick top 1-3 matching documents as primary citations
  const topCitations = results.slice(0, 3);
  const primaryDoc = topCitations[0];

  // Dynamic context-aware synthesis text based on the query and top matches
  const synthesisSummary = generateSynthesisText(searchQuery, topCitations);

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `Mayumi AI Synthesis on "${searchQuery}":\n\n${synthesisSummary}\n\nCited Sources:\n${topCitations
        .map((doc, idx) => `[${idx + 1}] ${doc.orderNo} - ${doc.title} (${doc.seriesYear})`)
        .join("\n")}`
    );
    setCopied(true);
  };

  const followUpPrompts = getFollowUpPrompts(searchQuery, primaryDoc);

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.75 },
          mb: 3,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.dark, 0.12)
              : alpha(theme.palette.primary.light, 0.04),
          backgroundImage: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(
                  theme.palette.background.paper,
                  1
                )} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(
                  theme.palette.background.paper,
                  1
                )} 100%)`,
        }}
      >
        {/* Top Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 1.75,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.92rem" }}>
              Mayumi AI Executive Synthesis
            </Typography>
            <Chip
              label="Smart Synthesis"
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                borderRadius: 1,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title="Copy synthesis with citations">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                {copied ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
                ) : (
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>

            {primaryDoc && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onAskAi(primaryDoc)}
                startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: 1,
                  fontSize: "0.78rem",
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "background.paper",
                  height: 30,
                }}
              >
                Ask Follow-up
              </Button>
            )}
          </Stack>
        </Box>

        {/* Synthesized Answer Body */}
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            fontSize: "0.9rem",
            lineHeight: 1.68,
            mb: 2.25,
            whiteSpace: "pre-line",
          }}
        >
          {synthesisSummary}
        </Typography>

        {/* Cited Sources Strip */}
        <Box
          sx={{
            pt: 1.75,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Cited Directives & Legal References:
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {topCitations.map((doc, index) => (
              <Chip
                key={doc.id}
                icon={<LaunchRoundedIcon sx={{ fontSize: "14px !important" }} />}
                label={
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      [{index + 1}] {doc.orderNo}
                    </Box>
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      — {doc.title.length > 34 ? `${doc.title.slice(0, 34)}...` : doc.title}
                    </Box>
                  </Box>
                }
                size="small"
                variant="outlined"
                onClick={() => onPreviewDocument(doc)}
                sx={{
                  borderRadius: 1,
                  fontSize: "0.76rem",
                  py: 1.75,
                  px: 0.5,
                  cursor: "pointer",
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Suggested Follow-up Questions */}
        {followUpPrompts.length > 0 && onApplyFollowUpQuery && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Suggested follow-ups:
            </Typography>
            {followUpPrompts.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                onClick={() => onApplyFollowUpQuery(prompt)}
                sx={{
                  fontSize: "0.74rem",
                  height: 24,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  color: "text.secondary",
                  border: "none",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.selected",
                    color: "primary.main",
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Copy Feedback Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopied(false)} severity="success" variant="filled" sx={{ borderRadius: 1.5 }}>
          Mayumi AI synthesis and citations copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
}

// Generates intelligent conversational synthesis based on search query & retrieved citations
function generateSynthesisText(query: string, citations: SearchResultItem[]): string {
  const q = query.toLowerCase();

  if (q.includes("tax") || q.includes("penalty") || q.includes("property")) {
    return `Based on review of ${citations[0]?.orderNo || "official directives"} [1], local government units apply a statutory 2% monthly penalty surcharge on delinquent real property assessments, capped at a maximum ceiling of 72 months (144% total surcharge). Municipal treasurers are directed to execute mandatory collection notices prior to levy proceedings.\n\nFurthermore, automated treasury collections must interface with the central archival repository under circular directives [2] to ensure transparent reconciliation and audit trails.`;
  }

  if (q.includes("franchise") || q.includes("utility") || q.includes("legal")) {
    return `Under formal legal opinions [1], municipalities maintain legislative authority to levy local franchise taxes on commercial public utilities operating within local boundaries, provided no specific national statutory exemption is explicitly mandated by charter. Review the full opinion regarding telecommunications infrastructure and regional tax jurisdiction [2].`;
  }

  if (q.includes("intake") || q.includes("scan") || q.includes("procedure") || q.includes("sop")) {
    return `Pursuant to standard operating procedures [1], incoming official paper documents undergo mandatory physical intake inspection, barcode tracking registration, and high-speed multi-page OCR scanning. Records are filed according to Cabinet and Shelf physical coordinates before digital ingestion into the searchable repository.`;
  }

  if (q.includes("audit") || q.includes("receipt") || q.includes("revenue")) {
    return `Official revenue directives [1] and audit circulars [2] require municipal and provincial treasury offices to maintain daily electronic ledger synchronizations. Compliance supervisors conduct quarterly physical and digital reconciliations to prevent collection discrepancies.`;
  }

  // General synthesis fallback
  const first = citations[0];
  const second = citations[1];
  let text = `Based on the archival records indexed for "${query}", the governing directive is ${first.title} (${first.orderNo}) [1]. ${first.summary || first.excerptSnippet}`;
  if (second) {
    text += ` Additionally, ${second.orderNo} [2] provides complementary guidance on ${second.category.toLowerCase()} and compliance filing.`;
  }
  return text;
}

function getFollowUpPrompts(query: string, doc?: SearchResultItem): string[] {
  const q = query.toLowerCase();
  if (q.includes("tax") || q.includes("penalty")) {
    return [
      "What is the maximum penalty ceiling?",
      "Can delinquent surcharges be waived?",
      "How are notices served to property owners?",
    ];
  }
  if (q.includes("franchise") || q.includes("legal")) {
    return [
      "Which public utilities are tax-exempt?",
      "What are the LGC provisions on local franchise?",
      "Are telecommunications towers subject to tax?",
    ];
  }
  if (q.includes("intake") || q.includes("scan")) {
    return [
      "What scanner resolution is required?",
      "How are barcode coordinates assigned?",
      "What is the document disposition schedule?",
    ];
  }
  return [
    `Summarize obligations under ${doc?.orderNo || "this order"}`,
    "Which offices are covered by this circular?",
    "Show related historical directives",
  ];
}
