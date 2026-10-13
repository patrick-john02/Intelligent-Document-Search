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
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
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
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
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
import { ArchiveDocument, DocumentFileType, DocumentSortOption } from "@/components/documents/types";
import FileExplorerSidebar from "@/components/documents/FileExplorerSidebar";
import DocumentDossierInspector from "@/components/documents/DocumentDossierInspector";
import DocumentAiDrawer from "@/components/documents/DocumentAiDrawer";
import CabinetMapView from "@/components/documents/CabinetMapView";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import ArchivingAgentModal from "@/components/documents/ArchivingAgentModal";
import BackgroundArchivingWidget from "@/components/documents/BackgroundArchivingWidget";
import { useArchivingTask } from "@/components/documents/useArchivingTask";
import DocumentDateRangeFilter from "@/components/documents/DocumentDateRangeFilter";
import dayjs, { Dayjs } from "dayjs";

// Helpers for sorting and format presentation
function parseSizeInBytes(sizeStr: string): number {
  const match = sizeStr.match(/([\d.]+)\s*(MB|KB|GB|Bytes)/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === "GB") return num * 1024 * 1024 * 1024;
  if (unit === "MB") return num * 1024 * 1024;
  if (unit === "KB") return num * 1024;
  return num;
}

export function getFileTypeBadge(fileType: DocumentFileType) {
  switch (fileType) {
    case "xlsx":
      return {
        label: "Excel",
        extension: ".xlsx",
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        icon: <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />,
      };
    case "docx":
      return {
        label: "Word",
        extension: ".docx",
        color: "#3B82F6",
        bgColor: "rgba(59, 130, 246, 0.1)",
        icon: <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />,
      };
    case "pdf":
    default:
      return {
        label: "PDF",
        extension: ".pdf",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        icon: <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />,
      };
  }
}

// Seed Archive Documents
// Seed Archive Documents with diverse file formats (.pdf, .xlsx, .docx)
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
    fileType: "pdf",
    fileName: "BLGF-DO-2024-018-Assessment-Guidelines.pdf",
    version: "v1.0",
    ingestedDate: "2024-09-02",
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
    title: "Treasury Circular on Local Revenue Collections and Automation Matrix",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    cabinet: "Cabinet B",
    shelf: "Shelf 1",
    folder: "Binder 12",
    shelfLocation: "Cabinet B • Shelf 1 • Binder 12",
    ocrAccuracy: 98.4,
    fileSize: "2.3 MB",
    pageCount: 16,
    fileType: "xlsx",
    fileName: "TC-2024-009-Collection-Ledger.xlsx",
    version: "v1.0",
    ingestedDate: "2024-08-28",
    status: "Indexed",
    tags: [
      { name: "Treasury Automation", score: 0.94 },
      { name: "Electronic Receipting", score: 0.91 },
    ],
    summary:
      "Tabular register directing municipal treasury collection units to interface electronic receipts with the central regional archival repository.",
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
    fileType: "docx",
    fileName: "LO-R2-2023-042-Tax-Exemption-Opinion.docx",
    version: "v1.0",
    ingestedDate: "2024-08-24",
    status: "Indexed",
    tags: [
      { name: "Franchise Tax", score: 0.97 },
      { name: "Public Utilities", score: 0.89 },
    ],
    summary:
      "Formal legal brief clarifying local authority to levy municipal franchise taxes on telecommunications and power utility infrastructure.",
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
    fileType: "pdf",
    fileName: "SOP-DOC-2024-001-Ingestion-Procedures.pdf",
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
    fileType: "pdf",
    fileName: "RM-2024-011-Financial-Audit-Memo.pdf",
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
  {
    id: "doc-6",
    title: "Annual Local Treasury Financial Allocation and Revenue Breakdown Schedule",
    orderNo: "REV-SCH-2024-005",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    cabinet: "Cabinet B",
    shelf: "Shelf 3",
    folder: "Binder 07",
    shelfLocation: "Cabinet B • Shelf 3 • Binder 07",
    ocrAccuracy: 99.4,
    fileSize: "6.2 MB",
    pageCount: 12,
    fileType: "xlsx",
    fileName: "REV-SCH-2024-Valuation-Schedule.xlsx",
    version: "v1.1",
    ingestedDate: "2024-07-30",
    status: "Indexed",
    tags: [
      { name: "Financial Ledger", score: 0.98 },
      { name: "Local Allocation", score: 0.93 },
    ],
    summary:
      "Detailed spreadsheet ledger mapping local revenue projections against regional disbursement allocations for FY 2024.",
    uploadedBy: {
      name: "Engr. Juan Dela Cruz",
      division: "Treasury Operations",
      position: "Revenue Assessment Specialist",
    },
  },
  {
    id: "doc-7",
    title: "Administrative Guideline on Digital Archival Records Retention and Security",
    orderNo: "AG-DIR-2024-033",
    seriesYear: 2024,
    category: "Standard Procedures",
    clearance: "Restricted",
    cabinet: "Cabinet C",
    shelf: "Shelf 2",
    folder: "Binder 15",
    shelfLocation: "Cabinet C • Shelf 2 • Binder 15",
    ocrAccuracy: 98.2,
    fileSize: "2.1 MB",
    pageCount: 18,
    fileType: "docx",
    fileName: "AG-DIR-2024-033-Retention-Guidelines.docx",
    version: "v1.0",
    ingestedDate: "2024-07-15",
    status: "Indexed",
    tags: [
      { name: "Records Retention", score: 0.97 },
      { name: "Compliance Policy", score: 0.94 },
    ],
    summary:
      "Word document draft specifying statutory minimum retention periods, disposition schedules, and access protocols for physical and digitized files.",
    uploadedBy: {
      name: "Maria Santos",
      division: "Administrative Records",
      position: "Senior Records Officer",
    },
  },
  {
    id: "doc-8",
    title: "Schedule of Real Property Market Values and Assessment Rates Matrix",
    orderNo: "SMV-MAT-2024-004",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    cabinet: "Cabinet A",
    shelf: "Shelf 3",
    folder: "Binder 02",
    shelfLocation: "Cabinet A • Shelf 3 • Binder 02",
    ocrAccuracy: 99.6,
    fileSize: "3.7 MB",
    pageCount: 8,
    fileType: "xlsx",
    fileName: "SMV-MAT-2024-Market-Values.xlsx",
    version: "v1.2",
    ingestedDate: "2024-08-30",
    status: "Indexed",
    tags: [
      { name: "Assessment Valuation", score: 0.99 },
      { name: "Schedule of Market Values", score: 0.96 },
    ],
    summary:
      "Spreadsheet matrix compiling statutory assessment levels, unit value schedules, and assessment brackets across municipal zones.",
    uploadedBy: {
      name: "Engr. Juan Dela Cruz",
      division: "Treasury Operations",
      position: "Revenue Assessment Specialist",
    },
  },
  {
    id: "doc-9",
    title: "Legal Counsel Resolution on Boundary Tax Jurisdiction and Revenue Apportionment",
    orderNo: "RES-LO-2024-008",
    seriesYear: 2024,
    category: "Legal Opinions",
    clearance: "Internal",
    cabinet: "Cabinet C",
    shelf: "Shelf 1",
    folder: "Binder 05",
    shelfLocation: "Cabinet C • Shelf 1 • Binder 05",
    ocrAccuracy: 98.9,
    fileSize: "2.8 MB",
    pageCount: 14,
    fileType: "pdf",
    fileName: "RES-LO-2024-Boundary-Jurisdiction.pdf",
    version: "v1.0",
    ingestedDate: "2024-08-18",
    status: "Indexed",
    tags: [
      { name: "Jurisdiction", score: 0.97 },
      { name: "Revenue Apportionment", score: 0.92 },
    ],
    summary:
      "Certified PDF legal resolution clarifying tax collection prerogatives and boundary apportionments between neighboring municipal jurisdictions.",
    uploadedBy: {
      name: "Atty. Karen Reyes",
      division: "Legal Affairs Unit",
      position: "Legal Counsel",
    },
  },
  {
    id: "doc-10",
    title: "Executive Memorandum on Electronic Records Archival Compliance Framework",
    orderNo: "MEMO-DIR-2024-019",
    seriesYear: 2024,
    category: "Memorandums",
    clearance: "Internal",
    cabinet: "Cabinet D",
    shelf: "Shelf 2",
    folder: "Binder 11",
    shelfLocation: "Cabinet D • Shelf 2 • Binder 11",
    ocrAccuracy: 97.4,
    fileSize: "1.9 MB",
    pageCount: 11,
    fileType: "docx",
    fileName: "MEMO-DIR-2024-Compliance-Framework.docx",
    version: "v1.0",
    ingestedDate: "2024-08-05",
    status: "Indexed",
    tags: [
      { name: "Compliance Framework", score: 0.96 },
      { name: "Archival Mandate", score: 0.93 },
    ],
    summary:
      "Executive memorandum providing operational directives for inter-office electronic records indexing, security classifications, and preservation.",
    uploadedBy: {
      name: "Director Alicia Tan",
      division: "Office of the Regional Director",
      position: "Regional Director",
    },
  },
  {
    id: "doc-11",
    title: "Treasury Advisory Directive on Real-Time Electronic Remittances and Ledger Balancing",
    orderNo: "TC-DIR-2024-015",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    cabinet: "Cabinet B",
    shelf: "Shelf 2",
    folder: "Binder 09",
    shelfLocation: "Cabinet B • Shelf 2 • Binder 09",
    ocrAccuracy: 99.2,
    fileSize: "3.4 MB",
    pageCount: 18,
    fileType: "pdf",
    fileName: "TC-DIR-2024-Electronic-Remittance.pdf",
    version: "v1.0",
    ingestedDate: "2024-07-25",
    status: "Indexed",
    tags: [
      { name: "Electronic Remittance", score: 0.98 },
      { name: "Treasury Controls", score: 0.92 },
    ],
    summary:
      "Advisory document establishing real-time verification and remittance procedures for local revenue collections and central ledger synchronization.",
    uploadedBy: {
      name: "Engr. Juan Dela Cruz",
      division: "Treasury Operations",
      position: "Revenue Assessment Specialist",
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
  const [selectedFileType, setSelectedFileType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<DocumentSortOption>("date-desc");

  // Date Range Filter (From - To)
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

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

  // Filtering & Sorting (Default: Newest Date First)
  const filteredDocuments = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = documents.filter((doc) => {
      const matchesSearch =
        !query ||
        doc.title.toLowerCase().includes(query) ||
        doc.orderNo.toLowerCase().includes(query) ||
        doc.shelfLocation.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || doc.category === selectedCategory;

      const matchesCabinet =
        selectedCabinet === "All" || doc.cabinet === selectedCabinet;

      const matchesFileType =
        selectedFileType === "All" || doc.fileType === selectedFileType;

      const docDate = dayjs(doc.ingestedDate);
      const matchesFromDate =
        !fromDate || docDate.isAfter(fromDate.startOf("day").subtract(1, "second"));
      const matchesToDate =
        !toDate || docDate.isBefore(toDate.endOf("day").add(1, "second"));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCabinet &&
        matchesFileType &&
        matchesFromDate &&
        matchesToDate
      );
    });

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.ingestedDate).getTime() - new Date(a.ingestedDate).getTime();
        case "date-asc":
          return new Date(a.ingestedDate).getTime() - new Date(b.ingestedDate).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "order-asc":
          return a.orderNo.localeCompare(b.orderNo);
        case "size-desc":
          return parseSizeInBytes(b.fileSize) - parseSizeInBytes(a.fileSize);
        case "type":
          return a.fileType.localeCompare(b.fileType);
        default:
          return new Date(b.ingestedDate).getTime() - new Date(a.ingestedDate).getTime();
      }
    });
  }, [documents, searchQuery, selectedCategory, selectedCabinet, selectedFileType, fromDate, toDate, sortBy]);

  const dateRangeLabel =
    fromDate && toDate
      ? `${fromDate.format("MMM D")} – ${toDate.format("MMM D")}`
      : fromDate
      ? `From ${fromDate.format("MMM D")}`
      : toDate
      ? `Until ${toDate.format("MMM D")}`
      : null;

  const basePathLabel =
    selectedCategory !== "All" && selectedFileType !== "All"
      ? `${selectedCategory} / ${
          selectedFileType === "pdf"
            ? "PDF Documents (.pdf)"
            : selectedFileType === "xlsx"
            ? "Excel Sheets (.xlsx)"
            : "Word Documents (.docx)"
        }`
      : selectedCategory !== "All"
      ? selectedCategory
      : selectedFileType !== "All"
      ? selectedFileType === "pdf"
        ? "PDF Documents (.pdf)"
        : selectedFileType === "xlsx"
        ? "Excel Sheets (.xlsx)"
        : "Word Documents (.docx)"
      : selectedCabinet !== "All"
      ? selectedCabinet
      : "All Files";

  const activeFilterLabel = dateRangeLabel
    ? `${basePathLabel} (${dateRangeLabel})`
    : basePathLabel;

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
              selectedFileType={selectedFileType}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onSelectCabinet={(cab) => setSelectedCabinet(cab)}
              onSelectFileType={(type) => setSelectedFileType(type)}
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
              {/* Directory Breadcrumb, Sort Selector & Quick Filter Header */}
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

                  {(selectedCategory !== "All" ||
                    selectedCabinet !== "All" ||
                    selectedFileType !== "All" ||
                    searchQuery ||
                    fromDate !== null ||
                    toDate !== null) && (
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedCategory("All");
                        setSelectedCabinet("All");
                        setSelectedFileType("All");
                        setSearchQuery("");
                        setFromDate(null);
                        setToDate(null);
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

                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: "stretch", lg: "center" },
                    width: { xs: "100%", lg: "auto" },
                    flexWrap: "wrap",
                  }}
                >
                  {/* Clean Date Filter (From - To) */}
                  <DocumentDateRangeFilter
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={setFromDate}
                    onToDateChange={setToDate}
                    onClear={() => {
                      setFromDate(null);
                      setToDate(null);
                    }}
                  />

                  {/* Clean Sort Selector */}
                  <FormControl size="small" sx={{ minWidth: 165, width: { xs: "100%", sm: "auto" } }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as DocumentSortOption)}
                      displayEmpty
                      startAdornment={
                        <InputAdornment position="start">
                          <SortRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 1,
                        fontSize: "0.82rem",
                        height: 34,
                        bgcolor: "background.paper",
                        "& .MuiSelect-select": {
                          py: 0.5,
                          fontWeight: 600,
                        },
                      }}
                    >
                      <MenuItem value="date-desc" sx={{ fontSize: "0.82rem" }}>
                        Date (Newest First)
                      </MenuItem>
                      <MenuItem value="date-asc" sx={{ fontSize: "0.82rem" }}>
                        Date (Oldest First)
                      </MenuItem>
                      <MenuItem value="title-asc" sx={{ fontSize: "0.82rem" }}>
                        Title (A–Z)
                      </MenuItem>
                      <MenuItem value="title-desc" sx={{ fontSize: "0.82rem" }}>
                        Title (Z–A)
                      </MenuItem>
                      <MenuItem value="order-asc" sx={{ fontSize: "0.82rem" }}>
                        Order No. (A–Z)
                      </MenuItem>
                      <MenuItem value="size-desc" sx={{ fontSize: "0.82rem" }}>
                        File Size (Largest)
                      </MenuItem>
                      <MenuItem value="type" sx={{ fontSize: "0.82rem" }}>
                        File Format (.pdf, .xlsx, .docx)
                      </MenuItem>
                    </Select>
                  </FormControl>

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
                      width: { xs: "100%", sm: "220px" },
                      "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: "0.82rem", height: 34 },
                    }}
                  />
                </Stack>
              </Paper>

              {/* View Mode: Clean List View vs Cabinet Map */}
              {viewMode === "ledger" ? (
                /* CLEAN DOCUMENT LIST */
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                  <Stack spacing={1.25}>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id && showInspector;
                        const typeBadge = getFileTypeBadge(doc.fileType);

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
                                    bgcolor: typeBadge.bgColor,
                                    border: `1px solid ${alpha(typeBadge.color, 0.25)}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    mt: 0.25,
                                  }}
                                >
                                  {typeBadge.icon}
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
                                    <Box
                                      component="span"
                                      sx={{
                                        fontWeight: 700,
                                        color: typeBadge.color,
                                        fontSize: "0.74rem",
                                      }}
                                    >
                                      {typeBadge.label} ({typeBadge.extension})
                                    </Box>
                                    <Box component="span">•</Box>
                                    <Box component="span">{doc.ingestedDate}</Box>
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
                                  Ask Mayumi
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
                            setSelectedFileType("All");
                            setSearchQuery("");
                            setFromDate(null);
                            setToDate(null);
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