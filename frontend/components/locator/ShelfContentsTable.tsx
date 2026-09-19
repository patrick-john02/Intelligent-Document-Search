"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { PhysicalDocumentItem } from "./types";

interface ShelfContentsTableProps {
  shelfName: string;
  cabinetName: string;
  items: PhysicalDocumentItem[];
  onToggleCustody: (docId: string) => void;
}

export default function ShelfContentsTable({
  shelfName,
  cabinetName,
  items,
  onToggleCustody,
}: ShelfContentsTableProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {cabinetName} • {shelfName} Contents
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Physical binders and documents located on this shelf tier.
          </Typography>
        </Box>
        <Chip
          label={`${items.length} Files Recorded`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1 }}
        />
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* Files List with Scroll */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={1}>
          {items.length > 0 ? (
            items.map((doc) => {
              const isOnShelf = doc.status === "On Shelf";
              const statusColor = isOnShelf ? "success" : doc.status === "Checked Out" ? "warning" : "info";

              return (
                <Paper
                  key={doc.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary" }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Order: {doc.orderNo} ({doc.seriesYear}) • {doc.category}
                      </Typography>
                    </Box>

                    <Chip
                      label={doc.status}
                      size="small"
                      color={statusColor}
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 1, color: "text.secondary" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Folder: {doc.binder}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.72rem" }}>
                      Tag Barcode: {doc.barcode}
                    </Typography>
                    {doc.custodyOfficer && (
                      <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 600 }}>
                        Holder: {doc.custodyOfficer}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 0.75 }} />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onToggleCustody(doc.id)}
                      sx={{
                        fontSize: "0.72rem",
                        py: "2px",
                        px: "8px",
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {isOnShelf ? "Check Out File" : "Return to Shelf"}
                    </Button>

                    <Button
                      component={Link}
                      href="/documents"
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={{
                        fontSize: "0.72rem",
                        py: "2px",
                        px: "8px",
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "none",
                      }}
                    >
                      Open Digital PDF
                    </Button>
                  </Box>
                </Paper>
              );
            })
          ) : (
            <Box sx={{ p: 4, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                No records currently assigned to this shelf level.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}
