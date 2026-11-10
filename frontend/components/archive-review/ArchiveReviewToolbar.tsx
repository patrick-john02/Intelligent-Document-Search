"use client";

import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { ProposalStatus } from "@/lib/archiveReviewApi";

export type UrgencyFilter = "all" | "flagged" | "clean";

interface ArchiveReviewToolbarProps {
  status: ProposalStatus;
  onStatusChange: (newStatus: ProposalStatus) => void;
  statusCounts: Record<ProposalStatus, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  urgencyFilter: UrgencyFilter;
  onUrgencyFilterChange: (filter: UrgencyFilter) => void;
  selectedCount: number;
  onBatchAcceptSelected?: () => void;
  onBatchRerunFailed?: () => void;
  isBatchWorking?: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const TABS: { value: ProposalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Approved" },
  { value: "edited", label: "Edited" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
];

export default function ArchiveReviewToolbar({
  status,
  onStatusChange,
  statusCounts,
  searchQuery,
  onSearchChange,
  urgencyFilter,
  onUrgencyFilterChange,
  selectedCount,
  onBatchAcceptSelected,
  onBatchRerunFailed,
  isBatchWorking = false,
  onRefresh,
  isRefreshing = false,
}: ArchiveReviewToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        pb: 1.5,
        mb: 2,
        flexShrink: 0,
      }}
    >
      {/* Top Row: Status Tabs + Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Tabs
          value={status}
          onChange={(_, val: ProposalStatus) => onStatusChange(val)}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              py: 0.75,
              px: 1.5,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
            },
          }}
        >
          {TABS.map((t) => {
            const count = statusCounts[t.value] || 0;
            return (
              <Tab
                key={t.value}
                value={t.value}
                label={
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <span>{t.label}</span>
                    <Chip
                      size="small"
                      label={count}
                      color={t.value === status ? "primary" : "default"}
                      sx={{
                        height: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        px: 0.25,
                      }}
                    />
                  </Stack>
                }
              />
            );
          })}
        </Tabs>

        {/* Action Tools */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {status === "pending" && selectedCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={isBatchWorking}
              onClick={onBatchAcceptSelected}
              startIcon={
                isBatchWorking ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2,
              }}
            >
              Approve Selected ({selectedCount})
            </Button>
          )}

          {status === "failed" && (statusCounts.failed || 0) > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={isBatchWorking}
              onClick={onBatchRerunFailed}
              startIcon={
                isBatchWorking ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2,
              }}
            >
              Re-run Failed ({statusCounts.failed})
            </Button>
          )}

          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={isRefreshing}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                p: 0.75,
              }}
            >
              <RefreshRoundedIcon
                sx={{
                  fontSize: 18,
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Bottom Row: Search Input + Status Filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by title, file name, or order number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange("")}>
                    <ClearRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            minWidth: { xs: "100%", sm: 360, md: 420 },
            "& .MuiInputBase-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            },
          }}
        />

        {status === "pending" && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Filter:
            </Typography>
            <ToggleButtonGroup
              value={urgencyFilter}
              exclusive
              onChange={(_, val) => val && onUrgencyFilterChange(val)}
              size="small"
              sx={{
                borderRadius: 2,
                "& .MuiToggleButton-root": {
                  py: 0.4,
                  px: 1.5,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  textTransform: "none",
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="flagged">Needs Attention</ToggleButton>
              <ToggleButton value="clean">Ready to Approve</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
