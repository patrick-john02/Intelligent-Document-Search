"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { StaffUploadItem, UploadPipelineStatus } from "./types";

interface UploadTableProps {
  items: StaffUploadItem[];
  selectedId: string | null;
  onSelectItem: (item: StaffUploadItem) => void;
  onRerunPipeline: (id: string) => void;
}

export default function UploadTable({
  items,
  selectedId,
  onSelectItem,
  onRerunPipeline,
}: UploadTableProps) {
  const getStatusChip = (status: UploadPipelineStatus) => {
    switch (status) {
      case "Completed":
        return (
          <Chip
            label="Indexed & Live"
            size="small"
            color="success"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "OCR Processing":
        return (
          <Chip
            label="OCR Extracting"
            size="small"
            color="info"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "Vectorizing":
        return (
          <Chip
            label="Vector Embedding"
            size="small"
            color="secondary"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "Review Required":
        return (
          <Chip
            label="Needs Review"
            size="small"
            color="warning"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Table Header Bar */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "action.hover",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
          Ingested Records ({items.length})
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Click any record to inspect processing pipeline, OCR logs, and physical coordinates.
        </Typography>
      </Box>

      {/* Scrollable Records List */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 1.5 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              p: 5,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
              No upload records found
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Try adjusting your search filters or click "+ Ingest New Document" above to upload.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {items.map((doc) => {
              const isSelected = selectedId === doc.id;
              const isProcessing = doc.status === "OCR Processing" || doc.status === "Vectorizing";

              return (
                <Paper
                  key={doc.id}
                  onClick={() => onSelectItem(doc)}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: isSelected ? "action.selected" : "background.paper",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderLeft: isSelected ? "4px solid" : "1px solid",
                    borderLeftColor: isSelected ? "primary.main" : "divider",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: isSelected ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  {/* Top Row: Title, Directive No, Status */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1.5,
                      flexWrap: "wrap",
                      mb: 0.75,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: "240px" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: isSelected ? "primary.main" : "text.primary",
                          lineHeight: 1.3,
                        }}
                      >
                        {doc.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontWeight: 600, display: "block", mt: 0.25 }}
                      >
                        Order No: {doc.orderNo} ({doc.seriesYear}) • {doc.category} • Clearance: {doc.clearance}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getStatusChip(doc.status)}
                    </Box>
                  </Box>

                  {/* Processing Progress Bar if active */}
                  {isProcessing && (
                    <Box sx={{ my: 1 }}>
                      <LinearProgress
                        variant="indeterminate"
                        sx={{
                          height: 4,
                          borderRadius: 1,
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.08)",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "0.68rem", mt: 0.5, display: "block" }}
                      >
                        {doc.status === "OCR Processing"
                          ? "Executing multi-page optical character recognition..."
                          : "Extracting semantic chunk embeddings into pgvector..."}
                      </Typography>
                    </Box>
                  )}

                  {/* Middle Row: Ingestion Metadata & Coordinates */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      File: {doc.fileName} ({doc.fileSize}, {doc.pageCount} pgs)
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">
                      Uploaded: {doc.uploadedAt}
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                      }}
                    >
                      Version: {doc.version || "v1.0"}
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: doc.shelfLocation.tagged ? 600 : 700,
                        color: doc.shelfLocation.tagged ? "text.primary" : "warning.main",
                      }}
                    >
                      Shelf: {doc.shelfLocation.tagged
                        ? `${doc.shelfLocation.cabinet} • ${doc.shelfLocation.shelf} (${doc.shelfLocation.binder})`
                        : "Untagged Physical Shelf"}
                    </Typography>
                  </Box>

                  {/* Bottom Row Actions for selected or specific items */}
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                      Barcode: {doc.shelfLocation.barcode || "N/A"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {doc.status === "Review Required" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRerunPipeline(doc.id);
                          }}
                          sx={{
                            fontSize: "0.7rem",
                            py: "2px",
                            px: "8px",
                            borderRadius: 1,
                            textTransform: "none",
                            fontWeight: 700,
                          }}
                        >
                          Re-run OCR
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(doc);
                        }}
                        sx={{
                          fontSize: "0.7rem",
                          py: "2px",
                          px: "8px",
                          borderRadius: 1,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Inspect Pipeline
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
