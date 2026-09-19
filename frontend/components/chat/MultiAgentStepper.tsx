"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

export interface PipelineStep {
  name: string;
  status: "completed" | "processing" | "queued";
  timeOrCount?: string;
}

interface MultiAgentStepperProps {
  steps?: PipelineStep[];
}

const DEFAULT_STEPS: PipelineStep[] = [
  { name: "1. Vector Retrieval", status: "completed", timeOrCount: "3 Chunks (38ms)" },
  { name: "2. Security Clearance", status: "completed", timeOrCount: "Verified Public" },
  { name: "3. Deduplication Check", status: "completed", timeOrCount: "0 Conflicts" },
  { name: "4. Multi-Agent Synthesis", status: "completed", timeOrCount: "Final Brief" },
];

export default function MultiAgentStepper({ steps = DEFAULT_STEPS }: MultiAgentStepperProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: "action.hover",
        borderColor: "divider",
        mb: 2,
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>
          Multi-Agent Processing Pipeline
        </Typography>
        <Chip
          label="LangGraph Engine"
          size="small"
          variant="outlined"
          color="primary"
          sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
        />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                minWidth: { xs: "100%", sm: "140px" },
                p: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: isDone ? "divider" : "transparent",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, display: "block", color: "text.primary", fontSize: "0.75rem" }}>
                {step.name}
              </Typography>
              <Typography variant="caption" sx={{ color: isDone ? "success.main" : "text.secondary", fontSize: "0.7rem", fontWeight: 600 }}>
                {step.timeOrCount}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
