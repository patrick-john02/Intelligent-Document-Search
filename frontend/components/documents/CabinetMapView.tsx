"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { ArchiveDocument } from "./types";

interface CabinetMapViewProps {
  documents: ArchiveDocument[];
  selectedDocId?: string | number | null;
  onSelectDoc: (doc: ArchiveDocument) => void;
}

const CABINET_LIST = ["Cabinet A", "Cabinet B", "Cabinet C", "Cabinet D"];

export default function CabinetMapView({
  documents,
  selectedDocId,
  onSelectDoc,
}: CabinetMapViewProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
        width: "100%",
        overflowY: "auto",
        pr: 0.5,
      }}
    >
      {CABINET_LIST.map((cabinetName) => {
        const cabinetDocs = documents.filter((d) => d.cabinet === cabinetName);

        return (
          <Paper
            key={cabinetName}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: "background.paper",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Cabinet Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {cabinetName}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Physical Storage Unit • 4 Shelf Levels
                </Typography>
              </Box>

              <Chip
                label={`${cabinetDocs.length} Documents Filed`}
                size="small"
                color={cabinetDocs.length > 0 ? "primary" : "default"}
                variant={cabinetDocs.length > 0 ? "filled" : "outlined"}
                sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Cabinet Shelves & Folders */}
            <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
              {cabinetDocs.length > 0 ? (
                cabinetDocs.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <Paper
                      key={doc.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: isSelected ? "action.selected" : "action.hover",
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderLeft: isSelected ? "3px solid" : "1px solid",
                        borderLeftColor: isSelected ? "primary.main" : "divider",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}>
                          {doc.title}
                        </Typography>
                        <Chip
                          label={doc.clearance}
                          size="small"
                          color={doc.clearance === "Public" ? "success" : "info"}
                          sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
                        />
                      </Box>

                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 1 }}>
                        Order: {doc.orderNo} ({doc.seriesYear}) • {doc.category}
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                          Location: {doc.shelf} • {doc.folder}
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onSelectDoc(doc)}
                          sx={{
                            fontSize: "0.72rem",
                            py: "2px",
                            px: "8px",
                            borderRadius: 1,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Inspect Dossier
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    my: "auto",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    No documents currently filed in {cabinetName}.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
