"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BookmarkMetrics } from "./types";

interface BookmarkMetricsSummaryProps {
  metrics: BookmarkMetrics;
  activeFilter?: string;
  onFilterClick?: (filter: string) => void;
}

export default function BookmarkMetricsSummary({
  metrics,
  activeFilter,
  onFilterClick,
}: BookmarkMetricsSummaryProps) {
  const cards = [
    {
      label: "Total Saved",
      value: metrics.totalSaved,
      subtext: "Bookmarked directives",
      filterKey: "All",
    },
    {
      label: "Collections",
      value: metrics.collectionsCount,
      subtext: "Personal subject folders",
      filterKey: undefined,
    },
    {
      label: "Pinned Items",
      value: metrics.pinnedCount,
      subtext: "Prioritized for quick reference",
      filterKey: "PINNED",
    },
    {
      label: "Physical Shelves",
      value: metrics.physicalOnShelfCount,
      subtext: "Mapped to archive cabinets",
      filterKey: undefined,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 1.5,
      }}
    >
      {cards.map((card) => {
        const isClickable = !!card.filterKey && !!onFilterClick;
        const isSelected = activeFilter === card.filterKey;

        return (
          <Paper
            key={card.label}
            variant="outlined"
            onClick={() => isClickable && card.filterKey && onFilterClick(card.filterKey)}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: isSelected ? "action.selected" : "background.paper",
              borderColor: isSelected ? "primary.main" : "divider",
              cursor: isClickable ? "pointer" : "default",
              transition: "all 0.15s ease",
              "&:hover": isClickable
                ? {
                    borderColor: "primary.main",
                    bgcolor: isSelected ? "action.selected" : "action.hover",
                  }
                : undefined,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                mb: 0.5,
              }}
            >
              {card.label}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {card.value}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.74rem",
              }}
            >
              {card.subtext}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
