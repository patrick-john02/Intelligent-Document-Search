"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { alpha, keyframes } from "@mui/material/styles";

const pulseAnimation = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
`;

interface ChatThinkingIndicatorProps {
  label?: string;
  onStop?: () => void;
}

export default function ChatThinkingIndicator({
  label = "Searching archives & synthesizing verified response...",
}: ChatThinkingIndicatorProps) {
  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: 2,
        borderRadius: 1.5,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box
            sx={(theme) => ({
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              animation: `${pulseAnimation} 1.8s infinite ease-in-out`,
            })}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "primary.main",
                display: "block",
              }}
            >
              Document Intelligence Engine
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Subtle Progress Bar */}
      <LinearProgress
        sx={(theme) => ({
          height: 3,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          "& .MuiLinearProgress-bar": {
            bgcolor: "primary.main",
            borderRadius: 1.5,
          },
        })}
      />
    </Paper>
  );
}
