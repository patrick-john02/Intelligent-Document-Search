"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ViewStreamRoundedIcon from "@mui/icons-material/ViewStreamRounded";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

// Layout & Components
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";
import SmartSearchSkeleton from "@/components/search/SmartSearchSkeleton";
import SmartSearchResultCard from "@/components/search/SmartSearchResultCard";
import MayumiAiSynthesisCard from "@/components/search/MayumiAiSynthesisCard";
import SearchZeroState from "@/components/search/SearchZeroState";
import SearchSplitPaneView from "@/components/search/SearchSplitPaneView";
import DocumentPreviewModal from "@/components/documents/preview/DocumentPreviewModal";
import DocumentAiDrawer from "@/components/documents/DocumentAiDrawer";
import { SAMPLE_SEARCH_DOCUMENTS } from "@/components/search/seedData";
import { SearchResultItem, SearchMode, SortOption } from "@/components/search/types";
import { ArchiveDocument, DocumentClearance } from "@/components/documents/types";
import { getDocument } from "@/lib/documentsApi";
import { apiDocumentToArchive } from "@/components/documents/documentMapper";
import { api } from "@/lib/api";

// Curated query suggestions
const POPULAR_QUERIES = [
  "Property tax penalties",
  "Treasury electronic receipts",
  "Franchise tax exemption",
  "Document intake & scanning",
  "Financial audit schedule",
];

const CATEGORY_OPTIONS = [
  { value: "All", label: "All Categories" },
  { value: "Assessment Regulations", label: "Assessment Regulations" },
  { value: "Treasury Advisories", label: "Treasury Advisories" },
  { value: "Legal Opinions", label: "Legal Opinions" },
  { value: "Standard Procedures", label: "Standard Procedures" },
  { value: "Memorandums", label: "Memorandums" },
];

const CLEARANCE_OPTIONS = [
  { value: "All", label: "All Clearance" },
  { value: "Public", label: "Public" },
  { value: "Internal", label: "Internal" },
  { value: "Confidential", label: "Confidential" },
  { value: "Restricted", label: "Restricted" },
];

const LOCATION_OPTIONS = [
  { value: "All", label: "All Locations" },
  { value: "Cabinet A", label: "Cabinet A" },
  { value: "Cabinet B", label: "Cabinet B" },
  { value: "Cabinet C", label: "Cabinet C" },
  { value: "Cabinet D", label: "Cabinet D" },
];

// Helper to map search item to ArchiveDocument for high-res preview modal
function searchResultToArchiveDoc(item: SearchResultItem): ArchiveDocument {
  const parts = (item.shelfLocation || "").split("•").map((p) => p.trim());
  const cabinet = parts[0] || "Cabinet A";
  const shelf = parts[1] || "Shelf 1";
  const folder = parts[2] || item.category;

  const titleLower = item.title.toLowerCase();
  const ext = titleLower.endsWith(".xlsx")
    ? "xlsx"
    : titleLower.endsWith(".docx")
    ? "docx"
    : "pdf";

  return {
    id: item.id,
    title: item.title,
    orderNo: item.orderNo,
    seriesYear: item.seriesYear,
    category: item.category,
    clearance: (item.clearance as DocumentClearance) || "Public",
    cabinet,
    shelf,
    folder,
    shelfLocation: item.shelfLocation,
    ocrAccuracy: 98.4,
    fileSize: item.fileSize || "2.4 MB",
    pageCount: item.pageCount || 16,
    fileType: ext,
    fileName: `${item.orderNo}.${ext}`,
    version: "v1.0",
    ingestedDate: item.ingestedDate || "2024-08-28",
    status: "Archived",
    tags: (item.tags || []).map((t) => ({ name: t, score: 0.95 })),
    summary: item.summary || item.excerptSnippet,
  };
}

export default function SmartSearchPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("smart");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [selectedClearance, setSelectedClearance] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewLayout, setViewLayout] = useState<"cards" | "split">("cards");
  const [forceBrowseAll, setForceBrowseAll] = useState(false);

  // Loading & Preview States
  const [isLoading, setIsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);

  // In-Place AI Document Assistant Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiTargetDoc, setAiTargetDoc] = useState<SearchResultItem | null>(null);

  // Keyboard shortcut Ctrl+K or / to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenAiDrawer = (item: SearchResultItem) => {
    setAiTargetDoc(item);
    setIsAiDrawerOpen(true);
  };

  const handleOpenPreview = (item: SearchResultItem) => {
    const mapped = searchResultToArchiveDoc(item);
    setPreviewDoc(mapped);
    if (typeof item.id === "number") {
      getDocument(item.id)
        .then((fresh) => {
          setPreviewDoc(apiDocumentToArchive(fresh));
        })
        .catch(() => {
          /* keep fallback mapped */
        });
    }
  };

  // Perform search (client filtering with backend integration fallback)
  const executeSearch = (queryText: string) => {
    setIsLoading(true);
    setSubmittedQuery(queryText);
    setForceBrowseAll(false);

    // Attempt to query backend if authenticated; otherwise fallback cleanly
    api
      .get(`/documents/search?q=${encodeURIComponent(queryText)}`)
      .catch(() => null)
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 280);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setForceBrowseAll(false);
  };

  const handleApplySuggestion = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedFileType("All");
    setSelectedClearance("All");
    setSelectedLocation("All");
    setSortBy("relevance");
    setSearchQuery("");
    setSubmittedQuery("");
    setForceBrowseAll(false);
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedFileType !== "All" ||
    selectedClearance !== "All" ||
    selectedLocation !== "All" ||
    sortBy !== "relevance" ||
    Boolean(submittedQuery.trim()) ||
    Boolean(searchQuery.trim());

  // Filter and rank search results
  const filteredResults = useMemo(() => {
    const rawQuery = (submittedQuery || searchQuery).trim().toLowerCase();
    const queryTokens = rawQuery
      .split(/\s+/)
      .filter((token) => token.length > 0);

    return SAMPLE_SEARCH_DOCUMENTS.map((item) => {
      let score = item.relevanceScore || 0.7;

      if (queryTokens.length > 0) {
        if (searchMode === "keyword") {
          // Exact keyword matching across searchable fields
          const titleMatches = queryTokens.filter((token) =>
            item.title.toLowerCase().includes(token)
          ).length;
          const orderMatches = queryTokens.filter((token) =>
            item.orderNo.toLowerCase().includes(token)
          ).length;
          const snippetMatches = queryTokens.filter((token) =>
            item.excerptSnippet.toLowerCase().includes(token)
          ).length;
          const categoryMatches = queryTokens.filter((token) =>
            item.category.toLowerCase().includes(token)
          ).length;
          const tagMatches = (item.tags || []).filter((tag) =>
            queryTokens.some((token) => tag.toLowerCase().includes(token))
          ).length;

          const totalHits =
            titleMatches * 4 +
            orderMatches * 5 +
            categoryMatches * 2 +
            tagMatches * 2 +
            snippetMatches;

          score = totalHits > 0 ? Math.min(0.99, 0.6 + totalHits * 0.08) : 0;
        } else {
          // Smart Search: Topic and conceptual relevance scoring
          const fullContent = `${item.title} ${item.excerptSnippet} ${
            item.summary || ""
          } ${item.tags?.join(" ") || ""}`.toLowerCase();

          const matchedTokenCount = queryTokens.filter((token) =>
            fullContent.includes(token)
          ).length;

          if (matchedTokenCount > 0) {
            score = Math.min(
              0.99,
              0.75 + (matchedTokenCount / queryTokens.length) * 0.24
            );
          } else {
            score = Math.max(0.65, (item.relevanceScore || 0.7) - 0.15);
          }
        }
      }

      return {
        ...item,
        relevanceScore: score,
      };
    })
      .filter((item) => {
        // Filter out items with 0 score in keyword mode when query exists
        if (
          searchMode === "keyword" &&
          queryTokens.length > 0 &&
          (item.relevanceScore || 0) <= 0
        ) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }

        // File Type filter
        if (selectedFileType !== "All") {
          const tLower = item.title.toLowerCase();
          if (selectedFileType === "xlsx" && !tLower.endsWith(".xlsx")) return false;
          if (selectedFileType === "docx" && !tLower.endsWith(".docx")) return false;
          if (selectedFileType === "pdf" && (tLower.endsWith(".xlsx") || tLower.endsWith(".docx"))) return false;
        }

        // Clearance filter
        if (selectedClearance !== "All" && item.clearance !== selectedClearance) {
          return false;
        }

        // Location filter
        if (
          selectedLocation !== "All" &&
          !item.shelfLocation.includes(selectedLocation)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "relevance") {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        if (sortBy === "newest") {
          return Number(b.seriesYear) - Number(a.seriesYear);
        }
        if (sortBy === "oldest") {
          return Number(a.seriesYear) - Number(b.seriesYear);
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    submittedQuery,
    searchQuery,
    searchMode,
    selectedCategory,
    selectedFileType,
    selectedClearance,
    selectedLocation,
    sortBy,
  ]);

  // Determine if Zero State should be rendered
  const isZeroState =
    !submittedQuery.trim() &&
    !searchQuery.trim() &&
    selectedCategory === "All" &&
    selectedFileType === "All" &&
    selectedClearance === "All" &&
    selectedLocation === "All" &&
    !forceBrowseAll;

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Content Workspace */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            width: "100%",
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
            px: { xs: 2, sm: 3 },
            pb: 4,
            pt: { xs: 8, md: 1.5 },
          })}
        >
          {/* Top Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Clean Page Title Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Smart Document Search
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
                Query administrative directives, treasury guidelines, and municipal records by topic or keyword.
              </Typography>
            </Box>

            {/* View Mode Switcher */}
            <ToggleButtonGroup
              value={viewLayout}
              exclusive
              onChange={(_, next) => next && setViewLayout(next)}
              size="small"
              aria-label="View layout switcher"
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 1.5,
                  py: 0.4,
                  px: 1.2,
                  height: 32,
                  fontSize: "0.78rem",
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tooltip title="Feed View (Cards)">
                <ToggleButton value="cards" aria-label="Feed View">
                  <ViewStreamRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Cards
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Split-Pane Reader">
                <ToggleButton value="split" aria-label="Split-Pane Reader">
                  <VerticalSplitRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Split Reader
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          {/* Clean Main Search Command Box */}
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              mb: 3,
              bgcolor: "background.paper",
            }}
          >
            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.25,
                  mb: 1.75,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  fullWidth
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMode === "smart"
                      ? "Search by topic or inquiry (e.g. 'How are delinquent property tax surcharges applied?')..."
                      : "Search by exact keywords or directive order number (e.g. 'BLGF-DO-2024-018')..."
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchQuery && (
                            <IconButton size="small" onClick={handleClearSearch} sx={{ p: 0.5, mr: 0.5 }}>
                              <ClearRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                          <Chip
                            label="Ctrl+K"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                              color: "text.disabled",
                              display: { xs: "none", md: "inline-flex" },
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      fontSize: "0.92rem",
                      height: 44,
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{
                    px: 3.5,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    minWidth: { xs: "100%", sm: "130px" },
                    height: 44,
                    whiteSpace: "nowrap",
                  }}
                >
                  Search
                </Button>
              </Box>
            </form>

            {/* Mode Selector & Popular Queries */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 2,
              }}
            >
              {/* Search Mode Pill */}
              <ToggleButtonGroup
                value={searchMode}
                exclusive
                onChange={(_, next) => next && setSearchMode(next)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    px: 1.5,
                    py: 0.4,
                    height: 32,
                  },
                }}
              >
                <ToggleButton value="smart">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 15, mr: 0.75, color: "#EC4899" }} />
                  Smart Mode
                </ToggleButton>
                <ToggleButton value="keyword">
                  <TextFieldsRoundedIcon sx={{ fontSize: 15, mr: 0.75 }} />
                  Keyword Mode
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Suggestions Chips */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Suggestions:
                </Typography>
                {POPULAR_QUERIES.map((query) => (
                  <Chip
                    key={query}
                    label={query}
                    size="small"
                    onClick={() => handleApplySuggestion(query)}
                    sx={{
                      fontSize: "0.74rem",
                      height: 24,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      border: "none",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.selected",
                        color: "primary.main",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Agile Facet Filter Ribbon */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {/* Category Dropdown */}
                <FormControl size="small" sx={{ minWidth: 165 }}>
                  <InputLabel id="category-select-label" sx={{ fontSize: "0.8rem" }}>
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Category"
                    onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
                    sx={{ borderRadius: 1.5, fontSize: "0.8rem", height: 34 }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* File Type Filter Chips */}
                <ToggleButtonGroup
                  value={selectedFileType}
                  exclusive
                  onChange={(_, next) => next && setSelectedFileType(next)}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.76rem",
                      px: 1.25,
                      height: 34,
                    },
                  }}
                >
                  <ToggleButton value="All">All Formats</ToggleButton>
                  <ToggleButton value="pdf">
                    <PictureAsPdfRoundedIcon sx={{ fontSize: 14, mr: 0.5, color: "#EF4444" }} />
                    PDF
                  </ToggleButton>
                  <ToggleButton value="xlsx">
                    <TableChartRoundedIcon sx={{ fontSize: 14, mr: 0.5, color: "#10B981" }} />
                    Excel
                  </ToggleButton>
                  <ToggleButton value="docx">
                    <ArticleRoundedIcon sx={{ fontSize: 14, mr: 0.5, color: "#3B82F6" }} />
                    Word
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Clearance Dropdown */}
                <FormControl size="small" sx={{ minWidth: 135 }}>
                  <InputLabel id="clearance-select-label" sx={{ fontSize: "0.8rem" }}>
                    Clearance
                  </InputLabel>
                  <Select
                    labelId="clearance-select-label"
                    value={selectedClearance}
                    label="Clearance"
                    onChange={(e: SelectChangeEvent) => setSelectedClearance(e.target.value)}
                    sx={{ borderRadius: 1.5, fontSize: "0.8rem", height: 34 }}
                  >
                    {CLEARANCE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Location Dropdown */}
                <FormControl size="small" sx={{ minWidth: 135 }}>
                  <InputLabel id="location-select-label" sx={{ fontSize: "0.8rem" }}>
                    Cabinet
                  </InputLabel>
                  <Select
                    labelId="location-select-label"
                    value={selectedLocation}
                    label="Cabinet"
                    onChange={(e: SelectChangeEvent) => setSelectedLocation(e.target.value)}
                    sx={{ borderRadius: 1.5, fontSize: "0.8rem", height: 34 }}
                  >
                    {LOCATION_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort By Dropdown */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="sort-select-label" sx={{ fontSize: "0.8rem" }}>
                    Sort by
                  </InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={sortBy}
                    label="Sort by"
                    onChange={(e: SelectChangeEvent) => setSortBy(e.target.value as SortOption)}
                    sx={{ borderRadius: 1.5, fontSize: "0.8rem", height: 34 }}
                  >
                    <MenuItem value="relevance" sx={{ fontSize: "0.8rem" }}>
                      Most Relevant
                    </MenuItem>
                    <MenuItem value="newest" sx={{ fontSize: "0.8rem" }}>
                      Newest First
                    </MenuItem>
                    <MenuItem value="oldest" sx={{ fontSize: "0.8rem" }}>
                      Oldest First
                    </MenuItem>
                    <MenuItem value="title" sx={{ fontSize: "0.8rem" }}>
                      Title (A-Z)
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <Button
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      fontSize: "0.78rem",
                      textTransform: "none",
                      color: "text.secondary",
                      borderRadius: 1.5,
                      height: 34,
                    }}
                  >
                    Reset
                  </Button>
                )}
              </Stack>

              {/* Result Count Indicator */}
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                {filteredResults.length} {filteredResults.length === 1 ? "document" : "documents"} found
              </Typography>
            </Box>
          </Paper>

          {/* Results Area */}
          {isLoading ? (
            <SmartSearchSkeleton count={3} />
          ) : isZeroState ? (
            /* Interactive Zero State with Categories & Query Tips */
            <SearchZeroState
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setForceBrowseAll(true);
              }}
              onApplyQuery={(q) => handleApplySuggestion(q)}
              onBrowseAll={() => setForceBrowseAll(true)}
            />
          ) : (
            <Box sx={{ width: "100%" }}>
              {/* Mayumi AI Executive Synthesis (Active in Smart Mode when query exists) */}
              {searchMode === "smart" && (submittedQuery || searchQuery) && (
                <MayumiAiSynthesisCard
                  searchQuery={submittedQuery || searchQuery}
                  results={filteredResults}
                  onPreviewDocument={(item) => handleOpenPreview(item)}
                  onAskAi={(item) => handleOpenAiDrawer(item)}
                  onApplyFollowUpQuery={(q) => handleApplySuggestion(q)}
                />
              )}

              {/* Document Results (Feed View vs Split View) */}
              {filteredResults.length > 0 ? (
                viewLayout === "cards" ? (
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    {filteredResults.map((item) => (
                      <SmartSearchResultCard
                        key={item.id}
                        item={item}
                        searchQuery={submittedQuery || searchQuery}
                        isSmartMode={searchMode === "smart"}
                        onPreview={(doc) => handleOpenPreview(doc)}
                        onAskAi={(doc) => handleOpenAiDrawer(doc)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <SearchSplitPaneView
                    results={filteredResults}
                    searchQuery={submittedQuery || searchQuery}
                    isSmartMode={searchMode === "smart"}
                    onPreview={(doc) => handleOpenPreview(doc)}
                    onAskAi={(doc) => handleOpenAiDrawer(doc)}
                  />
                )
              ) : (
                /* Clean Empty Search State */
                <Paper
                  variant="outlined"
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: 2,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <SearchRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    No matching documents found
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", mb: 2.5 }}
                  >
                    We couldn't find records matching your query and active filters. Try broadening your keywords, switching between Smart and Keyword search, or resetting filters.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
                  >
                    Reset Search & Filters
                  </Button>
                </Paper>
              )}
            </Box>
          )}

          {/* Unified High-Resolution Document Reader Preview Modal */}
          <DocumentPreviewModal
            document={previewDoc}
            open={Boolean(previewDoc)}
            onClose={() => setPreviewDoc(null)}
            onAskMayumi={(doc) => {
              setPreviewDoc(null);
              handleOpenAiDrawer(doc as any);
            }}
          />

          {/* AI Document Assistant Drawer (In-Place Analysis without navigation) */}
          <DocumentAiDrawer
            open={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            document={aiTargetDoc}
          />
        </Box>
      </Box>
    </AppTheme>
  );
}
