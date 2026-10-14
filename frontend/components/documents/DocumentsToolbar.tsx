"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { alpha } from "@mui/material/styles";
import { Dayjs } from "dayjs";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import Typography from "@mui/material/Typography";

import DocumentDateRangeFilter from "./DocumentDateRangeFilter";
import { DocumentSortOption } from "./types";

interface DocumentsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFileType: string;
  onFileTypeChange: (type: string) => void;
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  onFromDateChange: (date: Dayjs | null) => void;
  onToDateChange: (date: Dayjs | null) => void;
  sortBy: DocumentSortOption;
  onSortChange: (sort: DocumentSortOption) => void;
  isFilterActive: boolean;
  onResetFilters: () => void;
}

export default function DocumentsToolbar({
  searchQuery,
  onSearchChange,
  selectedFileType,
  onFileTypeChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  sortBy,
  onSortChange,
  isFilterActive,
  onResetFilters,
}: DocumentsToolbarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: "background.paper",
        borderColor: "divider",
        mt: 1.5,
        mb: 1.5,
        flexShrink: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: 1.25,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Search Pill + Quick Type Filter Pills */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flex: 1, minWidth: 260 }}>
        <TextField
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search across all folders, files, and orders..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange("")} sx={{ p: 0.25 }}>
                    <ClearRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            width: { xs: "100%", sm: "280px", md: "340px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.84rem",
              height: 36,
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
            },
          }}
        />

        {/* Format Dropdown Selector */}
        <FormControl size="small" sx={{ minWidth: 155, width: { xs: "100%", sm: "auto" } }}>
          <Select
            value={selectedFileType}
            onChange={(e) => onFileTypeChange(e.target.value)}
            displayEmpty
            renderValue={(val) => {
              if (val === "pdf") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PictureAsPdfRoundedIcon sx={{ fontSize: 16, color: "#EF4444" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      PDF (.pdf)
                    </Typography>
                  </Box>
                );
              }
              if (val === "xlsx") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Excel (.xlsx)
                    </Typography>
                  </Box>
                );
              }
              if (val === "docx") {
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ArticleRoundedIcon sx={{ fontSize: 16, color: "#3B82F6" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Word (.docx)
                    </Typography>
                  </Box>
                );
              }
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    All Formats
                  </Typography>
                </Box>
              );
            }}
            sx={{
              borderRadius: 1.5,
              fontSize: "0.82rem",
              height: 36,
              bgcolor: "background.paper",
              "& .MuiSelect-select": {
                py: 0.5,
                fontWeight: 600,
              },
            }}
          >
            <MenuItem value="All" sx={{ fontSize: "0.82rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterListRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <span>All Formats</span>
              </Box>
            </MenuItem>
            <MenuItem value="pdf" sx={{ fontSize: "0.82rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PictureAsPdfRoundedIcon sx={{ fontSize: 16, color: "#EF4444" }} />
                <span>PDF Document (.pdf)</span>
              </Box>
            </MenuItem>
            <MenuItem value="xlsx" sx={{ fontSize: "0.82rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TableChartRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                <span>Excel Spreadsheet (.xlsx)</span>
              </Box>
            </MenuItem>
            <MenuItem value="docx" sx={{ fontSize: "0.82rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ArticleRoundedIcon sx={{ fontSize: 16, color: "#3B82F6" }} />
                <span>Word Document (.docx)</span>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Date Range & Sort Selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", lg: "auto" } }}>
        <DocumentDateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          onClear={() => {
            onFromDateChange(null);
            onToDateChange(null);
          }}
        />

        <FormControl size="small" sx={{ minWidth: 165, width: { xs: "100%", sm: "auto" } }}>
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as DocumentSortOption)}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <SortRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: 1.5,
              fontSize: "0.82rem",
              height: 36,
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

        {isFilterActive && (
          <Button
            size="small"
            onClick={onResetFilters}
            startIcon={<CloseRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontSize: "0.76rem",
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              height: 36,
              px: 1,
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>
    </Paper>
  );
}
