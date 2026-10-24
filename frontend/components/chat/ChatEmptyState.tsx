"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

// Icons
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";

export interface SuggestedPrompt {
  id: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  prompt: string;
  orderNo?: string;
}

const STARTER_PROMPTS: SuggestedPrompt[] = [
  {
    id: "prompt-1",
    icon: <ReceiptLongRoundedIcon sx={{ fontSize: 20 }} />,
    category: "Assessment",
    title: "Property Tax Delinquency Surcharges",
    prompt: "What is the statutory penalty ceiling and monthly surcharge on delinquent real property tax under BLGF guidelines?",
    orderNo: "BLGF-DO-2024-018",
  },
  {
    id: "prompt-2",
    icon: <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />,
    category: "Treasury",
    title: "Treasury Electronic Receipting Protocol",
    prompt: "What are the compliance deadlines and guidelines for municipal treasury units maintaining electronic collection logs?",
    orderNo: "TC-2024-009",
  },
  {
    id: "prompt-3",
    icon: <GavelRoundedIcon sx={{ fontSize: 20 }} />,
    category: "Legal Opinions",
    title: "Franchise Tax Exemptions",
    prompt: "Can a municipality levy franchise taxes on public utilities according to regional legal opinions?",
    orderNo: "LO-R2-2023-042",
  },
  {
    id: "prompt-4",
    icon: <Inventory2RoundedIcon sx={{ fontSize: 20 }} />,
    category: "Archival SOP",
    title: "Physical Document Ingestion & Shelf Scanning",
    prompt: "Explain the standard operating procedure for physical document intake, barcode labeling, and physical shelf coordinates.",
    orderNo: "SOP-DOC-2024-001",
  },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  onTriggerMention?: () => void;
}

export default function ChatEmptyState({ onSelectPrompt, onTriggerMention }: ChatEmptyStateProps) {
  return (
    <Box
      sx={{
        my: "auto",
        py: 4,
        px: { xs: 1, sm: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 820,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Brand Icon Header */}
      <Box
        sx={(theme) => ({
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          mb: 2,
          boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0.05)}`,
        })}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 28 }} />
      </Box>

      {/* Hero Headings */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          color: "text.primary",
          mb: 0.75,
          letterSpacing: "-0.01em",
        }}
      >
        How can I assist your document search today?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          textAlign: "center",
          maxWidth: 580,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        Ask questions about tax advisories, treasury memorandums, or regulatory compliance.
        Every response is grounded with citations and physical shelf coordinates.
      </Typography>

      {/* Suggested Starter Cards Grid */}
      <Grid container spacing={1.5} sx={{ width: "100%", mb: 3 }}>
        {STARTER_PROMPTS.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6 }}>
            <Paper
              component={ButtonBase}
              onClick={() => onSelectPrompt(item.prompt)}
              variant="outlined"
              sx={(theme) => ({
                width: "100%",
                p: 2,
                borderRadius: 2,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                bgcolor: "background.paper",
                borderColor: "divider",
                transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                gap: 1.25,
                height: "100%",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  transform: "translateY(-1px)",
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.06)}`,
                },
              })}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                  {item.icon}
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
                    {item.category}
                  </Typography>
                </Box>
                {item.orderNo && (
                  <Chip
                    label={item.orderNo}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      borderRadius: 1,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  />
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.45, display: "block" }}>
                  "{item.prompt}"
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Target Directive Tip */}
      {onTriggerMention && (
        <Stack
          direction="row"
          spacing={1}
          sx={(theme) => ({
            alignItems: "center",
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            border: "1px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.2),
          })}
        >
          <AlternateEmailRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
            Tip: Type <strong>@</strong> or click{" "}
            <Box
              component="span"
              onClick={onTriggerMention}
              sx={{
                color: "primary.main",
                fontWeight: 700,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Target Directive
            </Box>{" "}
            in the composer to bound AI retrieval to a specific archive document.
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
