"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";

export interface SmartSearchResultItem {
  id: number | string;
  title: string;
  orderNo: string;
  seriesYear: string | number;
  category: string;
  clearance: "Public" | "Internal" | "Restricted" | "Confidential" | string;
  relevanceScore: number; // 0 to 1, e.g. 0.984
  shelfLocation: string;
  excerptSnippet: string;
  fileSize?: string;
  pageCount?: number;
}

export interface SmartSearchResultCardProps {
  item: SmartSearchResultItem;
  searchQuery?: string;
}

export default function SmartSearchResultCard({
  item,
}: SmartSearchResultCardProps) {
  // Determine color and label based on AI vector similarity score
  const matchPercentage = Math.round(item.relevanceScore * 100);
  const scoreColor =
    matchPercentage >= 90
      ? "success"
      : matchPercentage >= 75
      ? "primary"
      : "warning";

  const clearanceColor =
    item.clearance === "Public"
      ? "success"
      : item.clearance === "Internal"
      ? "info"
      : item.clearance === "Confidential"
      ? "warning"
      : "error";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        width: "100%",
        boxShadow: "none",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* 1. Header Badges: Category, Clearance, and AI Match Score */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 1.25,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={item.category}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22, borderRadius: 1 }}
            />
            <Chip
              label={item.clearance}
              size="small"
              color={clearanceColor}
              variant="filled"
              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderRadius: 1 }}
            />
          </Box>

          {/* AI Semantic Relevance Score */}
          <Tooltip title={`Cosine Similarity: ${item.relevanceScore.toFixed(4)}`}>
            <Chip
              label={`${matchPercentage}% Match`}
              size="small"
              color={scoreColor}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 22,
                borderRadius: 1,
              }}
            />
          </Tooltip>
        </Box>

        {/* 2. Document Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.05rem", sm: "1.15rem" },
            color: "text.primary",
            lineHeight: 1.35,
            mb: 1,
          }}
        >
          {item.title}
        </Typography>

        {/* 3. Metadata Row: Directive Number, Series Year, and Physical Shelf Location */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 1.75,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
            Order No: {item.orderNo}
          </Typography>

          <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
            Series: {item.seriesYear}
          </Typography>

          {/* Physical Shelf Location Tag */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(0, 0, 0, 0.05)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
              Archive Location: {item.shelfLocation}
            </Typography>
          </Box>
        </Stack>

        {/* 4. Semantic Excerpt / Snippet Box */}
        <Paper
          variant="outlined"
          sx={{
            p: 1.75,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "text.secondary",
              fontSize: "0.68rem",
              display: "block",
              mb: 0.5,
            }}
          >
            Relevant Excerpt
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              lineHeight: 1.6,
              fontSize: "0.85rem",
            }}
          >
            "{item.excerptSnippet}"
          </Typography>
        </Paper>

        {/* 5. Footer Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {item.pageCount ? `${item.pageCount} Pages • ` : ""}
            {item.fileSize ? `${item.fileSize} • ` : ""}
            Indexed in Vector Space
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* View Document */}
            <Button
              component={Link}
              href="/documents"
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 2,
              }}
            >
              Open PDF
            </Button>

            {/* Ask AI Assistant */}
            <Button
              component={Link}
              href={`/chat?q=${encodeURIComponent(
                `Tell me about ${item.title} (${item.orderNo})`
              )}`}
              size="small"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
                px: 2,
                boxShadow: "none",
              }}
            >
              Ask AI Assistant
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
