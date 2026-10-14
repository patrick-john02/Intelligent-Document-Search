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
import WavesRoundedIcon from "@mui/icons-material/WavesRounded";
import Avatar from "@mui/material/Avatar";
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
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <Avatar
              src="/alon.png"
              alt="Alon"
              sx={{
                width: 32,
                height: 32,
                border: "2px solid",
                borderColor: isFinished ? "#10B981" : "#06B6D4",
              }}
            />
            {!isFinished && (
              <CircularProgress
                variant="determinate"
                value={progress}
                size={38}
                thickness={3.5}
                sx={{
                  color: "#06B6D4",
                  position: "absolute",
                  top: -3,
                  left: -3,
                  zIndex: 1,
                }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.84rem", lineHeight: 1.2 }}>
              {isFinished ? "Archiving Complete" : "Alon: Archiving Records"}
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
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          {isFinished ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "success.main", flexShrink: 0 }} />
          ) : (
            <WavesRoundedIcon sx={{ fontSize: 13, color: "#06B6D4", flexShrink: 0 }} />
          )}
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
            {isFinished ? "Click to view newly cataloged documents" : currentStep}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}
