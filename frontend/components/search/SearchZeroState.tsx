"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

interface SearchZeroStateProps {
  onSelectCategory: (category: string) => void;
  onApplyQuery: (query: string) => void;
  onBrowseAll: () => void;
}

const CATEGORY_CARDS = [
  {
    title: "Assessment Regulations",
    category: "Assessment Regulations",
    desc: "Valuation schedules, property tax surcharges, appraisal rules, and market value standards.",
    icon: <AssessmentRoundedIcon sx={{ fontSize: 24, color: "#F59E0B" }} />,
    color: "#F59E0B",
    count: "3 Directives",
  },
  {
    title: "Treasury Advisories",
    category: "Treasury Advisories",
    desc: "Electronic receipting, revenue collection automation, local cash reconciliations.",
    icon: <AccountBalanceRoundedIcon sx={{ fontSize: 24, color: "#10B981" }} />,
    color: "#10B981",
    count: "2 Circulars",
  },
  {
    title: "Legal Opinions",
    category: "Legal Opinions",
    desc: "Municipal franchise tax exemptions, LGC jurisdictional rulings, statutory mandates.",
    icon: <GavelRoundedIcon sx={{ fontSize: 24, color: "#3B82F6" }} />,
    color: "#3B82F6",
    count: "2 Opinions",
  },
  {
    title: "Standard Procedures",
    category: "Standard Procedures",
    desc: "Document intake, barcode indexing, high-speed scanning protocols, physical archive rules.",
    icon: <AssignmentRoundedIcon sx={{ fontSize: 24, color: "#8B5CF6" }} />,
    color: "#8B5CF6",
    count: "2 Manuals",
  },
];

const SEARCH_TIPS = [
  {
    label: "Smart Semantic Search",
    example: '"How are late property tax penalties calculated?"',
    desc: "Mayumi AI understands conversational questions and natural language intent.",
  },
  {
    label: "Exact Order Number",
    example: "BLGF-DO-2024-018",
    desc: "Directly jump to administrative orders, treasury circulars, or legal opinions.",
  },
  {
    label: "Exact Phrase Search",
    example: '"franchise tax exemption"',
    desc: "Use quotation marks in Keyword Search mode to match exact sequences of words.",
  },
];

export default function SearchZeroState({
  onSelectCategory,
  onApplyQuery,
  onBrowseAll,
}: SearchZeroStateProps) {
  return (
    <Box sx={{ width: "100%", py: 1 }}>
      {/* Hero Welcome Box */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3.5,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "background.paper",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 28 }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
          Search Official Directives & Municipal Records
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 540, mx: "auto", mb: 2.5, lineHeight: 1.6 }}
        >
          Explore indexed administrative orders, treasury circulars, and legal opinions. Query by natural
          language questions or exact directive order codes.
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={onBrowseAll}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            px: 2,
          }}
        >
          Browse All Indexed Records
        </Button>
      </Paper>

      {/* Categories Grid */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "text.secondary",
            mb: 1.5,
          }}
        >
          Explore by Category
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {CATEGORY_CARDS.map((cat) => (
            <Paper
              key={cat.category}
              variant="outlined"
              onClick={() => onSelectCategory(cat.category)}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: "background.paper",
                borderColor: "divider",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: cat.color,
                  bgcolor: (theme) => alpha(cat.color, 0.04),
                  transform: "translateY(-2px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 18px rgba(0,0,0,0.3)"
                      : "0 4px 14px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: alpha(cat.color, 0.12),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Chip
                    label={cat.count}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {cat.title}
                </Typography>

                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5, display: "block" }}>
                  {cat.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Search Operators Cheatsheet */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "background.paper" : alpha("#F8FAFC", 0.9)),
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "text.secondary",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
          Search Operators & Discovery Tips
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {SEARCH_TIPS.map((tip) => (
            <Box key={tip.label}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                {tip.label}
              </Typography>
              <Chip
                label={tip.example}
                size="small"
                onClick={() => onApplyQuery(tip.example.replace(/^"|"$/g, ""))}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.74rem",
                  mb: 0.75,
                  cursor: "pointer",
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected", color: "primary.main" },
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.45 }}>
                {tip.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
