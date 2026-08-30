"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

// Multi-Agent Pipeline steps
const AGENT_PIPELINE = [
  { name: "OCR Agent", status: "Active", latency: "38ms", model: "PyMuPDF / Tesseract" },
  { name: "Deduplication Agent", status: "Active", latency: "12ms", model: "SHA-256 Checksum" },
  { name: "Classifier Agent", status: "Active", latency: "85ms", model: "Gemini 1.5 Pro" },
  { name: "Vector Embedding Agent", status: "Active", latency: "64ms", model: "text-embedding-004" },
  { name: "Synthesis & QA Agent", status: "Active", latency: "420ms", model: "LangGraph Multi-Agent" },
];

export default function DeveloperDashboard() {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. ML Evaluation Benchmark Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  RETRIEVAL PRECISION@K
                </Typography>
                <PrecisionManufacturingOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>94.8%</Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                MRR Score: 0.91 (Top-1 Match)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  AVERAGE LATENCY
                </Typography>
                <SpeedOutlinedIcon fontSize="small" sx={{ color: "info.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>142ms</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Vector retrieval response
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  PGVECTOR CHUNKS
                </Typography>
                <StorageOutlinedIcon fontSize="small" sx={{ color: "warning.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>48,250</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                768-dim embeddings indexed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  TASK COMPLETION
                </Typography>
                <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ color: "success.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>98.5%</Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                Zero agent deadlocks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. LangGraph Multi-Agent Pipeline Monitor */}
      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TerminalOutlinedIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                LangGraph Multi-Agent Pipeline Status
              </Typography>
            </Box>
            <Button size="small" variant="contained" startIcon={<PlayArrowRoundedIcon />} sx={{ textTransform: "none", borderRadius: 1.5 }}>
              Run Benchmark Evaluation
            </Button>
          </Box>

          <Grid container spacing={2}>
            {AGENT_PIPELINE.map((agent, index) => (
              <Grid key={agent.name} size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    NODE 0{index + 1}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, my: 0.5 }}>
                    {agent.name}
                  </Typography>
                  <Chip size="small" label={agent.status} color="success" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, mb: 1 }} />
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                    Latency: <strong>{agent.latency}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.68rem" }}>
                    {agent.model}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
