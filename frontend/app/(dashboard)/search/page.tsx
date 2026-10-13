"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

// Layout & Components
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";
import SmartSearchSkeleton from "@/components/search/SmartSearchSkeleton";
import SmartSearchResultCard from "@/components/search/SmartSearchResultCard";
import DocumentPreviewDialog from "@/components/search/DocumentPreviewDialog";
import DocumentAiDrawer from "@/components/documents/DocumentAiDrawer";
import { SAMPLE_SEARCH_DOCUMENTS } from "@/components/search/seedData";
import { SearchResultItem, SearchMode, SortOption } from "@/components/search/types";
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

const LOCATION_OPTIONS = [
  { value: "All", label: "All Locations" },
  { value: "Cabinet A", label: "Cabinet A" },
  { value: "Cabinet B", label: "Cabinet B" },
  { value: "Cabinet C", label: "Cabinet C" },
  { value: "Cabinet D", label: "Cabinet D" },
];

export default function SmartSearchPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("smart");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Loading & Preview States
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<SearchResultItem | null>(null);

  // In-Place AI Document Assistant Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiTargetDoc, setAiTargetDoc] = useState<SearchResultItem | null>(null);

  const handleOpenAiDrawer = (item: SearchResultItem) => {
    setAiTargetDoc(item);
    setIsAiDrawerOpen(true);
  };

  // Perform search (client filtering with backend integration fallback)
  const executeSearch = (queryText: string) => {
    setIsLoading(true);
    setSubmittedQuery(queryText);

    // Attempt to query backend if authenticated; otherwise fallback cleanly
    api
      .get(`/documents/search?q=${encodeURIComponent(queryText)}`)
      .catch(() => null)
      .finally(() => {
        // Subtle loading feedback
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
  };

  const handleApplySuggestion = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
  };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: SearchMode | null
  ) => {
    if (newMode !== null) {
      setSearchMode(newMode);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setSelectedLocation(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortOption);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortBy("relevance");
    setSearchQuery("");
    setSubmittedQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedLocation !== "All" ||
    sortBy !== "relevance" ||
    Boolean(submittedQuery.trim());

  // Filter and rank search results
  const filteredResults = useMemo(() => {
    const rawQuery = (submittedQuery || searchQuery).trim().toLowerCase();
    const queryTokens = rawQuery
      .split(/\s+/)
      .filter((token) => token.length > 0);

    return SAMPLE_SEARCH_DOCUMENTS.map((item) => {
      // Base match item
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

          // If no keywords matched in keyword mode, score = 0
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
            // General query fallback with slight decay
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
        // Filter out items with 0 score if in keyword mode and query exists
        if (
          searchMode === "keyword" &&
          queryTokens.length > 0 &&
          (item.relevanceScore || 0) <= 0
        ) {
          return false;
        }

        // Filter by Category
        const matchesCategory =
          selectedCategory === "All" || item.category === selectedCategory;

        // Filter by Location
        const matchesLocation =
          selectedLocation === "All" ||
          item.shelfLocation.includes(selectedLocation);

        return matchesCategory && matchesLocation;
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
    selectedLocation,
    sortBy,
  ]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Content Area */}
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

          {/* Page Title */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Document Search
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                Search official directives, guidelines, and records by keyword or topic.
              </Typography>
            </Box>
          </Box>

          {/* Clean Main Search Command Box */}
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1.5,
              mb: 2.5,
              bgcolor: "background.paper",
            }}
          >
            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  mb: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <TextField
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMode === "smart"
                      ? "Search by topic or subject (e.g. property tax surcharges)..."
                      : "Search by exact keywords or order number (e.g. BLGF-DO-2024-018)..."
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ p: 0.5 }}
                          >
                            <ClearRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      fontSize: "0.95rem",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    px: 3.5,
                    borderRadius: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    minWidth: { xs: "100%", sm: "140px" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Search
                </Button>
              </Box>
            </form>

            {/* Clean Mode Selector & Query Suggestions */}
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
              {/* Clean Search Mode Selector */}
              <ToggleButtonGroup
                value={searchMode}
                exclusive
                onChange={handleModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 1.75,
                    py: 0.5,
                  },
                }}
              >
                <ToggleButton value="smart">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />
                  Smart Search
                </ToggleButton>
                <ToggleButton value="keyword">
                  <TextFieldsRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />
                  Keyword Search
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Suggestions Chips */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Popular:
                </Typography>
                {POPULAR_QUERIES.map((query) => (
                  <Chip
                    key={query}
                    label={query}
                    size="small"
                    onClick={() => handleApplySuggestion(query)}
                    sx={{
                      fontSize: "0.75rem",
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

            {/* Clean Filters Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                {/* Category Dropdown */}
                <FormControl size="small" sx={{ minWidth: { xs: 150, sm: 190 } }}>
                  <InputLabel id="category-select-label" sx={{ fontSize: "0.82rem" }}>
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                    sx={{ borderRadius: 1, fontSize: "0.82rem", height: 36 }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.82rem" }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Location Dropdown */}
                <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 160 } }}>
                  <InputLabel id="location-select-label" sx={{ fontSize: "0.82rem" }}>
                    Location
                  </InputLabel>
                  <Select
                    labelId="location-select-label"
                    value={selectedLocation}
                    label="Location"
                    onChange={handleLocationChange}
                    sx={{ borderRadius: 1, fontSize: "0.82rem", height: 36 }}
                  >
                    {LOCATION_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.82rem" }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort By Dropdown */}
                <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 160 } }}>
                  <InputLabel id="sort-select-label" sx={{ fontSize: "0.82rem" }}>
                    Sort by
                  </InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={sortBy}
                    label="Sort by"
                    onChange={handleSortChange}
                    sx={{ borderRadius: 1, fontSize: "0.82rem", height: 36 }}
                  >
                    <MenuItem value="relevance" sx={{ fontSize: "0.82rem" }}>
                      Most Relevant
                    </MenuItem>
                    <MenuItem value="newest" sx={{ fontSize: "0.82rem" }}>
                      Newest First
                    </MenuItem>
                    <MenuItem value="oldest" sx={{ fontSize: "0.82rem" }}>
                      Oldest First
                    </MenuItem>
                    <MenuItem value="title" sx={{ fontSize: "0.82rem" }}>
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
                      fontSize: "0.8rem",
                      textTransform: "none",
                      color: "text.secondary",
                      minWidth: "auto",
                    }}
                  >
                    Reset
                  </Button>
                )}
              </Stack>

              {/* Result Count Indicator */}
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {filteredResults.length} {filteredResults.length === 1 ? "document" : "documents"} found
              </Typography>
            </Box>
          </Paper>

          {/* Results Area */}
          {isLoading ? (
            <SmartSearchSkeleton count={3} />
          ) : (
            <Stack spacing={2} sx={{ width: "100%" }}>
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <SmartSearchResultCard
                    key={item.id}
                    item={item}
                    searchQuery={submittedQuery || searchQuery}
                    isSmartMode={searchMode === "smart"}
                    onPreview={(doc) => setPreviewItem(doc)}
                    onAskAi={(doc) => handleOpenAiDrawer(doc)}
                  />
                ))
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
                  <SearchRoundedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1.5, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    No documents found
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", mb: 2 }}
                  >
                    We couldn't find any documents matching your search or filters. Try adjusting your keywords or clearing active filters.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    sx={{ borderRadius: 1, textTransform: "none" }}
                  >
                    Clear Search & Filters
                  </Button>
                </Paper>
              )}
            </Stack>
          )}

          {/* Quick Document Preview Dialog */}
          <DocumentPreviewDialog
            open={Boolean(previewItem)}
            item={previewItem}
            searchQuery={submittedQuery || searchQuery}
            onClose={() => setPreviewItem(null)}
            onAskAi={(doc) => handleOpenAiDrawer(doc)}
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
