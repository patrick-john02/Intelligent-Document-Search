"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Layout & Dashboard Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Uploads Subcomponents
import { StaffUploadItem, UploadMetrics } from "@/components/uploads/types";
import UploadMetricsSummary from "@/components/uploads/UploadMetricsSummary";
import TeamsCategoryGrid, { TEAMS_CATEGORIES, CategoryMeta } from "@/components/uploads/TeamsCategoryGrid";
import CategoryDetailView from "@/components/uploads/CategoryDetailView";
import NewUploadModal from "@/components/uploads/NewUploadModal";

const SEED_UPLOADS: StaffUploadItem[] = [
  {
    id: "up-1",
    title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    fileName: "blgf-do-2024-018-assessment-guidelines.pdf",
    fileSize: "4.8 MB",
    pageCount: 28,
    uploadedAt: "2024-08-28 09:15",
    status: "Published",
    version: "v1.1",
    versionHistory: [
      {
        version: "v1.1",
        date: "2024-08-28 09:15",
        fileName: "blgf-do-2024-018-assessment-guidelines-signed.pdf",
        uploadedBy: "Staff Officer",
        notes: "Uploaded officially signed copy with assessor dry seal",
      },
      {
        version: "v1.0",
        date: "2024-08-20 11:30",
        fileName: "blgf-do-2024-018-assessment-guidelines-draft.pdf",
        uploadedBy: "Staff Officer",
        notes: "Initial advance copy upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet A",
      shelf: "Shelf 2",
      binder: "Binder 04",
      barcode: "R2-CAB-A-S2-B04",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-08-28 09:15", detail: "File verified." },
      textExtraction: { status: "completed", timestamp: "2024-08-28 09:16", detail: "28 pages verified." },
      indexing: { status: "completed", timestamp: "2024-08-28 09:18", detail: "Search ready." },
      physicalTag: { status: "completed", timestamp: "2024-08-28 09:20", detail: "Cabinet A • Shelf 2 (Binder 04)." },
      status: { status: "completed", timestamp: "2024-08-28 10:00", detail: "Published in catalog." },
    },
    extractedSummary:
      "Prescribes the operational rules for local government units regarding property valuations, schedule of market values, and statutory delinquent penalties.",
  },
  {
    id: "up-2",
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    fileName: "tc-2024-009-revenue-collection.pdf",
    fileSize: "2.3 MB",
    pageCount: 16,
    uploadedAt: "2024-08-24 11:42",
    status: "Published",
    version: "v1.0",
    versionHistory: [
      {
        version: "v1.0",
        date: "2024-08-24 11:42",
        fileName: "tc-2024-009-revenue-collection.pdf",
        uploadedBy: "Staff Officer",
        notes: "Initial document upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet B",
      shelf: "Shelf 1",
      binder: "Binder 12",
      barcode: "R2-CAB-B-S1-B12",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-08-24 11:42", detail: "File verified." },
      textExtraction: { status: "completed", timestamp: "2024-08-24 11:43", detail: "Text verified." },
      indexing: { status: "completed", timestamp: "2024-08-24 11:44", detail: "Search ready." },
      physicalTag: { status: "completed", timestamp: "2024-08-24 11:45", detail: "Cabinet B • Shelf 1 (Binder 12)." },
      status: { status: "completed", timestamp: "2024-08-24 14:10", detail: "Published." },
    },
    extractedSummary:
      "Directs provincial and municipal treasury collection units to interface electronic receipts with the central regional archival node.",
  },
  {
    id: "up-3",
    title: "Standard Operating Procedure for Physical Document Ingestion and Scanning",
    orderNo: "SOP-DOC-2024-001",
    seriesYear: 2024,
    category: "Standard Procedures",
    clearance: "Internal",
    fileName: "sop-doc-2024-001-ingestion.pdf",
    fileSize: "1.2 MB",
    pageCount: 10,
    uploadedAt: "2024-08-20 14:05",
    status: "Published",
    version: "v1.0",
    versionHistory: [
      {
        version: "v1.0",
        date: "2024-08-20 14:05",
        fileName: "sop-doc-2024-001-ingestion.pdf",
        uploadedBy: "Staff Officer",
        notes: "Initial SOP upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet A",
      shelf: "Shelf 1",
      binder: "Binder 01",
      barcode: "R2-CAB-A-S1-B01",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-08-20 14:05", detail: "File verified." },
      textExtraction: { status: "completed", timestamp: "2024-08-20 14:06", detail: "Text verified." },
      indexing: { status: "completed", timestamp: "2024-08-20 14:07", detail: "Search ready." },
      physicalTag: { status: "completed", timestamp: "2024-08-20 14:08", detail: "Cabinet A • Shelf 1 (Binder 01)." },
      status: { status: "completed", timestamp: "2024-08-20 15:30", detail: "Published." },
    },
    extractedSummary:
      "Step-by-step procedural manual for staff scanning operators on feeder calibration, page thresholding, and cabinet shelf tagging.",
  },
  {
    id: "up-4",
    title: "Inter-Agency Directives on Digital Land Titling and Tax Declaration Synchronization",
    orderNo: "DO-2024-031",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    fileName: "do-2024-031-land-titling-sync.pdf",
    fileSize: "5.6 MB",
    pageCount: 34,
    uploadedAt: "2024-09-19 10:15",
    status: "Processing",
    version: "v1.0",
    versionHistory: [
      {
        version: "v1.0",
        date: "2024-09-19 10:15",
        fileName: "do-2024-031-land-titling-sync.pdf",
        uploadedBy: "Staff Officer",
        notes: "Initial upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet A",
      shelf: "Shelf 3",
      binder: "Binder 07",
      barcode: "R2-CAB-A-S3-B07",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-09-19 10:15", detail: "File received." },
      textExtraction: { status: "processing", detail: "Extracting text..." },
      indexing: { status: "pending", detail: "Queued." },
      physicalTag: { status: "completed", detail: "Cabinet A • Shelf 3 (Binder 07)." },
      status: { status: "pending", detail: "Pending verification." },
    },
    extractedSummary:
      "Joint directive governing registry synchronization between land titles and assessor property declarations.",
  },
  {
    id: "up-5",
    title: "Regional Advisory on Delinquent Real Property Tax Amnesty and Settlement",
    orderNo: "RA-2024-014",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    fileName: "ra-2024-014-tax-amnesty.pdf",
    fileSize: "3.1 MB",
    pageCount: 14,
    uploadedAt: "2024-09-19 08:30",
    status: "Processing",
    version: "v1.0",
    versionHistory: [
      {
        version: "v1.0",
        date: "2024-09-19 08:30",
        fileName: "ra-2024-014-tax-amnesty.pdf",
        uploadedBy: "Staff Officer",
        notes: "Initial upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet B",
      shelf: "Shelf 3",
      binder: "Binder 15",
      barcode: "R2-CAB-B-S3-B15",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-09-19 08:30", detail: "File received." },
      textExtraction: { status: "completed", timestamp: "2024-09-19 08:32", detail: "Text verified." },
      indexing: { status: "processing", detail: "Indexing in search..." },
      physicalTag: { status: "completed", detail: "Cabinet B • Shelf 3 (Binder 15)." },
      status: { status: "pending", detail: "Pending." },
    },
    extractedSummary:
      "Advisory clarifying penalty relief conditions, payment schedules, and settlement agreements for delinquent real property accounts.",
  },
  {
    id: "up-6",
    title: "Municipal Ordinance Compilation on Commercial Assessment Rates (Scanned Carbon Copy)",
    orderNo: "MO-2023-088",
    seriesYear: 2023,
    category: "Legal Opinions",
    clearance: "Internal",
    fileName: "mo-2023-088-commercial-rates.pdf",
    fileSize: "7.4 MB",
    pageCount: 40,
    uploadedAt: "2024-09-18 16:50",
    status: "Needs Review",
    version: "v1.0",
    versionHistory: [
      {
        version: "v1.0",
        date: "2024-09-18 16:50",
        fileName: "mo-2023-088-commercial-rates.pdf",
        uploadedBy: "Staff Officer",
        notes: "Carbon copy scan upload",
      },
    ],
    shelfLocation: {
      cabinet: "Cabinet C",
      shelf: "Shelf 2",
      binder: "Binder 03",
      barcode: "R2-CAB-C-S2-B03",
      tagged: true,
    },
    stages: {
      upload: { status: "completed", timestamp: "2024-09-18 16:50", detail: "Carbon copy PDF received." },
      textExtraction: { status: "completed", timestamp: "2024-09-18 16:54", detail: "Faded carbon text detected." },
      indexing: { status: "pending", detail: "Awaiting staff check." },
      physicalTag: { status: "completed", detail: "Cabinet C • Shelf 2 (Binder 03)." },
      status: { status: "pending", detail: "Staff review required." },
    },
    extractedSummary:
      "Historical compilation of municipal business taxation schedules. Carbon copy quality requires visual verification of table column figures.",
  },
];

export default function MyUploadsPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // States
  const [uploadsList, setUploadsList] = useState<StaffUploadItem[]>(SEED_UPLOADS);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>("up-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [versionTargetDoc, setVersionTargetDoc] = useState<StaffUploadItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Metrics computation
  const metrics: UploadMetrics = useMemo(() => {
    const total = uploadsList.length;
    const indexed = uploadsList.filter(
      (d) => d.status === "Completed" || d.status === "Published"
    ).length;
    const processing = uploadsList.filter(
      (d) => d.status === "Processing" || d.status === "OCR Processing" || d.status === "Vectorizing"
    ).length;
    const review = uploadsList.filter(
      (d) => d.status === "Needs Review" || d.status === "Review Required"
    ).length;

    return {
      totalUploads: total,
      indexedCount: indexed,
      processingCount: processing,
      reviewRequiredCount: review,
      categoriesCount: TEAMS_CATEGORIES.length,
    };
  }, [uploadsList]);

  // Find active category metadata if in detail view
  const activeCategoryMeta: CategoryMeta | undefined = useMemo(() => {
    if (!selectedCategoryName) return undefined;
    return TEAMS_CATEGORIES.find((c) => c.name === selectedCategoryName);
  }, [selectedCategoryName]);

  // Documents inside active category
  const activeCategoryDocs = useMemo(() => {
    if (!selectedCategoryName) return [];
    return uploadsList.filter((d) => d.category === selectedCategoryName);
  }, [uploadsList, selectedCategoryName]);

  // Handlers
  const handleUploadSuccess = (item: StaffUploadItem) => {
    if (versionTargetDoc) {
      // Replace existing document with new version
      setUploadsList((prev) =>
        prev.map((doc) => (doc.id === item.id ? item : doc))
      );
      setNotification(`New version ${item.version} uploaded for ${item.orderNo}.`);
      setVersionTargetDoc(null);
    } else {
      // Add new document
      setUploadsList((prev) => [item, ...prev]);
      setNotification(`Document "${item.fileName}" uploaded to "${item.category}".`);
    }
    setSelectedDocId(item.id);
  };

  const handleOpenVersionModal = (doc: StaffUploadItem) => {
    setVersionTargetDoc(doc);
    setIsModalOpen(true);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Workspace */}
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

          {/* Top Bar: Title, Search, and Upload Action */}
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
                  Categories
                </Typography>
                <Chip
                  label={`${TEAMS_CATEGORIES.length} Categories`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Browse documents grouped by category. Click any category box to open its files and version history.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories or directives..."
                sx={{
                  width: { xs: "180px", sm: "240px" },
                  "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: "0.82rem" },
                }}
              />

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  setVersionTargetDoc(null);
                  setIsModalOpen(true);
                }}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  px: 2.5,
                  height: 36,
                  whiteSpace: "nowrap",
                }}
              >
                + Upload
              </Button>
            </Box>
          </Box>

          {/* Notification Banner if active */}
          {notification && (
            <Paper
              variant="outlined"
              sx={{
                mt: 1.5,
                p: 1.25,
                px: 2,
                borderRadius: 1,
                bgcolor: "action.selected",
                borderColor: "primary.main",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", fontSize: "0.82rem" }}>
                {notification}
              </Typography>
              <Button
                size="small"
                onClick={() => setNotification(null)}
                sx={{ fontSize: "0.72rem", textTransform: "none", p: 0, minWidth: "auto" }}
              >
                Dismiss
              </Button>
            </Paper>
          )}

          {/* Summary KPI Cards Strip */}
          <Box sx={{ my: 1.5, flexShrink: 0 }}>
            <UploadMetricsSummary metrics={metrics} />
          </Box>

          {/* Main Area: Either Teams Grid of Category Boxes OR Channel Detail View */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {activeCategoryMeta ? (
              <CategoryDetailView
                category={activeCategoryMeta}
                items={activeCategoryDocs}
                selectedDocId={selectedDocId}
                onSelectDoc={(doc) => setSelectedDocId(doc.id)}
                onBackToGrid={() => setSelectedCategoryName(null)}
                onOpenUploadModal={() => {
                  setVersionTargetDoc(null);
                  setIsModalOpen(true);
                }}
                onUploadNewVersion={handleOpenVersionModal}
              />
            ) : (
              <TeamsCategoryGrid
                items={uploadsList}
                searchQuery={searchQuery}
                onSelectCategory={(catName) => setSelectedCategoryName(catName)}
              />
            )}
          </Box>

          {/* Upload Modal (Handles both new upload and versioning) */}
          <NewUploadModal
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setVersionTargetDoc(null);
            }}
            onUploadSuccess={handleUploadSuccess}
            versionTargetDoc={versionTargetDoc}
          />
        </Box>
      </Box>
    </AppTheme>
  );
}
