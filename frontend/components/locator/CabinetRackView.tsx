"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";

interface CabinetRackViewProps {
  cabinetName: string;
  selectedShelfLevel: number;
  onSelectShelfLevel: (level: number) => void;
  shelfStats: {
    level: number;
    name: string;
    filesCount: number;
    capacity: number;
    binderRange: string;
  }[];
}

export default function CabinetRackView({
  cabinetName,
  selectedShelfLevel,
  onSelectShelfLevel,
  shelfStats,
}: CabinetRackViewProps) {
  // Sort from Level 4 (Top) down to Level 1 (Bottom) to physically mimic a cabinet
  const sortedTiers = [...shelfStats].sort((a, b) => b.level - a.level);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {cabinetName} • Physical Tier Elevation
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Select a shelf tier to inspect filed binders and check-out custody.
          </Typography>
        </Box>
        <Chip
          label="4 Vertical Shelves"
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
        />
      </Box>

      {/* Visual Cabinet Rack: Tiers stacked top-to-bottom */}
      <Stack spacing={1.25}>
        {sortedTiers.map((tier) => {
          const isSelected = selectedShelfLevel === tier.level;
          const percentUsed = Math.round((tier.filesCount / tier.capacity) * 100);

          return (
            <Paper
              key={tier.level}
              component="button"
              onClick={() => onSelectShelfLevel(tier.level)}
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "left",
                borderRadius: 1,
                bgcolor: isSelected ? "action.selected" : "action.hover",
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                borderLeft: isSelected ? "4px solid" : "1px solid",
                borderLeftColor: isSelected ? "primary.main" : "divider",
                cursor: "pointer",
                transition: "all 0.15s ease",
                width: "100%",
                display: "block",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: isSelected ? "primary.main" : "text.primary" }}>
                  {tier.name} (Tier {tier.level})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  {tier.filesCount} / {tier.capacity} Files ({percentUsed}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentUsed}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  mb: 0.75,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: percentUsed > 90 ? "warning.main" : "primary.main",
                  },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                  Assigned Range: {tier.binderRange}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: isSelected ? "primary.main" : "text.secondary", fontSize: "0.7rem" }}>
                  {isSelected ? "Active Selection" : "Click to view files"}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
