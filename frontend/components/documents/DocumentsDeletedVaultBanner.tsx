"use client";

import React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";

interface DocumentsDeletedVaultBannerProps {
  totalDeletedCount: number;
  onExitDeletedMode: () => void;
}

export default function DocumentsDeletedVaultBanner({
  totalDeletedCount,
  onExitDeletedMode,
}: DocumentsDeletedVaultBannerProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        px: 2,
        mt: 1,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
        borderColor: alpha("#F59E0B", 0.4),
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <DeleteSweepRoundedIcon sx={{ color: "#D97706", fontSize: 20 }} />
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, fontSize: "0.86rem", color: "warning.dark", lineHeight: 1.2 }}
          >
            Viewing Soft-Deleted Records Vault ({totalDeletedCount} quarantined items)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
            Displaying municipal records where is_deleted = True. Governed by Mutya (Retention Agent) and Bayani (Audit).
          </Typography>
        </Box>
      </Stack>

      <Button
        size="small"
        variant="outlined"
        color="warning"
        onClick={onExitDeletedMode}
        sx={{
          borderRadius: 1.5,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.76rem",
          height: 28,
        }}
      >
        Return to Active Archive
      </Button>
    </Paper>
  );
}
