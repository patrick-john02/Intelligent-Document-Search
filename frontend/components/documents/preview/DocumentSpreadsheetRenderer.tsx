"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { alpha } from "@mui/material/styles";

// Icons
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import FunctionsRoundedIcon from "@mui/icons-material/FunctionsRounded";

import { ArchiveDocument } from "../types";

interface DocumentSpreadsheetRendererProps {
  document: ArchiveDocument;
  zoomLevel: number;
}

const MOCK_ROWS = [
  {
    id: "SMV-01",
    district: "Poblacion Central Zone 1",
    classification: "Commercial Tier 1",
    marketValue: "₱ 18,500.00",
    assessmentLevel: "50%",
    taxableBase: "₱ 9,250.00",
    basicTax: "₱ 185.00",
    status: "Active",
  },
  {
    id: "SMV-02",
    district: "Poblacion Central Zone 2",
    classification: "Commercial Tier 2",
    marketValue: "₱ 14,200.00",
    assessmentLevel: "50%",
    taxableBase: "₱ 7,100.00",
    basicTax: "₱ 142.00",
    status: "Active",
  },
  {
    id: "SMV-03",
    district: "San Roque Riverside",
    classification: "Residential Prime",
    marketValue: "₱ 8,400.00",
    assessmentLevel: "20%",
    taxableBase: "₱ 1,680.00",
    basicTax: "₱ 33.60",
    status: "Active",
  },
  {
    id: "SMV-04",
    district: "San Roque Inland",
    classification: "Residential Standard",
    marketValue: "₱ 6,100.00",
    assessmentLevel: "20%",
    taxableBase: "₱ 1,220.00",
    basicTax: "₱ 24.40",
    status: "Active",
  },
  {
    id: "SMV-05",
    district: "Industrial Agro-Park East",
    classification: "Industrial Heavy",
    marketValue: "₱ 12,000.00",
    assessmentLevel: "50%",
    taxableBase: "₱ 6,000.00",
    basicTax: "₱ 120.00",
    status: "Active",
  },
  {
    id: "SMV-06",
    district: "Green Valley Agro-Sector",
    classification: "Agricultural Rice",
    marketValue: "₱ 1,850.00",
    assessmentLevel: "40%",
    taxableBase: "₱ 740.00",
    basicTax: "₱ 14.80",
    status: "Exempted",
  },
  {
    id: "SMV-07",
    district: "Green Valley Agro-Sector",
    classification: "Agricultural Fruit",
    marketValue: "₱ 2,100.00",
    assessmentLevel: "40%",
    taxableBase: "₱ 840.00",
    basicTax: "₱ 16.80",
    status: "Active",
  },
  {
    id: "SMV-08",
    district: "Municipal Civic Center",
    classification: "Special / Institutional",
    marketValue: "₱ 22,000.00",
    assessmentLevel: "15%",
    taxableBase: "₱ 3,300.00",
    basicTax: "₱ 66.00",
    status: "Gov-Exempt",
  },
];

export default function DocumentSpreadsheetRenderer({
  document,
  zoomLevel,
}: DocumentSpreadsheetRendererProps) {
  const [activeSheet, setActiveSheet] = useState<number>(0);
  const scale = zoomLevel / 100;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100%",
        py: 3,
        px: 2,
        width: "100%",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease-out",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Spreadsheet Header Bar */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <TableChartRoundedIcon sx={{ color: "#10B981", fontSize: 20 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.2 }}>
                {document.fileName || `${document.orderNo}.xlsx`}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                Spreadsheet Matrix • Last calculated: {document.ingestedDate}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${document.pageCount} Sheets • 8 Columns`}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor: alpha("#10B981", 0.15),
              color: "#059669",
            }}
          />
        </Box>

        {/* Excel Formula Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 0.75,
              border: "1px solid",
              borderColor: "divider",
              fontSize: "0.75rem",
              fontWeight: 700,
              bgcolor: "background.paper",
              minWidth: 45,
              textAlign: "center",
            }}
          >
            F3
          </Box>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flex: 1 }}>
            <FunctionsRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.82rem",
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              =PRODUCT(D3, E3) * 1.02 /* Basic RPT Calculation Matrix */
            </Typography>
          </Stack>
        </Box>

        {/* Data Grid Table */}
        <TableContainer sx={{ maxHeight: 580, overflowX: "auto" }}>
          <Table size="small" stickyHeader sx={{ "& td, & th": { py: 0.85, px: 1.5, fontSize: "0.78rem" } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "action.hover", width: 40, textAlign: "center", fontWeight: 700 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover" }}>A: Record ID</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover" }}>B: Assessment Zone</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover" }}>C: Classification</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover", textAlign: "right" }}>
                  D: Market Value (PHP/sqm)
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover", textAlign: "center" }}>
                  E: Assessment %
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover", textAlign: "right" }}>
                  F: Taxable Base
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover", textAlign: "right" }}>
                  G: Basic RPT (2%)
                </TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: "action.hover", textAlign: "center" }}>
                  H: Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_ROWS.map((row, index) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    bgcolor: index % 2 === 0 ? "background.paper" : (theme) => alpha(theme.palette.text.primary, 0.015),
                  }}
                >
                  <TableCell sx={{ color: "text.secondary", fontWeight: 600, textAlign: "center" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontFamily: "monospace" }}>{row.id}</TableCell>
                  <TableCell>{row.district}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.classification}
                      size="small"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {row.marketValue}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontWeight: 700 }}>{row.assessmentLevel}</TableCell>
                  <TableCell sx={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {row.taxableBase}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "success.main",
                    }}
                  >
                    {row.basicTax}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === "Active" ? "success" : "default"}
                      sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Summary Row */}
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Σ</TableCell>
                <TableCell colSpan={3} sx={{ fontWeight: 800 }}>
                  TOTAL MUNICIPAL VALUATION SUMMARY ({MOCK_ROWS.length} Records)
                </TableCell>
                <TableCell sx={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace" }}>
                  ₱ 85,250.00
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 800 }}>AVG 35.6%</TableCell>
                <TableCell sx={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace" }}>
                  ₱ 29,930.00
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "right",
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: "success.dark",
                  }}
                >
                  ₱ 598.60
                </TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 800 }}>100% BALANCED</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bottom Sheet Navigation Tabs */}
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "action.hover", px: 1 }}>
          <Tabs
            value={activeSheet}
            onChange={(_, val) => setActiveSheet(val)}
            sx={{
              minHeight: 34,
              "& .MuiTab-root": {
                minHeight: 34,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "none",
                py: 0.5,
                px: 1.5,
              },
            }}
          >
            <Tab label="Sheet 1: Valuation Schedule" />
            <Tab label="Sheet 2: Revenue Projections" />
            <Tab label="Sheet 3: Exemption Registry" />
          </Tabs>
        </Box>
      </Paper>
    </Box>
  );
}
