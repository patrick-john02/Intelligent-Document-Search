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

interface CategoryDefinition {
  name: string;
  code: string;
  description: string;
}

const SYSTEM_CATEGORIES: CategoryDefinition[] = [
  {
    name: "Assessment Regulations",
    code: "ASMT",
    description: "Property valuations, schedule of market values, and assessment directives.",
  },
  {
    name: "Treasury Advisories",
    code: "TRSY",
    description: "Revenue collections, electronic receipting, and treasury circulars.",
  },
  {
    name: "Legal Opinions",
    code: "LEGL",
    description: "Statutory interpretations, tax exemptions, and counsel rulings.",
  },
  {
    name: "Memorandums & Audits",
    code: "MEMO",
    description: "Regional office memorandums, financial audits, and special issuances.",
  },
  {
    name: "Standard Procedures",
    code: "SOP",
    description: "Standard operating procedures, scanning guides, and custody protocols.",
  },
];

interface CategoryBoxesViewProps {
  items: StaffUploadItem[];
  selectedId: string | null;
  onSelectItem: (item: StaffUploadItem) => void;
  onRerunPipeline: (id: string) => void;
  selectedCategoryFilter?: string;
}

export default function CategoryBoxesView({
  items,
  selectedId,
  onSelectItem,
  onRerunPipeline,
  selectedCategoryFilter = "All",
}: CategoryBoxesViewProps) {
  const getStatusChip = (status: UploadPipelineStatus) => {
    switch (status) {
      case "Completed":
        return (
          <Chip
            label="Indexed & Live"
            size="small"
            color="success"
            sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "OCR Processing":
        return (
          <Chip
            label="AI Extracting"
            size="small"
            color="info"
            sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "Vectorizing":
        return (
          <Chip
            label="Vector Embedding"
            size="small"
            color="secondary"
            sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      case "Review Required":
        return (
          <Chip
            label="Needs Review"
            size="small"
            color="warning"
            sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
          />
        );
    }
  };

  // Group items by category
  const categoriesToDisplay =
    selectedCategoryFilter === "All"
      ? SYSTEM_CATEGORIES
      : SYSTEM_CATEGORIES.filter((c) => c.name === selectedCategoryFilter);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(2, 1fr)",
        },
        gap: 2,
        width: "100%",
        height: "100%",
        overflowY: "auto",
        pr: 0.5,
      }}
    >
      {categoriesToDisplay.map((cat) => {
        const catDocs = items.filter((item) => item.category === cat.name);
        const liveCount = catDocs.filter((d) => d.status === "Completed").length;

        return (
          <Paper
            key={cat.name}
            variant="outlined"
            sx={{
              borderRadius: 1,
              bgcolor: "background.paper",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              p: 2,
              minHeight: 280,
            }}
          >
            {/* Category Box Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1.5,
                pb: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ flex: 1, pr: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                    {cat.name}
                  </Typography>
                  <Chip
                    label={cat.code}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem" }}>
                  {cat.description}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                <Chip
                  label={`${catDocs.length} ${catDocs.length === 1 ? "Record" : "Records"}`}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
                  {liveCount} Live in Search
                </Typography>
              </Box>
            </Box>

            {/* Category Box Document Cards */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {catDocs.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    No documents currently classified under {cat.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", mt: 0.5 }}>
                    Uploaded scans matching this classification will automatically appear here.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {catDocs.map((doc) => {
                    const isSelected = selectedId === doc.id;
                    const isProcessing = doc.status === "OCR Processing" || doc.status === "Vectorizing";

                    return (
                      <Paper
                        key={doc.id}
                        onClick={() => onSelectItem(doc)}
                        variant="outlined"
                        sx={{
                          p: 1.25,
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
                        {/* Title & Status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: isSelected ? "primary.main" : "text.primary",
                                lineHeight: 1.25,
                              }}
                            >
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mt: 0.25 }}>
                              Auto-Extracted Order: {doc.orderNo} ({doc.seriesYear}) • {doc.clearance}
                            </Typography>
                          </Box>
                          <Box>{getStatusChip(doc.status)}</Box>
                        </Box>

                        {/* Processing Bar if in progress */}
                        {isProcessing && (
                          <Box sx={{ my: 0.75 }}>
                            <LinearProgress
                              variant="indeterminate"
                              sx={{
                                height: 3,
                                borderRadius: 1,
                                bgcolor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.08)",
                              }}
                            />
                          </Box>
                        )}

                        {/* Coordinates & AI Info */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 0.75,
                            pt: 0.75,
                            borderTop: "1px dashed",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.72rem" }}>
                            Shelf: {doc.shelfLocation.cabinet} • {doc.shelfLocation.shelf} ({doc.shelfLocation.binder})
                          </Typography>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {doc.version && (
                              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.7rem" }}>
                                {doc.version}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                              {doc.fileSize}
                            </Typography>
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
      })}
    </Box>
  );
}
