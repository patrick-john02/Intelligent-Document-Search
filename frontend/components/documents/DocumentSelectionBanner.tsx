"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { ArchiveDocument } from "./types";
import { getFileTypeBadge } from "./documentsUtils";

interface DocumentSelectionBannerProps {
  selectedDoc: ArchiveDocument;
  showInspector: boolean;
  onToggleInspector: () => void;
  onAskAi: (doc: ArchiveDocument) => void;
  onDeselect: () => void;
}

export default function DocumentSelectionBanner({
  selectedDoc,
  showInspector,
  onToggleInspector,
  onAskAi,
  onDeselect,
}: DocumentSelectionBannerProps) {
  const badge = getFileTypeBadge(selectedDoc.fileType);

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1,
        mb: 1.5,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <CheckCircleRoundedIcon sx={{ color: "primary.main", fontSize: 18, flexShrink: 0 }} />
        <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: "text.primary" }}>
          Selected:{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
            {selectedDoc.orderNo}
          </Box>{" "}
          — {selectedDoc.title}
        </Typography>
        <Chip
          label={selectedDoc.fileType.toUpperCase()}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            fontWeight: 700,
            bgcolor: badge.bgColor,
            color: badge.color,
            borderRadius: 1,
          }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button
          size="small"
          variant={showInspector ? "contained" : "outlined"}
          onClick={onToggleInspector}
          startIcon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
          sx={{
            borderRadius: 1,
            fontSize: "0.76rem",
            textTransform: "none",
            fontWeight: 600,
            py: 0.4,
            boxShadow: "none",
          }}
        >
          {showInspector ? "Inspector Open" : "Inspect Dossier"}
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onAskAi(selectedDoc)}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
          sx={{
            borderRadius: 1,
            fontSize: "0.76rem",
            textTransform: "none",
            fontWeight: 600,
            py: 0.4,
          }}
        >
          Ask Mayumi
        </Button>

        <Tooltip title="Deselect file">
          <IconButton
            size="small"
            onClick={onDeselect}
            sx={{ p: 0.5, color: "text.secondary" }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
