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
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

// Icons
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

// Layout & Components
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Archive Subcomponents
import { ArchiveDocument } from "@/components/documents/types";
import FileExplorerSidebar from "@/components/documents/FileExplorerSidebar";
import DocumentDossierInspector from "@/components/documents/DocumentDossierInspector";
import DocumentAiDrawer from "@/components/documents/DocumentAiDrawer";
import CabinetMapView from "@/components/documents/CabinetMapView";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import ArchivingAgentModal from "@/components/documents/ArchivingAgentModal";
import BackgroundArchivingWidget from "@/components/documents/BackgroundArchivingWidget";
import { useArchivingTask } from "@/components/documents/useArchivingTask";

// Seed Archive Documents
const INITIAL_DOCUMENTS: ArchiveDocument[] = [
  {
    id: "doc-1",
    title: "Real Property Assessment Advisory Guidelines and Valuation Standards",
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
      "Operational guidelines for local government units regarding property valuations, schedule of market values, and statutory delinquent penalties.",
    uploadedBy: {
      name: "Maria Santos",
      division: "Administrative Records",
      position: "Senior Records Officer",
    },
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
      "Directs provincial and municipal treasury collection units to interface electronic receipts with the central regional archival repository.",
    uploadedBy: {
      name: "Engr. Juan Dela Cruz",
      division: "Treasury Operations",
      position: "Revenue Assessment Specialist",
    },
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
    uploadedBy: {
      name: "Atty. Karen Reyes",
      division: "Legal Affairs Unit",
      position: "Legal Counsel",
    },
  },
  {
    id: "doc-4",
    title: "Standard Operating Procedure for Physical Document Ingestion and Scanning",
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
      { name: "Document Intake", score: 0.93 },
    ],
    summary:
      "Procedures for receiving physical paper records, barcode tagging, high-resolution scanning, and indexing into the digital repository.",
    uploadedBy: {
      name: "Roberto Morales",
      division: "Custodial Archives",
      position: "Records Archivist",
    },
  },
  {
    id: "doc-5",
    title: "Regional Memorandum on Financial Audits and Inter-Agency Ingestion",
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
      "Schedule of mandatory regional compliance audits covering revenue collections and document integrity across local offices.",
    uploadedBy: {
      name: "Director Alicia Tan",
      division: "Office of the Regional Director",
      position: "Regional Director",
    },
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

  // Layout Panels: Sidebar defaults to OPEN, Dossier defaults to CLOSED
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // In-Place AI Document Assistant Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiTargetDoc, setAiTargetDoc] = useState<ArchiveDocument | null>(null);

  const handleOpenAiDrawer = (doc: ArchiveDocument) => {
    setAiTargetDoc(doc);
    setIsAiDrawerOpen(true);
  };

  // Background Archiving Agent Hook
  const handleArchivingComplete = (newDocs: ArchiveDocument[]) => {
    setDocuments((prev) => [...newDocs, ...prev]);
    if (newDocs.length > 0) {
      setSelectedDoc(newDocs[0]);
      setShowInspector(true);
    }
  };

  const {
    isActive: isAgentActive,
    isMinimized: isAgentMinimized,
    progress: agentProgress,
    stepIndex: agentStepIndex,
    currentStep: agentCurrentStep,
    steps: agentSteps,
    queuedFiles: agentQueuedFiles,
    isFinished: isAgentFinished,
    startArchiving,
    minimize: minimizeAgent,
    maximize: maximizeAgent,
    dismiss: dismissAgent,
  } = useArchivingTask(handleArchivingComplete);

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      doc.orderNo.toLowerCase().includes(query) ||
      doc.shelfLocation.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;

    const matchesCabinet =
      selectedCabinet === "All" || doc.cabinet === selectedCabinet;

    return matchesSearch && matchesCategory && matchesCabinet;
  });

  const activeFilterLabel =
    selectedCategory !== "All"
      ? selectedCategory
      : selectedCabinet !== "All"
      ? selectedCabinet
      : "All Files";

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
          {/* Top Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Clean Title & Action Header */}
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Documents & Files
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                Browse official records by digital folders and categories.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {/* Toggle Sidebar Button */}
              <Tooltip title={isSidebarOpen ? "Hide File Directory" : "Show File Directory"}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  startIcon={
                    isSidebarOpen ? (
                      <ViewSidebarRoundedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <ViewSidebarOutlinedIcon sx={{ fontSize: 17 }} />
                    )
                  }
                  sx={{
                    borderRadius: 1,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {isSidebarOpen ? "Directory" : "Directory"}
                </Button>
              </Tooltip>

              {/* View Mode Toggle: List vs Cabinet */}
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
                    fontSize: "0.8rem",
                    py: 0.5,
                    px: 1.25,
                  },
                }}
              >
                <ToggleButton value="ledger">
                  <FormatListBulletedRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  List
                </ToggleButton>
                <ToggleButton value="cabinet">
                  <MapOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Cabinet Map
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Upload Document Button */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setIsUploadOpen(true)}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  px: 2,
                  py: 0.65,
                }}
              >
                Upload
              </Button>
            </Stack>
          </Box>

          {/* Clean 3-Pane Workspace Container */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flex: 1,
              minHeight: 0,
              mt: 2,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* 1. Left Collapsible File Explorer Sidebar */}
            <FileExplorerSidebar
              documents={documents}
              selectedCategory={selectedCategory}
              selectedCabinet={selectedCabinet}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onSelectCabinet={(cab) => setSelectedCabinet(cab)}
              isOpen={isSidebarOpen}
              onToggleOpen={() => setIsSidebarOpen(false)}
            />

            {/* 2. Center Document List Workspace */}
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
              {/* Directory Breadcrumb & Quick Filter Header */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  mb: 1.5,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {activeFilterLabel}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    ({filteredDocuments.length} {filteredDocuments.length === 1 ? "file" : "files"})
                  </Typography>

                  {(selectedCategory !== "All" || selectedCabinet !== "All" || searchQuery) && (
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedCategory("All");
                        setSelectedCabinet("All");
                        setSearchQuery("");
                      }}
                      sx={{
                        fontSize: "0.75rem",
                        textTransform: "none",
                        p: "2px 8px",
                        minWidth: "auto",
                        color: "text.secondary",
                      }}
                    >
                      Clear Filter
                    </Button>
                  )}
                </Box>

                {/* Search in Current Directory */}
                <TextField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter files by name or order code..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.25 }}>
                            <ClearRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    width: { xs: "100%", sm: "280px" },
                    "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: "0.82rem", height: 34 },
                  }}
                />
              </Paper>

              {/* View Mode: Clean List View vs Cabinet Map */}
              {viewMode === "ledger" ? (
                /* CLEAN DOCUMENT LIST */
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                  <Stack spacing={1.25}>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id && showInspector;

                        return (
                          <Paper
                            key={doc.id}
                            variant="outlined"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowInspector(true);
                            }}
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              bgcolor: isSelected ? "action.selected" : "background.paper",
                              borderColor: isSelected ? "primary.main" : "divider",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                borderColor: "primary.main",
                                boxShadow: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "0 2px 12px rgba(0,0,0,0.25)"
                                    : "0 2px 10px rgba(0,0,0,0.04)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 2,
                                flexWrap: { xs: "wrap", sm: "nowrap" },
                              }}
                            >
                              {/* Left: Document Icon + Title + Single Clean Metadata Line */}
                              <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(0, 0, 0, 0.04)",
                                    color: "primary.main",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    mt: 0.25,
                                  }}
                                >
                                  <PictureAsPdfRoundedIcon sx={{ fontSize: 22 }} />
                                </Box>

                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.92rem",
                                      color: "text.primary",
                                      lineHeight: 1.3,
                                      mb: 0.5,
                                    }}
                                  >
                                    {doc.title}
                                  </Typography>

                                  {/* Clean, Non-Technical Single Metadata Line */}
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.78rem",
                                      display: "flex",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      gap: 0.75,
                                    }}
                                  >
                                    <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                      {doc.orderNo}
                                    </Box>
                                    <Box component="span">•</Box>
                                    <Box component="span">Series {doc.seriesYear}</Box>
                                    <Box component="span">•</Box>
                                    <Box component="span">{doc.shelfLocation}</Box>
                                    <Box component="span">•</Box>
                                    <Box component="span">{doc.fileSize}</Box>
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Right: Clearance Chip + Clean Quick Actions */}
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  alignItems: "center",
                                  flexShrink: 0,
                                  mt: { xs: 1, sm: 0 },
                                }}
                              >
                                <Chip
                                  label={doc.clearance}
                                  size="small"
                                  color={doc.clearance === "Public" ? "success" : "default"}
                                  sx={{
                                    height: 22,
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    borderRadius: 1,
                                  }}
                                />

                                <Button
                                  size="small"
                                  variant={isSelected ? "contained" : "outlined"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDoc(doc);
                                    setShowInspector(true);
                                  }}
                                  startIcon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
                                  sx={{
                                    borderRadius: 1,
                                    fontSize: "0.78rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 1.25,
                                    boxShadow: "none",
                                  }}
                                >
                                  Details
                                </Button>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAiDrawer(doc);
                                  }}
                                  size="small"
                                  variant="outlined"
                                  startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
                                  sx={{
                                    borderRadius: 1,
                                    fontSize: "0.78rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 1.25,
                                  }}
                                >
                                  Ask AI
                                </Button>
                              </Stack>
                            </Box>
                          </Paper>
                        );
                      })
                    ) : (
                      /* Clean Empty State */
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 5,
                          textAlign: "center",
                          borderRadius: 1.5,
                          borderColor: "divider",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          No documents found
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", mb: 2 }}>
                          No records match your selected folder or search terms. Try selecting another folder or clearing filters.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedCategory("All");
                            setSelectedCabinet("All");
                            setSearchQuery("");
                          }}
                          sx={{ borderRadius: 1, textTransform: "none" }}
                        >
                          Show All Documents
                        </Button>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              ) : (
                /* PHYSICAL CABINET MAP VIEW */
                <CabinetMapView
                  documents={filteredDocuments}
                  selectedDocId={selectedDoc?.id}
                  onSelectDoc={(doc) => {
                    setSelectedDoc(doc);
                    setShowInspector(true);
                  }}
                />
              )}
            </Box>

            {/* 3. Right Dossier Inspector (Default = CLOSED, opens on click) */}
            {showInspector && (
              <DocumentDossierInspector
                document={selectedDoc}
                onClose={() => setShowInspector(false)}
                onAskAi={(doc) => handleOpenAiDrawer(doc)}
              />
            )}
          </Box>
        </Box>

        {/* AI Document Assistant Drawer (In-Place Analysis without navigation) */}
        <DocumentAiDrawer
          open={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          document={aiTargetDoc}
        />

        {/* Upload Document Dialog */}
        <UploadDocumentDialog
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onStartArchiving={startArchiving}
        />

        {/* Archiving Agent Pipeline Modal */}
        <ArchivingAgentModal
          open={isAgentActive && !isAgentMinimized}
          progress={agentProgress}
          stepIndex={agentStepIndex}
          currentStep={agentCurrentStep}
          steps={agentSteps}
          queuedFiles={agentQueuedFiles}
          isFinished={isAgentFinished}
          onMinimize={minimizeAgent}
          onDismiss={dismissAgent}
        />

        {/* Minimized Background Archiving Agent Dock */}
        {isAgentActive && isAgentMinimized && (
          <BackgroundArchivingWidget
            progress={agentProgress}
            currentStep={agentCurrentStep}
            queuedFiles={agentQueuedFiles}
            isFinished={isAgentFinished}
            onMaximize={maximizeAgent}
            onDismiss={dismissAgent}
          />
        )}
      </Box>
    </AppTheme>
  );
}