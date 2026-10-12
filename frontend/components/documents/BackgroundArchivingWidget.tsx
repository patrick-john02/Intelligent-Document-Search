"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { QueuedFile } from "./useArchivingTask";

interface BackgroundArchivingWidgetProps {
  progress: number;
  currentStep: string;
  queuedFiles: QueuedFile[];
  isFinished: boolean;
  onMaximize: () => void;
  onDismiss: () => void;
}

export default function BackgroundArchivingWidget({
  progress,
  currentStep,
  queuedFiles,
  isFinished,
  onMaximize,
  onDismiss,
}: BackgroundArchivingWidgetProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1300,
        p: 1.8,
        borderRadius: 2.5,
        width: 320,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: isFinished ? "success.main" : "primary.main",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        transition: "all 0.25s ease-in-out",
        animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "@keyframes slideInUp": {
          "0%": { transform: "translateY(40px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
          {isFinished ? (
            <CheckCircleRoundedIcon sx={{ color: "#10B981", fontSize: 20 }} />
          ) : (
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={22}
                thickness={5}
                sx={{ color: "primary.main" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 10, color: "primary.main" }} />
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.84rem", lineHeight: 1.2 }}>
              {isFinished ? "Archiving Complete" : "Archiving Agent Running"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
              {isFinished
                ? `${queuedFiles.length} record(s) indexed & filed`
                : `${queuedFiles.length} file(s) in background (${progress}%)`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Tooltip title="Expand Agent Inspector">
            <IconButton
              size="small"
              onClick={onMaximize}
              sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "text.primary" } }}
            >
              <OpenInFullRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {isFinished && (
            <Tooltip title="Dismiss">
              <IconButton
                size="small"
                onClick={onDismiss}
                sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "text.primary" } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Current Step preview */}
      <Box
        onClick={onMaximize}
        sx={{
          bgcolor: "action.hover",
          borderRadius: 1.5,
          p: 1,
          cursor: "pointer",
          border: "1px dashed",
          borderColor: "divider",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "text.secondary",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {isFinished ? "✓ Click to view newly cataloged documents" : `⚡ ${currentStep}`}
        </Typography>
      </Box>
    </Paper>
  );
}
