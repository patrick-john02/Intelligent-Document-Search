"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { StaffUploadItem } from "./types";

export interface CategoryMeta {
  name: string;
  code: string;
  division: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
}

export const TEAMS_CATEGORIES: CategoryMeta[] = [
  {
    name: "Assessment Regulations",
    code: "AR",
    division: "Assessments & Valuations Office",
    description: "Property valuations, schedule of market values, and tax assessor guidelines.",
    badgeBg: "rgba(14, 116, 144, 0.08)",
    badgeColor: "#0891b2",
  },
  {
    name: "Treasury Advisories",
    code: "TA",
    division: "Treasury & Revenue Collections",
    description: "Local collections, electronic receipting, tax amnesty, and circulars.",
    badgeBg: "rgba(16, 185, 129, 0.08)",
    badgeColor: "#059669",
  },
  {
    name: "Legal Opinions",
    code: "LO",
    division: "Legal Affairs & Rulings",
    description: "Statutory interpretations, tax exemption appeals, and counsel opinions.",
    badgeBg: "rgba(245, 158, 11, 0.08)",
    badgeColor: "#d97706",
  },
  {
    name: "Memorandums & Audits",
    code: "MA",
    division: "Regional Operations & Audits",
    description: "Financial audit findings, compliance memos, and inter-agency directives.",
    badgeBg: "rgba(139, 92, 246, 0.08)",
    badgeColor: "#7c3aed",
  },
  {
    name: "Standard Procedures",
    code: "SP",
    division: "Records Management & Guidelines",
    description: "Operating manuals, administrative guidelines, and custody protocols.",
    badgeBg: "rgba(59, 130, 246, 0.08)",
    badgeColor: "#2563eb",
  },
];

interface TeamsCategoryGridProps {
  items: StaffUploadItem[];
  searchQuery: string;
  onSelectCategory: (categoryName: string) => void;
}

export default function TeamsCategoryGrid({
  items,
  searchQuery,
  onSelectCategory,
}: TeamsCategoryGridProps) {
  // Filter categories based on search query
  const filteredCategories = TEAMS_CATEGORIES.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesCat =
      cat.name.toLowerCase().includes(q) ||
      cat.division.toLowerCase().includes(q) ||
      cat.code.toLowerCase().includes(q);
    const hasMatchingDoc = items.some(
      (d) =>
        d.category === cat.name &&
        (d.title.toLowerCase().includes(q) || d.orderNo.toLowerCase().includes(q))
    );
    return matchesCat || hasMatchingDoc;
  });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
        gap: 2,
        width: "100%",
        height: "100%",
        overflowY: "auto",
        p: 0.5,
      }}
    >
      {filteredCategories.map((cat) => {
        const catDocs = items.filter((d) => d.category === cat.name);
        const recentDocs = catDocs.slice(0, 2);

        return (
          <Paper
            key={cat.name}
            variant="outlined"
            onClick={() => onSelectCategory(cat.name)}
            sx={{
              borderRadius: 1,
              bgcolor: "background.paper",
              borderColor: "divider",
              p: 2.25,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 0.15s ease",
              borderTop: "3px solid",
              borderTopColor: cat.badgeColor,
              "&:hover": {
                borderColor: cat.badgeColor,
                transform: "translateY(-1px)",
              },
            }}
          >
            {/* Header: Monogram Avatar + Category Title */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.25 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: cat.badgeBg,
                    color: cat.badgeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    flexShrink: 0,
                    border: "1px solid",
                    borderColor: cat.badgeColor,
                  }}
                >
                  {cat.code}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.2,
                      fontSize: "0.95rem",
                      color: "text.primary",
                      mb: 0.25,
                    }}
                  >
                    {cat.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      fontSize: "0.72rem",
                    }}
                  >
                    {cat.division}
                  </Typography>
                </Box>

                <Chip
                  label={`${catDocs.length}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: "0.74rem",
                  lineHeight: 1.4,
                  mb: 1.5,
                  minHeight: "2.8em",
                }}
              >
                {cat.description}
              </Typography>

              <Divider sx={{ my: 1 }} />

              {/* Recent Files Preview */}
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    fontSize: "0.68rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    display: "block",
                    mb: 0.75,
                  }}
                >
                  Recent Documents
                </Typography>

                {recentDocs.length > 0 ? (
                  <Stack spacing={0.75}>
                    {recentDocs.map((doc) => (
                      <Box
                        key={doc.id}
                        sx={{
                          bgcolor: "action.hover",
                          py: 0.6,
                          px: 1,
                          borderRadius: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.73rem",
                            color: "text.primary",
                            maxWidth: "80%",
                          }}
                        >
                          {doc.orderNo}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.68rem",
                            color: "text.secondary",
                          }}
                        >
                          {doc.version || "v1.0"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", fontStyle: "italic" }}>
                    No documents yet
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Bottom Actions: "Open" Only */}
            <Box sx={{ pt: 1.25 }}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory(cat.name);
                }}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  py: 0.5,
                }}
              >
                Open
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
