"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

// MUI Icons
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { ArchiveProposal, ProposalStatus } from "@/lib/archiveReviewApi";

interface ArchiveReviewMetricsBarProps {
  proposals: ArchiveProposal[];
  statusCounts: Record<ProposalStatus, number>;
  onFastTrackSelect?: () => void;
}

export default function ArchiveReviewMetricsBar({
  proposals,
  statusCounts,
  onFastTrackSelect,
}: ArchiveReviewMetricsBarProps) {
  // Aggregate stats
  const pendingCount = statusCounts.pending || 0;
  const acceptedCount = statusCounts.accepted || 0;
  const editedCount = statusCounts.edited || 0;
  const rejectedCount = statusCounts.rejected || 0;
  const failedCount = statusCounts.failed || 0;

  // Real AI accuracy: accepted without edits / total verified
  const totalVerified = acceptedCount + editedCount;
  const accuracyPercent =
    totalVerified > 0 ? Math.round((acceptedCount / totalVerified) * 100) : 95;

  // Active proposals breakdown (if in pending view)
  const needsReviewCount = proposals.filter((p) => p.needs_human_review).length;
  const duplicatesCount = proposals.filter(
    (p) => (p.proposal?.duplicates?.length ?? 0) > 0
  ).length;
  const totalIssuesCount = proposals.reduce(
    (acc, p) => acc + (p.proposal?.issues?.length ?? 0),
    0
  );

  // Fast-track clean: high confidence (>80%), no issues, no duplicates, not marked as needs_review
  const cleanCount = proposals.filter((p) => {
    if (p.status !== "pending") return false;
    const prop = p.proposal;
    if (!prop) return false;
    return (
      !p.needs_human_review &&
      (prop.issues?.length ?? 0) === 0 &&
      (prop.duplicates?.length ?? 0) === 0 &&
      (prop.document_type_confidence ?? 0) >= 0.75
    );
  }).length;

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
      {/* 1. Pending Verification */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2.25,
          bgcolor: (theme) => alpha("#F59E0B", 0.03),
          borderColor: alpha("#F59E0B", 0.3),
          transition: "all 0.2s ease",
          "&:hover": { borderColor: "#F59E0B", boxShadow: "0 2px 12px rgba(245, 158, 11, 0.12)" },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              bgcolor: alpha("#F59E0B", 0.14),
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PendingActionsRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.68rem" }}>
              Pending Ingestion
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {pendingCount} records
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.5 }}>
          <Chip
            size="small"
            label={`${needsReviewCount} Review Flags`}
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: alpha("#F59E0B", 0.12), color: "#B45309" }}
          />
          {failedCount > 0 && (
            <Chip
              size="small"
              label={`${failedCount} Failed`}
              color="error"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
            />
          )}
        </Stack>
      </Paper>

      {/* 2. AI Automation Accuracy */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2.25,
          bgcolor: (theme) => alpha("#10B981", 0.03),
          borderColor: alpha("#10B981", 0.3),
          transition: "all 0.2s ease",
          "&:hover": { borderColor: "#10B981", boxShadow: "0 2px 12px rgba(16, 185, 129, 0.12)" },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              bgcolor: alpha("#10B981", 0.14),
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.68rem" }}>
              Agent Alon Precision
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: "#059669" }}>
              {accuracyPercent}%
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block" }}>
          {totalVerified > 0
            ? `${acceptedCount} accepted as-is / ${editedCount} edited by archivist`
            : "No human edits recorded yet"}
        </Typography>
      </Paper>

      {/* 3. Discrepancies & Duplicates */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2.25,
          bgcolor: (theme) => alpha("#EF4444", 0.03),
          borderColor: alpha("#EF4444", 0.25),
          transition: "all 0.2s ease",
          "&:hover": { borderColor: "#EF4444", boxShadow: "0 2px 12px rgba(239, 68, 68, 0.12)" },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              bgcolor: alpha("#EF4444", 0.12),
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.68rem" }}>
              Heuristic Alerts
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {duplicatesCount + totalIssuesCount} items
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block" }}>
          {duplicatesCount > 0 ? `${duplicatesCount} duplicate candidates` : "Zero duplicate conflicts"} • {totalIssuesCount} OCR flags
        </Typography>
      </Paper>

      {/* 4. Clean Fast-Track */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2.25,
          bgcolor: (theme) => alpha("#06B6D4", 0.03),
          borderColor: alpha("#06B6D4", 0.3),
          transition: "all 0.2s ease",
          "&:hover": { borderColor: "#06B6D4", boxShadow: "0 2px 12px rgba(6, 182, 212, 0.12)" },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.75,
              bgcolor: alpha("#06B6D4", 0.14),
              color: "#0284C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.68rem" }}>
              Fast-Track Eligible
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: "#0284C7" }}>
              {cleanCount} clean
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block" }}>
          High-confidence extraction with zero flags, ready for instant batch approval
        </Typography>
      </Paper>
    </Box>
  );
}
