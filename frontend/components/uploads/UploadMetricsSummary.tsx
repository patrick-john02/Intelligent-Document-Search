"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { UploadMetrics } from "./types";

interface UploadMetricsSummaryProps {
  metrics: UploadMetrics;
}

export default function UploadMetricsSummary({ metrics }: UploadMetricsSummaryProps) {
  const cards = [
    {
      label: "Total Documents",
      value: metrics.totalUploads,
      caption: "All uploaded files",
      color: "text.primary",
    },
    {
      label: "Published",
      value: metrics.indexedCount,
      caption: "Available in repository",
      color: "success.main",
    },
    {
      label: "In Processing",
      value: metrics.processingCount,
      caption: "Being analyzed",
      color: "info.main",
    },
    {
      label: "Needs Review",
      value: metrics.reviewRequiredCount,
      caption: "Awaiting staff check",
      color: metrics.reviewRequiredCount > 0 ? "warning.main" : "text.secondary",
    },
    {
      label: "Categories",
      value: metrics.categoriesCount || 5,
      caption: "Archival divisions",
      color: "primary.main",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
        },
        gap: 1.5,
        width: "100%",
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.label}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "background.paper",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {card.label}
          </Typography>
          <Box sx={{ my: 0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: card.color,
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            {card.caption}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
