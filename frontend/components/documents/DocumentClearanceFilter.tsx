"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";

// Icons
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GppMaybeRoundedIcon from "@mui/icons-material/GppMaybeRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { DocumentClearanceFilterOption } from "./types";

export interface ClearanceItemConfig {
  value: DocumentClearanceFilterOption;
  label: string;
  shortLabel: string;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: React.ReactNode;
  description: string;
}

export const CLEARANCE_CONFIGS: ClearanceItemConfig[] = [
  {
    value: "All",
    label: "All Clearances",
    shortLabel: "All",
    color: "#64748B",
    bgLight: "rgba(100, 116, 139, 0.08)",
    bgDark: "rgba(148, 163, 184, 0.15)",
    icon: <SecurityRoundedIcon sx={{ fontSize: 16 }} />,
    description: "Display all records regardless of security classification tier",
  },
  {
    value: "Public",
    label: "Public",
    shortLabel: "Public",
    color: "#10B981",
    bgLight: "rgba(16, 185, 129, 0.1)",
    bgDark: "rgba(16, 185, 129, 0.2)",
    icon: <PublicRoundedIcon sx={{ fontSize: 16 }} />,
    description: "Freely accessible public ordinances, executive resolutions, and official gazettes",
  },
  {
    value: "Internal",
    label: "Internal",
    shortLabel: "Internal",
    color: "#3B82F6",
    bgLight: "rgba(59, 130, 246, 0.1)",
    bgDark: "rgba(59, 130, 246, 0.2)",
    icon: <ShieldRoundedIcon sx={{ fontSize: 16 }} />,
    description: "Municipal staff memoranda, routine operational guidelines, and standard directives",
  },
  {
    value: "Restricted",
    label: "Restricted",
    shortLabel: "Restricted",
    color: "#F59E0B",
    bgLight: "rgba(245, 158, 11, 0.1)",
    bgDark: "rgba(245, 158, 11, 0.2)",
    icon: <GppMaybeRoundedIcon sx={{ fontSize: 16 }} />,
    description: "Departmental access restricted to finance, appraisal assessments, and tax registries",
  },
  {
    value: "Confidential",
    label: "Confidential",
    shortLabel: "Confidential",
    color: "#EF4444",
    bgLight: "rgba(239, 68, 68, 0.1)",
    bgDark: "rgba(239, 68, 68, 0.2)",
    icon: <LockPersonRoundedIcon sx={{ fontSize: 16 }} />,
    description: "Executive clearance required: legal opinions, personnel audits, and sealed decrees",
  },
];

export interface DocumentClearanceFilterProps {
  selectedClearance: DocumentClearanceFilterOption;
  onClearanceChange: (clearance: DocumentClearanceFilterOption) => void;
  clearanceCounts?: Record<DocumentClearanceFilterOption, number>;
  disabled?: boolean;
}

export default function DocumentClearanceFilter({
  selectedClearance,
  onClearanceChange,
  clearanceCounts,
  disabled = false,
}: DocumentClearanceFilterProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        mt: 1.25,
        mb: 0.5,
        flexWrap: "wrap",
      }}
    >
      {/* Classification Group Label + Pill Selector */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
            fontSize: "0.74rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            mr: 0.5,
          }}
        >
          <SecurityRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
          Clearance:
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            flexWrap: { xs: "nowrap", sm: "wrap" },
            overflowX: { xs: "auto", sm: "visible" },
            pb: { xs: 0.5, sm: 0 },
            maxWidth: "100%",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {CLEARANCE_CONFIGS.map((cfg) => {
            const isSelected = selectedClearance === cfg.value;
            const count = clearanceCounts ? clearanceCounts[cfg.value] : undefined;

            return (
              <Tooltip
                key={cfg.value}
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      {cfg.label} Classification
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                      {cfg.description}
                    </Typography>
                    {count !== undefined && (
                      <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color, display: "block", mt: 0.5 }}>
                        {count} matching {count === 1 ? "record" : "records"}
                      </Typography>
                    )}
                  </Box>
                }
                arrow
              >
                <span>
                  <ButtonBase
                    disabled={disabled}
                    onClick={() => onClearanceChange(cfg.value)}
                    sx={{
                      borderRadius: 2,
                      px: 1.25,
                      py: 0.5,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      fontSize: "0.78rem",
                      fontWeight: isSelected ? 700 : 600,
                      transition: "all 0.15s ease",
                      border: "1px solid",
                      cursor: "pointer",
                      ...(isSelected
                        ? {
                            bgcolor: isDarkMode ? alpha(cfg.color, 0.25) : alpha(cfg.color, 0.12),
                            borderColor: cfg.color,
                            color: isDarkMode ? "#FFFFFF" : cfg.color,
                            boxShadow: `0 1px 6px ${alpha(cfg.color, 0.25)}`,
                          }
                        : {
                            bgcolor: isDarkMode ? "background.paper" : "background.paper",
                            borderColor: "divider",
                            color: "text.secondary",
                            "&:hover": {
                              bgcolor: isDarkMode ? alpha(cfg.color, 0.15) : alpha(cfg.color, 0.06),
                              borderColor: alpha(cfg.color, 0.4),
                              color: isDarkMode ? "#FFFFFF" : cfg.color,
                            },
                          }),
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: isSelected ? cfg.color : "text.secondary",
                      }}
                    >
                      {cfg.icon}
                    </Box>

                    <span>{cfg.shortLabel}</span>

                    {count !== undefined && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          px: 0.6,
                          py: 0.1,
                          borderRadius: 1,
                          bgcolor: isSelected
                            ? isDarkMode
                              ? alpha("#FFFFFF", 0.15)
                              : alpha(cfg.color, 0.2)
                            : isDarkMode
                            ? alpha(theme.palette.text.primary, 0.08)
                            : alpha(theme.palette.text.primary, 0.06),
                          color: isSelected ? (isDarkMode ? "#FFFFFF" : cfg.color) : "text.secondary",
                        }}
                      >
                        {count}
                      </Box>
                    )}
                  </ButtonBase>
                </span>
              </Tooltip>
            );
          })}
        </Stack>
      </Stack>

      {/* Quick Reset indicator if a specific clearance is active */}
      {selectedClearance !== "All" && (
        <Tooltip title="Reset clearance filter to All">
          <Chip
            size="small"
            icon={<CloseRoundedIcon sx={{ fontSize: 14 }} />}
            label={`Clearance: ${selectedClearance}`}
            onDelete={() => onClearanceChange("All")}
            onClick={() => onClearanceChange("All")}
            sx={{
              height: 24,
              fontSize: "0.72rem",
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                fontSize: 14,
                "&:hover": {
                  color: "primary.dark",
                },
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
