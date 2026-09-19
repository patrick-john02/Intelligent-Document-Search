"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

export interface InvestigationSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  taskMode: "inquiry" | "compare" | "audit";
  documentsCount: number;
}

interface DossierSidebarProps {
  sessions: InvestigationSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewInvestigation: () => void;
  activeTaskMode: "inquiry" | "compare" | "audit";
  onSelectTaskMode: (mode: "inquiry" | "compare" | "audit") => void;
}

export default function DossierSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewInvestigation,
  activeTaskMode,
  onSelectTaskMode,
}: DossierSidebarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "100%", md: "260px" },
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {/* 1. New Investigation Action */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onNewInvestigation}
        sx={{
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 700,
          py: 0.9,
          mb: 2,
          boxShadow: "none",
          fontSize: "0.82rem",
        }}
      >
        + New Archival Inquiry
      </Button>

      {/* 2. Analytical Task Modes */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
            display: "block",
            mb: 1,
          }}
        >
          Investigation Modes
        </Typography>

        <Stack spacing={0.75}>
          {[
            { mode: "inquiry" as const, label: "Policy Inquiry", desc: "Retrieve verified excerpts & rules" },
            { mode: "compare" as const, label: "Comparative Analysis", desc: "Compare two directives for changes" },
            { mode: "audit" as const, label: "Compliance Audit", desc: "Detect superseded or conflicting circulars" },
          ].map((item) => {
            const isSelected = activeTaskMode === item.mode;
            return (
              <Box
                key={item.mode}
                component="button"
                onClick={() => onSelectTaskMode(item.mode)}
                sx={{
                  p: 1.25,
                  textAlign: "left",
                  bgcolor: isSelected ? "action.selected" : "transparent",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? "primary.main" : "text.primary",
                    fontSize: "0.8rem",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.68rem", display: "block" }}
                >
                  {item.desc}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 3. Investigation Dossier Threads */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
            }}
          >
            Recent Dossiers
          </Typography>
          <Chip
            label={sessions.length}
            size="small"
            sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
          />
        </Box>

        <Stack spacing={0.75} sx={{ overflowY: "auto", pr: 0.5 }}>
          {sessions.map((sess) => {
            const isSelected = sess.id === activeSessionId;
            return (
              <Box
                key={sess.id}
                component="button"
                onClick={() => onSelectSession(sess.id)}
                sx={{
                  p: 1.25,
                  textAlign: "left",
                  bgcolor: isSelected ? "action.selected" : "transparent",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? "primary.main" : "text.primary",
                    fontSize: "0.78rem",
                    lineHeight: 1.3,
                  }}
                >
                  {sess.title}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                    {sess.date}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 600 }}>
                    {sess.documentsCount} Docs
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
