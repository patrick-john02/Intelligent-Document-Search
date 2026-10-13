"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Link from "next/link";

import { SearchResultItem } from "./types";
import Highlighter from "./Highlighter";

interface DocumentPreviewDialogProps {
  open: boolean;
  item: SearchResultItem | null;
  searchQuery?: string;
  onClose: () => void;
  onAskAi?: (item: SearchResultItem) => void;
}

export default function DocumentPreviewDialog({
  open,
  item,
  searchQuery,
  onClose,
  onAskAi,
}: DocumentPreviewDialogProps) {
  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pb: 1,
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700 }}>
            {item.category} • {item.orderNo}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.3 }}>
            <Highlighter text={item.title} query={searchQuery} />
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ mt: 0.5 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5 }}>
        {/* Document Overview Metadata */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            flexWrap: "wrap",
            gap: 1.5,
            mb: 3,
            p: 1.75,
            bgcolor: "action.hover",
            borderRadius: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Series Year
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.seriesYear}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Location
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.shelfLocation}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Access Clearance
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.clearance}
            </Typography>
          </Box>

          {item.pageCount && (
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Pages
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.pageCount} pages ({item.fileSize || "PDF"})
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Summary */}
        {item.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
              Summary
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
              {item.summary}
            </Typography>
          </Box>
        )}

        {/* Excerpt Snippet with Highlights */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
            Relevant Passage
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              borderLeft: "4px solid",
              borderColor: "primary.main",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.7, fontStyle: "italic" }}>
              "<Highlighter text={item.excerptSnippet} query={searchQuery} />"
            </Typography>
          </Box>
        </Box>

        {/* Topic Tags */}
        {item.tags && item.tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            {item.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: "space-between" }}>
        <Button
          onClick={() => {
            onClose();
            onAskAi?.(item);
          }}
          startIcon={<AutoAwesomeRoundedIcon />}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 1, textTransform: "none" }}
        >
          Ask AI About Document
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            onClick={onClose}
            size="small"
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Close
          </Button>
          <Button
            component={Link}
            href="/documents"
            startIcon={<PictureAsPdfRoundedIcon />}
            variant="contained"
            size="small"
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Open Document
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
