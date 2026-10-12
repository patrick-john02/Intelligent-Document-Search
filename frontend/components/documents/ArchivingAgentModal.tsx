"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CircularProgress from "@mui/material/CircularProgress";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { QueuedFile } from "./useArchivingTask";

interface ArchivingAgentModalProps {
  open: boolean;
  progress: number;
  stepIndex: number;
  currentStep: string;
  steps: string[];
  queuedFiles: QueuedFile[];
  isFinished: boolean;
  onMinimize: () => void;
  onDismiss: () => void;
}

export default function ArchivingAgentModal({
  open,
  progress,
  stepIndex,
  currentStep,
  steps,
  queuedFiles,
  isFinished,
  onMinimize,
  onDismiss,
}: ArchivingAgentModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onMinimize}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            p: 1,
            position: "relative",
            overflow: "hidden",
            border: "1px solid",
            borderColor: isFinished ? "success.main" : "divider",
          },
        },
      }}
    >
      {/* Laser Gradient Accent Bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isFinished
            ? "linear-gradient(90deg, #10B981, #059669)"
            : "linear-gradient(90deg, #2563EB, #7C3AED, #06B6D4)",
        }}
      />

      <DialogTitle sx={{ pb: 1, pt: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: isFinished ? "success.light" : "primary.main",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.25)",
            }}
          >
            {isFinished ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 24, color: "#FFFFFF" }} />
            ) : (
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 22 }} />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {isFinished ? "Archiving Complete" : "Archiving Agent Pipeline Active"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isFinished
                ? "All files cataloged and physical coordinates assigned"
                : "Autonomous OCR extraction & ML title discovery"}
            </Typography>
          </Box>
        </Stack>

        {/* Minimize Button */}
        <Tooltip title="Minimize to background (continue other work)">
          <IconButton
            size="small"
            onClick={onMinimize}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <RemoveRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2.5}>
          {/* Progress Bar & Percentage */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                {currentStep}
              </Typography>
              <Chip
                label={`${progress}%`}
                size="small"
                color={isFinished ? "success" : "primary"}
                sx={{ height: 20, fontSize: "0.72rem", fontWeight: 800, borderRadius: 1 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "grey.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: isFinished ? "#10B981" : "#2563EB",
                },
              }}
            />
          </Box>

          {/* Stepper Checklist */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "text.secondary",
                display: "block",
                mb: 1.2,
              }}
            >
              Autonomous Agent Execution Stages
            </Typography>

            <Stack spacing={1.2}>
              {steps.map((st, i) => {
                const isStepDone = stepIndex > i || isFinished;
                const isStepActive = stepIndex === i && !isFinished;

                return (
                  <Stack
                    key={st}
                    direction="row"
                    spacing={1.2}
                    sx={{
                      alignItems: "center",
                      opacity: isStepDone || isStepActive ? 1 : 0.45,
                    }}
                  >
                    {isStepDone ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                    ) : isStepActive ? (
                      <CircularProgress size={14} thickness={5} sx={{ color: "primary.main" }} />
                    ) : (
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: "divider",
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: isStepActive ? 700 : 500,
                        color: isStepActive ? "text.primary" : "text.secondary",
                      }}
                    >
                      {st}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>

          {/* Queued Files Progress List */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                mb: 1,
              }}
            >
              Files in Ingestion Batch ({queuedFiles.length})
            </Typography>

            <Stack spacing={1}>
              {queuedFiles.map((qf) => (
                <Paper
                  key={qf.id}
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", overflow: "hidden" }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {qf.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                        {qf.sizeFormatted}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    size="small"
                    label={isFinished ? "Archived" : "Processing"}
                    color={isFinished ? "success" : "info"}
                    variant={isFinished ? "filled" : "outlined"}
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                  />
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: "space-between" }}>
        {!isFinished ? (
          <>
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              Agent runs asynchronously. You can safely minimize.
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={onMinimize}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
              }}
            >
              Minimize & Work in Background
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onDismiss}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              py: 1,
            }}
          >
            Done & View Documents
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
