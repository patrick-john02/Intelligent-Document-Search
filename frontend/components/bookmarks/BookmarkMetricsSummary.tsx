"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import FolderSpecialRoundedIcon from "@mui/icons-material/FolderSpecialRounded";
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
      icon: <BookmarkBorderRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />,
      colorBg: "action.hover",
    },
    {
      label: "Pinned Items",
      value: metrics.pinnedCount,
      subtext: "Prioritized for quick access",
      filterKey: "PINNED",
      icon: <StarRoundedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
      colorBg: "rgba(245, 158, 11, 0.08)",
    },
    {
      label: "Physical Shelves",
      value: metrics.physicalOnShelfCount,
      subtext: "Archive cabinet barcodes",
      filterKey: "SHELF",
      icon: <PlaceOutlinedIcon sx={{ color: "#10B981", fontSize: 20 }} />,
      colorBg: "rgba(16, 185, 129, 0.08)",
    },
    {
      label: "With Notes",
      value: metrics.withNotesCount || 0,
      subtext: "Personal annotations",
      filterKey: "NOTES",
      icon: <NoteAltOutlinedIcon sx={{ color: "#8B5CF6", fontSize: 20 }} />,
      colorBg: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "Collections",
      value: metrics.collectionsCount,
      subtext: "Subject categories",
      filterKey: undefined,
      icon: <FolderSpecialRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />,
      colorBg: "action.hover",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(5, 1fr)",
        },
        gap: 1.5,
      }}
    >
      {cards.map((card) => {
        const isClickable = !!card.filterKey && !!onFilterClick;
        const isSelected = activeFilter === card.filterKey;

        return (
          <Card
            key={card.label}
            variant="outlined"
            onClick={() => isClickable && card.filterKey && onFilterClick(card.filterKey)}
            sx={(theme) => ({
              borderRadius: 2.5,
              borderColor: isSelected ? "primary.main" : "divider",
              borderWidth: isSelected ? 2 : 1,
              bgcolor: isSelected
                ? "action.selected"
                : "background.paper",
              boxShadow: isSelected ? "0 2px 10px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
              cursor: isClickable ? "pointer" : "default",
              transition: "all 0.18s ease-in-out",
              position: "relative",
              overflow: "hidden",
              "&:hover": isClickable
                ? {
                    borderColor: isSelected ? "primary.main" : "text.secondary",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }
                : undefined,
            })}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    fontSize: "0.68rem",
                  }}
                >
                  {card.label}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: card.colorBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: "text.primary", mb: 0.25 }}>
                {card.value}
              </Typography>

              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block" }}>
                {card.subtext}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
