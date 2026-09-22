"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Layout & Navigation
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";
import SmartSearchSkeleton from "@/components/search/SmartSearchSkeleton";
import SmartSearchResultCard, {
  SmartSearchResultItem,
} from "@/components/search/SmartSearchResultCard";

// Sample Seed Directives for the Intelligent Archive
const SAMPLE_SEARCH_RESULTS: SmartSearchResultItem[] = [
  {
    id: 1,
    title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    relevanceScore: 0.984,
    shelfLocation: "Cabinet A • Shelf 2",
    excerptSnippet:
      "...Section 4.1 Delinquent Assessment Penalties: Municipal treasurers shall enforce the revised 2% monthly surcharges on unremitted real property taxes, with a statutory maximum ceiling of 72 months from the date of final notice...",
    fileSize: "4.8 MB",
    pageCount: 28,
  },
  {
    id: 2,
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    relevanceScore: 0.927,
    shelfLocation: "Cabinet B • Shelf 1",
    excerptSnippet:
      "...All municipal and provincial collection offices within Region II are directed to integrate electronic treasury receipting systems with the Central Archival and Ingestion node by Q4 2024 to ensure automated compliance auditing...",
    fileSize: "2.3 MB",
    pageCount: 16,
  },
  {
    id: 3,
    title: "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities",
    orderNo: "LO-R2-2023-042",
    seriesYear: 2023,
    category: "Legal Opinions",
    clearance: "Internal",
    relevanceScore: 0.885,
    shelfLocation: "Cabinet C • Shelf 4",
    excerptSnippet:
      "...Pursuant to the Local Government Code of 1991, local government units retain the authority to levy franchise tax on businesses enjoying a legislative franchise, unless an explicit statutory exemption is provided by national charter...",
    fileSize: "1.7 MB",
    pageCount: 9,
  },
  {
    id: 4,
    title: "Standard Operating Procedure for Physical Document Ingestion and OCR Scanning",
    orderNo: "SOP-DOC-2024-001",
    seriesYear: 2024,
    category: "Standard Procedures",
    clearance: "Internal",
    relevanceScore: 0.812,
    shelfLocation: "Cabinet A • Shelf 1",
    excerptSnippet:
      "...Upon physical intake at the records division, documents must receive a barcode tracking tag indicating Cabinet and Shelf coordinates before high-speed multi-page digitizing and vector embedding generation...",
    fileSize: "3.1 MB",
    pageCount: 22,
  },
];

// Aesthetic curated query suggestions
const POPULAR_QUERIES = [
  "Delinquent property tax penalties",
  "Treasury electronic receipting",
  "Municipal franchise tax exemptions",
  "Physical intake and OCR scanning",
];

const CATEGORY_OPTIONS = [
  { value: "All", label: "All Categories" },
  { value: "Assessment Regulations", label: "Assessment Regulations" },
  { value: "Treasury Advisories", label: "Treasury Advisories" },
  { value: "Legal Opinions", label: "Legal Opinions" },
  { value: "Standard Procedures", label: "Standard Procedures" },
];

const CABINET_OPTIONS = [
  { value: "All", label: "All Cabinets" },
  { value: "Cabinet A", label: "Cabinet A" },
  { value: "Cabinet B", label: "Cabinet B" },
  { value: "Cabinet C", label: "Cabinet C" },
];

export default function SmartSearchPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("delinquent property assessment penalties");
  const [isSemanticMode, setIsSemanticMode] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCabinet, setSelectedCabinet] = useState<string>("All");

  // Skeleton / Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleApplySuggestion = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 550);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleCabinetChange = (event: SelectChangeEvent) => {
    setSelectedCabinet(event.target.value);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedCabinet("All");
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedCabinet !== "All";

  // Filter items based on category and cabinet
  const filteredResults = SAMPLE_SEARCH_RESULTS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesCabinet =
      selectedCabinet === "All" || item.shelfLocation.includes(selectedCabinet);
    return matchesCategory && matchesCabinet;
  });

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Workspace - Maximized Space */}
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
          {/* Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Title Bar */}
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
              mb: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Smart Search
                </Typography>
                <Chip
                  label={isSemanticMode ? "Semantic Search" : "Exact Metadata Match"}
                  size="small"
                  color={isSemanticMode ? "primary" : "default"}
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20, borderRadius: 1 }}
                />
              </Box>
              {/* <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Search official archival records by conceptual topic, policy queries, or exact directive numbers.
              </Typography> */}
            </Box>
          </Box>

          {/* Full Width Workspace Container */}
          <Box sx={{ width: "100%" }}>

            {/* 2. Unified Search & Filter Command Bar */}
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1,
                mb: 2.5,
                bgcolor: "background.paper",
                width: "100%",
              }}
            >
              {/* Primary Search Input Row */}
              <form onSubmit={handleSearchSubmit}>
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                  <TextField
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isSemanticMode
                        ? "Describe a subject, rule, or concept (e.g. 'penalty surcharges on late land tax declaration')..."
                        : "Enter exact Directive No. (e.g. BLGF-DO-2024-018) or keyword..."
                    }
                    slotProps={{
                      input: {
                        endAdornment: searchQuery ? (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              onClick={handleClearSearch}
                              sx={{
                                minWidth: "auto",
                                p: "2px 8px",
                                fontSize: "0.75rem",
                                borderRadius: 1,
                                textTransform: "none",
                              }}
                            >
                              Clear
                            </Button>
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
                      px: 4,
                      borderRadius: 1,
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "none",
                      minWidth: { xs: "100%", sm: "150px" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Search Archive
                  </Button>
                </Box>
              </form>

              {/* Aesthetic Query Suggestions (Single-line micro-pills) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 2,
                  pt: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  Suggestions:
                </Typography>
                {POPULAR_QUERIES.map((query) => (
                  <Chip
                    key={query}
                    label={query}
                    size="small"
                    onClick={() => handleApplySuggestion(query)}
                    sx={{
                      fontSize: "0.72rem",
                      height: 22,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "action.selected",
                        color: "primary.main",
                      },
                    }}
                  />
                ))}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Aesthetic Filter & Control Toolbar: Dropdowns on Left, Switches on Right */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {/* Left Controls: Category & Cabinet Dropdowns */}
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                  {/* Category Dropdown */}
                  <FormControl size="small" sx={{ minWidth: { xs: 160, sm: 200 } }}>
                    <InputLabel id="category-select-label" sx={{ fontSize: "0.82rem" }}>
                      Category
                    </InputLabel>
                    <Select
                      labelId="category-select-label"
                      id="category-select"
                      value={selectedCategory}
                      label="Category"
                      onChange={handleCategoryChange}
                      sx={{
                        borderRadius: 1,
                        fontSize: "0.82rem",
                        height: 36,
                      }}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.82rem" }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Physical Cabinet Dropdown */}
                  <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 170 } }}>
                    <InputLabel id="cabinet-select-label" sx={{ fontSize: "0.82rem" }}>
                      Physical Cabinet
                    </InputLabel>
                    <Select
                      labelId="cabinet-select-label"
                      id="cabinet-select"
                      value={selectedCabinet}
                      label="Physical Cabinet"
                      onChange={handleCabinetChange}
                      sx={{
                        borderRadius: 1,
                        fontSize: "0.82rem",
                        height: 36,
                      }}
                    >
                      {CABINET_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.82rem" }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Reset Filters Link */}
                  {hasActiveFilters && (
                    <Button
                      size="small"
                      onClick={handleResetFilters}
                      sx={{
                        fontSize: "0.78rem",
                        textTransform: "none",
                        color: "text.secondary",
                        minWidth: "auto",
                        p: "4px 8px",
                      }}
                    >
                      Reset Filters
                    </Button>
                  )}
                </Stack>

                {/* Right Controls: Mode Switch & Skeleton Preview Switch */}
                <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  {/* Semantic AI Search Mode Switch */}
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={isSemanticMode}
                        onChange={(e) => setIsSemanticMode(e.target.checked)}
                        color="primary"
                        sx={{
                          "& .MuiSwitch-thumb": { borderRadius: 1 },
                          "& .MuiSwitch-track": { borderRadius: 1 },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.2 }}>
                          Semantic AI Search
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                          {isSemanticMode ? "Conceptual Vector Matching" : "Exact Text Keyword"}
                        </Typography>
                      </Box>
                    }
                    sx={{ mr: 0 }}
                  />

                  <Divider orientation="vertical" flexItem sx={{ height: 28, my: "auto", display: { xs: "none", sm: "block" } }} />

                  
                </Stack>
              </Box>
            </Paper>

            {/* 3. Results Section (Maximized Space, sm corners) */}
            {isLoading ? (
              /* SKELETON DESIGN LAYOUT */
              <SmartSearchSkeleton count={3} />
            ) : (
              /* RENDERED RESULTS LIST */
              <Stack spacing={2} sx={{ width: "100%" }}>
                {/* Results Metrics Bar */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 0.5,
                    py: 0.5,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Showing {filteredResults.length} Relevant Directives
                    </Typography>
                  </Box>
                </Box>

                {/* Render Result Cards */}
                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <SmartSearchResultCard
                      key={item.id}
                      item={item}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  /* Empty State */
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 1,
                      borderColor: "divider",
                      width: "100%",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      No matching directives found
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 500, mx: "auto", mt: 0.5 }}>
                      No documents match your active category or cabinet filters. Try resetting the filters or modifying your query.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
