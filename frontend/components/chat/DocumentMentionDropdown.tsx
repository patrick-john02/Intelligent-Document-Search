"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { alpha } from "@mui/material/styles";

export interface MentionableDocument {
  id: string;
  orderNo: string;
  title: string;
  category: string;
  shelfLocation: string;
  seriesYear: number | string;
  clearance: "Public" | "Internal" | "Confidential";
  summary: string;
}

export const MENTIONABLE_DOCUMENTS: MentionableDocument[] = [
  {
    id: "doc-1",
    orderNo: "BLGF-DO-2024-018",
    title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
    category: "Assessment Regulations",
    shelfLocation: "Cabinet A • Shelf 2",
    seriesYear: 2024,
    clearance: "Public",
    summary: "Prescribes statutory 2% monthly surcharges on delinquent real property tax, max ceiling of 72 months, and valuation schedules.",
  },
  {
    id: "doc-2",
    orderNo: "TC-2024-009",
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    category: "Treasury Advisories",
    shelfLocation: "Cabinet B • Shelf 1",
    seriesYear: 2024,
    clearance: "Public",
    summary: "Directs all municipal and provincial treasury units within Region II to maintain electronic logs that sync with the central archival repository.",
  },
  {
    id: "doc-3",
    orderNo: "LO-R2-2023-042",
    title: "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities",
    category: "Legal Opinions",
    shelfLocation: "Cabinet C • Shelf 4",
    seriesYear: 2023,
    clearance: "Internal",
    summary: "Clarifies municipal authority to levy franchise tax on utilities unless statutory national exemption exists.",
  },
  {
    id: "doc-4",
    orderNo: "SOP-DOC-2024-001",
    title: "Standard Operating Procedure for Physical Document Ingestion and OCR Scanning",
    category: "Standard Procedures",
    shelfLocation: "Cabinet A • Shelf 1",
    seriesYear: 2024,
    clearance: "Internal",
    summary: "Intake protocol, barcode labeling coordinates, and automated vector embedding generation for paper records.",
  },
  {
    id: "doc-5",
    orderNo: "RM-2024-011",
    title: "Regional Memorandum on Q3 Financial Audits and Inter-Agency Ingestion",
    category: "Memorandums",
    shelfLocation: "Cabinet D • Shelf 3",
    seriesYear: 2024,
    clearance: "Confidential",
    summary: "Mandatory regional compliance audit schedule for revenue collections and archival integrity across Region II.",
  },
];

interface DocumentMentionDropdownProps {
  open: boolean;
  query: string;
  selectedIndex: number;
  onSelect: (doc: MentionableDocument) => void;
  onClose: () => void;
}

export default function DocumentMentionDropdown({
  open,
  query,
  selectedIndex,
  onSelect,
}: DocumentMentionDropdownProps) {
  if (!open) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const filteredDocs = MENTIONABLE_DOCUMENTS.filter(
    (doc) =>
      !normalizedQuery ||
      doc.orderNo.toLowerCase().includes(normalizedQuery) ||
      doc.title.toLowerCase().includes(normalizedQuery) ||
      doc.category.toLowerCase().includes(normalizedQuery) ||
      doc.shelfLocation.toLowerCase().includes(normalizedQuery)
  );

  return (
    <Paper
      elevation={8}
      variant="elevation"
      sx={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        mb: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
        zIndex: 1300,
        overflow: "hidden",
        maxHeight: 340,
        display: "flex",
        flexDirection: "column",
      }}
    >


      {/* Document Options List */}
      <List dense sx={{ p: 0.5, overflowY: "auto", flexGrow: 1 }}>
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <ListItem key={doc.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelect(doc)}
                  sx={{
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                    "&.Mui-selected": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      borderColor: "primary.main",
                      "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <DescriptionOutlinedIcon
                        fontSize="small"
                        sx={{
                          fontSize: 16,
                          color: isSelected ? "primary.main" : "text.secondary",
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: isSelected ? "primary.main" : "text.primary",
                        }}
                      >
                        {doc.orderNo}
                      </Typography>
                      <Chip
                        label={doc.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.7rem" }}
                      >
                        {doc.shelfLocation}
                      </Typography>
                    </Stack>
                  </Box>

                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontSize: "0.78rem",
                      color: "text.secondary",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {doc.title}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              No archived directives found matching "@{query}"
            </Typography>
          </Box>
        )}
      </List>

      {/* Footer Helper */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(15, 23, 42, 0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
          Use <b>↑ ↓</b> to navigate, <b>Enter</b> to select, <b>Esc</b> to close
        </Typography>
      </Box>
    </Paper>
  );
}
