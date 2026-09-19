"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import { StaffUploadItem } from "./types";
import { CategoryMeta } from "./TeamsCategoryGrid";
import UploadDetailsInspector from "./UploadDetailsInspector";

interface CategoryDetailViewProps {
  category: CategoryMeta;
  items: StaffUploadItem[];
  selectedDocId: string | null;
  onSelectDoc: (doc: StaffUploadItem) => void;
  onBackToGrid: () => void;
  onOpenUploadModal: () => void;
  onUploadNewVersion: (doc: StaffUploadItem) => void;
}

export default function CategoryDetailView({
  category,
  items,
  selectedDocId,
  onSelectDoc,
  onBackToGrid,
  onOpenUploadModal,
  onUploadNewVersion,
}: CategoryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const selectedItem =
    items.find((d) => d.id === selectedDocId) || (items.length > 0 ? items[0] : null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Category Header (Teams Style Channel Header) */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          mb: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onBackToGrid}
              sx={{
                borderRadius: 1,
                fontSize: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                px: 1.5,
              }}
            >
              ← Back to Categories
            </Button>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: "center" }} />

            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1,
                bgcolor: category.badgeBg,
                color: category.badgeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                border: "1px solid",
                borderColor: category.badgeColor,
              }}
            >
              {category.code}
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {category.name}
                </Typography>
                <Chip
                  label={`${items.length} Documents`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                {category.division}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onOpenUploadModal}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                fontSize: "0.78rem",
                px: 2,
              }}
            >
              + Upload
            </Button>
          </Box>
        </Box>

        {/* Navigation Tabs (Without AI pipeline logs) */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            mt: 1,
            minHeight: 32,
            "& .MuiTab-root": {
              minHeight: 32,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              py: 0.5,
              px: 1.5,
              borderRadius: 1,
            },
          }}
        >
          <Tab label={`Documents (${items.length})`} />
          <Tab label="Storage Locations" />
        </Tabs>
      </Paper>

      {/* Main Channel Content Split Pane: Files List (Left) + Inspector (Right) */}
      <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left Column: Documents List */}
        <Box sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 1,
              bgcolor: "background.paper",
              borderColor: "divider",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* List Header */}
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Document Title & Issuance
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                Location & Status
              </Typography>
            </Box>

            {/* List Rows */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
              {activeTab === 0 ? (
                items.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
                      No documents in {category.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Click "+ Upload" above to add a document to this category.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {items.map((doc) => {
                      const isSelected = selectedItem?.id === doc.id;
                      const isProcessing = doc.status === "Processing" || doc.status === "OCR Processing";

                      return (
                        <Paper
                          key={doc.id}
                          onClick={() => onSelectDoc(doc)}
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
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
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
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25, flexWrap: "wrap" }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                  {doc.orderNo} ({doc.seriesYear})
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>•</Typography>
                                <Chip
                                  label={doc.version || "v1.0"}
                                  size="small"
                                  sx={{ height: 16, fontSize: "0.62rem", fontWeight: 700, borderRadius: 1 }}
                                />
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>•</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  {doc.clearance}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                              <Chip
                                label={
                                  doc.status === "Completed" || doc.status === "Published"
                                    ? "Published"
                                    : doc.status === "Review Required" || doc.status === "Needs Review"
                                    ? "Needs Review"
                                    : "Processing"
                                }
                                size="small"
                                color={
                                  doc.status === "Completed" || doc.status === "Published"
                                    ? "success"
                                    : doc.status === "Review Required" || doc.status === "Needs Review"
                                    ? "warning"
                                    : "info"
                                }
                                sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 1 }}
                              />
                              <Typography variant="caption" sx={{ fontSize: "0.68rem", fontWeight: 600, color: "text.secondary" }}>
                                {doc.shelfLocation.cabinet} • {doc.shelfLocation.shelf}
                              </Typography>
                            </Box>
                          </Box>

                          {isProcessing && (
                            <Box sx={{ mt: 1 }}>
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
                        </Paper>
                      );
                    })}
                  </Stack>
                )
              ) : (
                /* Tab 1: Storage Locations */
                <Stack spacing={1.5}>
                  {items.map((doc) => (
                    <Paper
                      key={doc.id}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 1, bgcolor: "action.hover", borderColor: "divider" }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", mb: 0.5 }}>
                        {doc.orderNo} — {doc.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", color: "text.secondary", fontSize: "0.75rem" }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Cabinet: {doc.shelfLocation.cabinet}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Shelf: {doc.shelfLocation.shelf}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Binder: {doc.shelfLocation.binder}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main", fontWeight: 700 }}>
                          ID: {doc.shelfLocation.barcode}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Column: Document Details Inspector with Versioning */}
        <Box sx={{ width: { xs: "100%", md: "380px", lg: "420px" }, flexShrink: 0, height: "100%" }}>
          <UploadDetailsInspector
            item={selectedItem}
            onClose={() => {}}
            onUploadNewVersion={onUploadNewVersion}
            onAssignShelf={() => {}}
          />
        </Box>
      </Box>
    </Box>
  );
}
