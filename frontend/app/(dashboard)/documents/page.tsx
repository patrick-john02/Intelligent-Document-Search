"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

// Layout & Components
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Archive Subcomponents
import { ArchiveDocument } from "@/components/documents/types";
import ArchiveMetricsBar from "@/components/documents/ArchiveMetricsBar";
import DocumentDossierInspector from "@/components/documents/DocumentDossierInspector";
import CabinetMapView from "@/components/documents/CabinetMapView";
import IngestDocumentDialog from "@/components/documents/IngestDocumentDialog";

// Sample Seed Archive Documents
const INITIAL_DOCUMENTS: ArchiveDocument[] = [
  {
    id: "doc-1",
    title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    cabinet: "Cabinet A",
    shelf: "Shelf 2",
    folder: "Binder 04",
    shelfLocation: "Cabinet A • Shelf 2 • Binder 04",
    ocrAccuracy: 99.1,
    fileSize: "4.8 MB",
    pageCount: 28,
    version: "v1.0",
    ingestedDate: "2024-08-28",
    status: "Indexed",
    tags: [
      { name: "Real Property Tax", score: 0.98 },
      { name: "Assessment Valuation", score: 0.95 },
    ],
    summary:
      "Prescribes the operational rules for local government units regarding property valuations, schedule of market values, and statutory delinquent penalties.",
  },
  {
    id: "doc-2",
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    cabinet: "Cabinet B",
    shelf: "Shelf 1",
    folder: "Binder 12",
    shelfLocation: "Cabinet B • Shelf 1 • Binder 12",
    ocrAccuracy: 96.4,
    fileSize: "2.3 MB",
    pageCount: 16,
    version: "v1.0",
    ingestedDate: "2024-08-24",
    status: "Indexed",
    tags: [
      { name: "Treasury Automation", score: 0.94 },
      { name: "Electronic Receipting", score: 0.91 },
    ],
    summary:
      "Directs provincial and municipal treasury collection units to interface electronic receipts with the central regional archival node.",
  },
  {
    id: "doc-3",
    title: "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities",
    orderNo: "LO-R2-2023-042",
    seriesYear: 2023,
    category: "Legal Opinions",
    clearance: "Internal",
    cabinet: "Cabinet C",
    shelf: "Shelf 4",
    folder: "Binder 08",
    shelfLocation: "Cabinet C • Shelf 4 • Binder 08",
    ocrAccuracy: 98.7,
    fileSize: "1.7 MB",
    pageCount: 9,
    version: "v1.0",
    ingestedDate: "2023-11-19",
    status: "Indexed",
    tags: [
      { name: "Franchise Tax", score: 0.97 },
      { name: "Public Utilities", score: 0.89 },
    ],
    summary:
      "Formal legal opinion clarifying local authority to levy municipal franchise taxes on telecommunications and power utility infrastructure.",
  },
  {
    id: "doc-4",
    title: "Standard Operating Procedure for Physical Document Ingestion and OCR Scanning",
    orderNo: "SOP-DOC-2024-001",
    seriesYear: 2024,
    category: "Standard Procedures",
    clearance: "Internal",
    cabinet: "Cabinet A",
    shelf: "Shelf 1",
    folder: "Binder 01",
    shelfLocation: "Cabinet A • Shelf 1 • Binder 01",
    ocrAccuracy: 97.9,
    fileSize: "3.1 MB",
    pageCount: 22,
    version: "v1.0",
    ingestedDate: "2024-08-15",
    status: "Indexed",
    tags: [
      { name: "Archival SOP", score: 0.96 },
      { name: "OCR Quality Control", score: 0.93 },
    ],
    summary:
      "Guidelines for scanning physical paper records into the digital archive, barcode labeling, and automated vector indexing.",
  },
  {
    id: "doc-5",
    title: "Regional Memorandum on Q3 Financial Audits and Inter-Agency Ingestion",
    orderNo: "RM-2024-011",
    seriesYear: 2024,
    category: "Memorandums",
    clearance: "Confidential",
    cabinet: "Cabinet D",
    shelf: "Shelf 3",
    folder: "Binder 19",
    shelfLocation: "Cabinet D • Shelf 3 • Binder 19",
    ocrAccuracy: 95.8,
    fileSize: "5.6 MB",
    pageCount: 34,
    version: "v1.0",
    ingestedDate: "2024-08-10",
    status: "Indexed",
    tags: [
      { name: "Financial Audit", score: 0.95 },
      { name: "Compliance", score: 0.91 },
    ],
    summary:
      "Schedule of mandatory regional compliance audits covering revenue collections and archival integrity across Region II.",
  },
];

export default function DocumentArchivePage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // States
  const [documents, setDocuments] = useState<ArchiveDocument[]>(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(INITIAL_DOCUMENTS[0]);
  const [viewMode, setViewMode] = useState<"ledger" | "cabinet">("ledger");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCabinet, setSelectedCabinet] = useState("All");
  const [showInspector, setShowInspector] = useState(true);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;

    const matchesCabinet =
      selectedCabinet === "All" || doc.cabinet === selectedCabinet;

    return matchesSearch && matchesCategory && matchesCabinet;
  });

  const handleIngestSuccess = (newDoc: ArchiveDocument) => {
    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Document Archive Workspace */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            height: "100vh",
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            px: { xs: 2, sm: 3 },
            pb: 2,
            pt: { xs: 8, md: 1.5 },
          })}
        >
          {/* Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Title & Action Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Document Archive
                </Typography>
                <Chip
                  label="Official Records Repository"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Cataloged physical binders and digitized OCR records for Region II.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {/* Ingest Document Button */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setIsIngestOpen(true)}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  px: 2,
                  py: 0.75,
                }}
              >
                + Ingest New Document
              </Button>

              <Button
                size="small"
                variant={showInspector ? "contained" : "outlined"}
                color={showInspector ? "primary" : "inherit"}
                onClick={() => setShowInspector(!showInspector)}
                sx={{
                  borderRadius: 1,
                  fontSize: "0.78rem",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                {showInspector ? "Hide Dossier" : "Show Dossier"}
              </Button>
            </Stack>
          </Box>

          {/* Metrics Bar */}
          <Box sx={{ my: 1.5, flexShrink: 0 }}>
            <ArchiveMetricsBar />
          </Box>

          {/* Search & Filter Toolbar */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: "background.paper",
              borderColor: "divider",
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              {/* Left Filters */}
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", flexGrow: 1, gap: 1 }}>
                <TextField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, order no, or shelf location..."
                  sx={{
                    width: { xs: "100%", sm: "320px" },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: "0.85rem" },
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ borderRadius: 1, fontSize: "0.82rem", height: 36 }}
                  >
                    <MenuItem value="All">All Categories</MenuItem>
                    <MenuItem value="Assessment Regulations">Assessment Regulations</MenuItem>
                    <MenuItem value="Treasury Advisories">Treasury Advisories</MenuItem>
                    <MenuItem value="Legal Opinions">Legal Opinions</MenuItem>
                    <MenuItem value="Standard Procedures">Standard Procedures</MenuItem>
                    <MenuItem value="Memorandums">Memorandums</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Cabinet</InputLabel>
                  <Select
                    value={selectedCabinet}
                    label="Cabinet"
                    onChange={(e) => setSelectedCabinet(e.target.value)}
                    sx={{ borderRadius: 1, fontSize: "0.82rem", height: 36 }}
                  >
                    <MenuItem value="All">All Cabinets</MenuItem>
                    <MenuItem value="Cabinet A">Cabinet A</MenuItem>
                    <MenuItem value="Cabinet B">Cabinet B</MenuItem>
                    <MenuItem value="Cabinet C">Cabinet C</MenuItem>
                    <MenuItem value="Cabinet D">Cabinet D</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* View Mode Switcher */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    py: 0.5,
                    px: 1.5,
                  },
                }}
              >
                <ToggleButton value="ledger">Ledger List</ToggleButton>
                <ToggleButton value="cabinet">Physical Cabinet Map</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>

          {/* Main Content Area (Split-View with Inspector) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Left Workspace: Ledger or Cabinet Map */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {viewMode === "ledger" ? (
                /* LEDGER LIST VIEW */
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                  <Stack spacing={1}>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <Paper
                            key={doc.id}
                            variant="outlined"
                            sx={{
                              p: 1.75,
                              borderRadius: 1,
                              bgcolor: isSelected ? "action.selected" : "background.paper",
                              borderColor: isSelected ? "primary.main" : "divider",
                              borderLeft: isSelected ? "3px solid" : "1px solid",
                              borderLeftColor: isSelected ? "primary.main" : "divider",
                              transition: "all 0.15s ease",
                              "&:hover": { borderColor: "primary.main" },
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 0.25 }}>
                                  {doc.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                  Order No: {doc.orderNo} ({doc.seriesYear}) • Category: {doc.category}
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <Chip
                                  label={doc.clearance}
                                  size="small"
                                  color={doc.clearance === "Public" ? "success" : "info"}
                                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                                />
                                <Chip
                                  label={`${doc.ocrAccuracy}% OCR`}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                                />
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                Location: {doc.shelfLocation} • Size: {doc.fileSize}
                              </Typography>

                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setSelectedDoc(doc)}
                                  sx={{
                                    fontSize: "0.74rem",
                                    textTransform: "none",
                                    py: "2px",
                                    px: "10px",
                                    borderRadius: 1,
                                    fontWeight: 600,
                                  }}
                                >
                                  Inspect Dossier
                                </Button>

                                <Button
                                  component={Link}
                                  href={`/chat?q=${encodeURIComponent(`Tell me about ${doc.title} (${doc.orderNo})`)}`}
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  sx={{
                                    fontSize: "0.74rem",
                                    textTransform: "none",
                                    py: "2px",
                                    px: "10px",
                                    borderRadius: 1,
                                    fontWeight: 700,
                                    boxShadow: "none",
                                  }}
                                >
                                  Ask AI Chat
                                </Button>
                              </Stack>
                            </Box>
                          </Paper>
                        );
                      })
                    ) : (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 4,
                          textAlign: "center",
                          borderRadius: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          No archived records found
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Try clearing search terms or changing your category/cabinet filters.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              ) : (
                /* PHYSICAL CABINET MAP VIEW */
                <CabinetMapView
                  documents={filteredDocuments}
                  selectedDocId={selectedDoc?.id}
                  onSelectDoc={setSelectedDoc}
                />
              )}
            </Box>

            {/* Right Workspace: Active Document Dossier Inspector */}
            {showInspector && (
              <DocumentDossierInspector
                document={selectedDoc}
                onClose={() => setShowInspector(false)}
              />
            )}
          </Box>
        </Box>

        {/* Ingest Document Modal */}
        <IngestDocumentDialog
          open={isIngestOpen}
          onClose={() => setIsIngestOpen(false)}
          onIngestSuccess={handleIngestSuccess}
        />
      </Box>
    </AppTheme>
  );
}