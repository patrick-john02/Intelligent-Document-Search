"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Link from "next/link";
import { StaffUploadItem } from "./types";

interface UploadDetailsInspectorProps {
  item: StaffUploadItem | null;
  onClose: () => void;
  onUploadNewVersion: (item: StaffUploadItem) => void;
  onAssignShelf: (id: string) => void;
}

export default function UploadDetailsInspector({
  item,
  onClose,
  onUploadNewVersion,
  onAssignShelf,
}: UploadDetailsInspectorProps) {
  if (!item) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
          No Document Selected
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 260 }}>
          Select a document from the list to view its details, version history, and physical storage coordinates.
        </Typography>
      </Paper>
    );
  }

  const milestones = [
    {
      name: "File Received",
      status: "completed",
      detail: "Scanned document received and verified.",
    },
    {
      name: "Text Extraction",
      status: item.status === "Processing" ? "processing" : "completed",
      detail: item.status === "Processing" ? "Verifying document text..." : "Document text verified.",
    },
    {
      name: "Search Index",
      status: item.status === "Processing" ? "pending" : "completed",
      detail: item.status === "Processing" ? "Queued for indexing." : "Ready in Smart Search.",
    },
    {
      name: "Physical Storage Assigned",
      status: "completed",
      detail: `${item.shelfLocation.cabinet} • ${item.shelfLocation.shelf} (${item.shelfLocation.binder})`,
    },
  ];

  const versionList = item.versionHistory && item.versionHistory.length > 0
    ? item.versionHistory
    : [
        {
          version: item.version || "v1.0",
          date: item.uploadedAt,
          fileName: item.fileName,
          uploadedBy: "Staff Officer",
          notes: "Initial upload",
        },
      ];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          bgcolor: "action.hover",
        }}
      >
        <Box sx={{ flex: 1, pr: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
            Document Details
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3, mt: 0.25 }}>
            {item.orderNo}
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onClose}
          sx={{ minWidth: "auto", px: 1, py: 0.25, fontSize: "0.72rem", textTransform: "none" }}
        >
          Close
        </Button>
      </Box>

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {/* Document Title & Category */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>
            Directive Title
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.35 }}>
            {item.title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip
            label={item.category}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1 }}
          />
          <Chip
            label={item.version || "v1.0"}
            size="small"
            color="primary"
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 800, borderRadius: 1 }}
          />
          <Chip
            label={`Clearance: ${item.clearance}`}
            size="small"
            sx={{ height: 22, fontSize: "0.68rem", fontWeight: 600, borderRadius: 1 }}
          />
          <Chip
            label={`Series ${item.seriesYear}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.68rem", fontWeight: 600, borderRadius: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Version History Section */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
              Version History
            </Typography>
            <Chip
              label={`Current: ${item.version || "v1.0"}`}
              size="small"
              sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
            />
          </Box>

          <Stack spacing={0.75}>
            {versionList.map((ver, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: idx === 0 ? "action.selected" : "background.paper",
                  borderColor: idx === 0 ? "primary.main" : "divider",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.primary" }}>
                    Version {ver.version}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                    {ver.date}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                  {ver.notes || "Document upload"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem", mt: 0.25 }}>
                  File: {ver.fileName}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Status Verification Checklist */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>
          Document Verification
        </Typography>

        <Stack spacing={1} sx={{ mb: 2.5 }}>
          {milestones.map((m, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 1.25,
                borderRadius: 1,
                bgcolor: "background.paper",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                  {m.name}
                </Typography>
                <Chip
                  label={m.status === "completed" ? "Done" : m.status === "processing" ? "In Progress" : "Pending"}
                  size="small"
                  color={m.status === "completed" ? "success" : m.status === "processing" ? "info" : "default"}
                  sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem", mt: 0.25 }}>
                {m.detail}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Physical Storage Coordinates */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>
          Physical Storage Location
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.68rem" }}>
                Cabinet
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.cabinet || "Cabinet A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.68rem" }}>
                Shelf
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.shelf || "Shelf 1"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.68rem" }}>
                Binder
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {item.shelfLocation.binder || "Binder 01"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.68rem" }}>
                Barcode ID
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
                {item.shelfLocation.barcode || "TAGGED"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
            <Button
              component={Link}
              href="/locator"
              size="small"
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: 1,
                fontSize: "0.72rem",
                textTransform: "none",
                fontWeight: 600,
                py: "2px",
              }}
            >
              Open Shelf Locator
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onAssignShelf(item.id)}
              fullWidth
              sx={{
                borderRadius: 1,
                fontSize: "0.72rem",
                textTransform: "none",
                fontWeight: 600,
                py: "2px",
              }}
            >
              Edit Location
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Document Summary */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>
          Document Summary
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "background.paper",
            borderColor: "divider",
            mb: 2.5,
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.primary", lineHeight: 1.5 }}>
            {item.extractedSummary}
          </Typography>
        </Paper>

        {/* Actions Strip: Upload New Version & Open in Archive */}
        <Stack spacing={1}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="small"
            onClick={() => onUploadNewVersion(item)}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              py: 0.75,
            }}
          >
            Upload New Version
          </Button>

          <Button
            component={Link}
            href="/documents"
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              py: 0.75,
            }}
          >
            View in Document Archive
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
