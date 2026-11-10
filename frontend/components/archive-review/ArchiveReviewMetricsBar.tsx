"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";

// MUI Icons
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { ArchiveProposal, ProposalStatus } from "@/lib/archiveReviewApi";

interface ArchiveReviewMetricsBarProps {
  proposals: ArchiveProposal[];
  statusCounts: Record<ProposalStatus, number>;
  onFastTrackSelect?: () => void;
}

export default function ArchiveReviewMetricsBar({
  proposals,
  statusCounts,
}: ArchiveReviewMetricsBarProps) {
  const theme = useTheme();

  // Aggregate stats
  const pendingCount = statusCounts.pending || 0;
  const acceptedCount = statusCounts.accepted || 0;
  const editedCount = statusCounts.edited || 0;
  const failedCount = statusCounts.failed || 0;

  // Active proposals breakdown (if in pending view)
  const needsReviewCount = proposals.filter((p) => p.needs_human_review).length;
  const duplicatesCount = proposals.filter(
    (p) => (p.proposal?.duplicates?.length ?? 0) > 0
  ).length;
  const attentionCount = needsReviewCount + duplicatesCount;
  const approvedTotal = acceptedCount + editedCount;

  const cards = [
    {
      label: "Pending Review",
      value: pendingCount,
      description: pendingCount === 1 ? "1 document waiting" : `${pendingCount} documents waiting`,
      icon: <PendingActionsRoundedIcon sx={{ fontSize: 22 }} />,
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.08),
    },
    {
      label: "Needs Attention",
      value: attentionCount,
      description:
        duplicatesCount > 0
          ? `${duplicatesCount} duplicate(s) flagged`
          : attentionCount > 0
          ? `${attentionCount} item(s) to verify`
          : "No pending issues",
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />,
      color: attentionCount > 0 ? theme.palette.warning.dark : theme.palette.text.secondary,
      bg: attentionCount > 0 ? alpha(theme.palette.warning.main, 0.08) : alpha(theme.palette.divider, 0.06),
    },
    {
      label: "Approved",
      value: approvedTotal,
      description: `${acceptedCount} as-is, ${editedCount} edited`,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />,
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.08),
    },
    {
      label: "Failed Processing",
      value: failedCount,
      description: failedCount > 0 ? "Requires re-processing" : "All extractions succeeded",
      icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 22 }} />,
      color: failedCount > 0 ? theme.palette.error.main : theme.palette.text.secondary,
      bg: failedCount > 0 ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.divider, 0.06),
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 1.5,
        mb: 2,
        flexShrink: 0,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.label}
          variant="outlined"
          sx={{
            p: 1.75,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              bgcolor: card.bg,
              color: card.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {card.icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
              {card.label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {card.value}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block" }}>
              {card.description}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
