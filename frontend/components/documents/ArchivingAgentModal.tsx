"use client";

import React, { useState, useEffect } from "react";
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
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";

// Icons
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WavesRoundedIcon from "@mui/icons-material/WavesRounded";

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
  // Live Agent Thoughts Feed based on progress step
  const activeFileName = queuedFiles.length > 0 ? queuedFiles[0].name : "document-scan.pdf";

  const agentThoughtLogs = [
    { agent: "ALON", text: `Ingesting binary stream for ${activeFileName}... Armed Anydoc OCR Engine.`, step: 0 },
    { agent: "ALON", text: `OCR Parsing complete (99.2% clarity). Deriving official document title & series year...`, step: 1 },
    { agent: "BAYANI", text: `Quality verification: 99.4% confidence score — Zero duplicate collisions detected.`, step: 1 },
    { agent: "MUTYA", text: `Assigned archival coordinates & physical barcode register.`, step: 2 },
    { agent: "ALON", text: `Generated 1536-dimensional embeddings. Registered to vector and relational catalogs.`, step: 3 },
  ];

  const visibleLogs = agentThoughtLogs.filter((log) => stepIndex >= log.step);

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
            position: "relative",
            overflow: "hidden",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 36px rgba(0,0,0,0.85)"
                : "0 10px 40px rgba(6, 182, 212, 0.16)",
          },
        },
      }}
    >
      {/* Top Cyan / Emerald Progress Accent Bar */}
      <Box
        sx={{
          height: 3.5,
          background: isFinished
            ? "linear-gradient(90deg, #10B981, #059669)"
            : "linear-gradient(90deg, #06B6D4, #3B82F6, #10B981)",
        }}
      />

      <DialogTitle sx={{ pb: 1, pt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {/* Animated Alon Avatar */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: isFinished ? "#10B981" : "#06B6D4",
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
                width: 9,
                height: 9,
                borderRadius: "50%",
                animation: isFinished ? "none" : "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(6, 182, 212, 0.7)" },
                  "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(6, 182, 212, 0)" },
                  "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(6, 182, 212, 0)" },
                },
              },
            }}
          >
            <Avatar
              src="/alon.png"
              alt="Alon"
              sx={{
                width: 44,
                height: 44,
                border: "2px solid",
                borderColor: isFinished ? "success.main" : "#06B6D4",
                boxShadow: isFinished
                  ? "0 2px 10px rgba(16, 185, 129, 0.25)"
                  : "0 2px 10px rgba(6, 182, 212, 0.25)",
              }}
            />
          </Badge>

          <Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: "1rem" }}>
                {isFinished ? "Archiving Complete" : "Alon is Archiving Your Records..."}
              </Typography>
              <Chip
                label={isFinished ? "Archived" : "Agent Active"}
                size="small"
                color={isFinished ? "success" : "info"}
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
              {isFinished
                ? "All files cataloged with physical shelf coordinates and OCR indices"
                : "Autonomous OCR extraction & ML entity classification in progress"}
            </Typography>
          </Box>
        </Stack>

        {/* Minimize Button */}
        <Tooltip title="Minimize to background (continue browsing)">
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
        <Stack spacing={2.25}>
          {/* Progress Bar & Percentage */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                {currentStep}
              </Typography>
              <Chip
                label={`${progress}%`}
                size="small"
                color={isFinished ? "success" : "info"}
                sx={{ height: 20, fontSize: "0.72rem", fontWeight: 800, borderRadius: 1 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 7,
                borderRadius: 4,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: isFinished ? "#10B981" : "#06B6D4",
                },
              }}
            />
          </Box>

          {/* Fluid Ocean Wave Ingestion Visual (Alon Motif) */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(6, 182, 212, 0.05)" : "rgba(6, 182, 212, 0.03)",
              border: "1px solid",
              borderColor: alpha("#06B6D4", 0.3),
              position: "relative",
              overflow: "hidden",
              "@keyframes alonWaveMove": {
                "0%": { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
            }}
          >
            {/* Animated Fluid Ocean Wave Layers */}
            {!isFinished && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 38,
                  overflow: "hidden",
                  pointerEvents: "none",
                  opacity: 0.65,
                }}
              >
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  style={{
                    width: "200%",
                    height: "100%",
                    animation: "alonWaveMove 4s linear infinite",
                  }}
                >
                  <path
                    d="M0,35 C150,85 350,5 500,50 C650,95 900,15 1200,55 L1200,120 L0,120 Z"
                    fill="rgba(6, 182, 212, 0.28)"
                  />
                  <path
                    d="M0,55 C200,105 400,15 600,65 C800,115 1000,25 1200,70 L1200,120 L0,120 Z"
                    fill="rgba(2, 132, 199, 0.35)"
                  />
                </svg>
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ alignItems: "center", position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isFinished ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 26, color: "success.main" }} />
                ) : (
                  <DescriptionOutlinedIcon sx={{ fontSize: 26, color: "#06B6D4" }} />
                )}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, fontSize: "0.88rem" }}>
                  {activeFileName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={isFinished ? "OCR Verified (99.4%)" : "Alon Waveform OCR Active..."}
                    icon={
                      isFinished ? (
                        <VerifiedRoundedIcon sx={{ fontSize: "12px !important", color: "#10B981" }} />
                      ) : (
                        <WavesRoundedIcon sx={{ fontSize: "12px !important", color: "#06B6D4" }} />
                      )
                    }
                    sx={{
                      height: 18,
                      fontSize: "0.64rem",
                      fontWeight: 700,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: isFinished ? "success.main" : alpha("#06B6D4", 0.4),
                      color: isFinished ? "success.main" : "#0284C7",
                    }}
                  />
                  <Chip
                    size="small"
                    label="Assigned to Cabinet A"
                    sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* Live Agent Terminal Thought Stream */}
          <Paper
            elevation={0}
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "#0F172A" : "#1E293B",
              color: "#F8FAFC",
              fontFamily: "monospace",
              maxHeight: 140,
              overflowY: "auto",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1, pb: 0.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <TerminalRoundedIcon sx={{ fontSize: 16, color: "#06B6D4" }} />
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.05em", color: "#94A3B8", fontSize: "0.68rem" }}>
                AGENT EXECUTION THOUGHT LOG
              </Typography>
            </Stack>

            <Stack spacing={0.75}>
              {visibleLogs.map((log, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1, fontSize: "0.72rem", lineHeight: 1.45 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 800,
                      fontSize: "inherit",
                      color:
                        log.agent === "ALON"
                          ? "#38BDF8"
                          : log.agent === "BAYANI"
                          ? "#F87171"
                          : "#34D399",
                      flexShrink: 0,
                    }}
                  >
                    [{log.agent}]
                  </Typography>
                  <Typography component="span" sx={{ fontSize: "inherit", color: "#E2E8F0" }}>
                    {log.text}
                  </Typography>
                </Box>
              ))}
              {!isFinished && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 0.25 }}>
                  <CircularProgress size={10} sx={{ color: "#38BDF8" }} />
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.7rem", fontStyle: "italic" }}>
                    Orchestrating agent pipeline handoff...
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Stepper Checklist */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: "background.paper",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "text.secondary",
                display: "block",
                mb: 1,
                fontSize: "0.7rem",
              }}
            >
              Multi-Agent Ingestion Milestones
            </Typography>

            <Stack spacing={1}>
              {steps.map((st, i) => {
                const isStepDone = stepIndex > i || isFinished;
                const isStepActive = stepIndex === i && !isFinished;

                return (
                  <Stack
                    key={st}
                    direction="row"
                    spacing={1.25}
                    sx={{
                      alignItems: "center",
                      opacity: isStepDone || isStepActive ? 1 : 0.45,
                    }}
                  >
                    {isStepDone ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                    ) : isStepActive ? (
                      <CircularProgress size={14} thickness={5} sx={{ color: "#06B6D4" }} />
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
                        fontSize: "0.8rem",
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
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: "space-between", borderTop: "1px solid", borderColor: "divider" }}>
        {!isFinished ? (
          <>
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.74rem" }}>
              Alon works in background. You can safely minimize.
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={onMinimize}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
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
              background: "linear-gradient(135deg, #10B981, #059669)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669, #047857)",
              },
            }}
          >
            Done & View Cataloged Records
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
