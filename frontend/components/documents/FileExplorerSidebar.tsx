"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import { ArchiveDocument, DocumentFileType } from "./types";

interface FileExplorerSidebarProps {
  documents: ArchiveDocument[];
  selectedCategory: string;
  selectedCabinet: string;
  selectedFileType: string;
  onSelectCategory: (category: string) => void;
  onSelectCabinet: (cabinet: string) => void;
  onSelectFileType: (fileType: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const CATEGORIES = [
  "Assessment Regulations",
  "Treasury Advisories",
  "Legal Opinions",
  "Standard Procedures",
  "Memorandums",
];

const FORMAT_CONFIG: {
  type: DocumentFileType;
  label: string;
  shortLabel: string;
  icon: (color: string) => React.ReactElement;
  color: string;
  bgColor: string;
}[] = [
  {
    type: "pdf",
    label: "PDF Documents (.pdf)",
    shortLabel: "PDF Documents (.pdf)",
    icon: (color) => <PictureAsPdfRoundedIcon sx={{ fontSize: 16, color }} />,
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.08)",
  },
  {
    type: "xlsx",
    label: "Excel Sheets (.xlsx)",
    shortLabel: "Excel Sheets (.xlsx)",
    icon: (color) => <TableChartRoundedIcon sx={{ fontSize: 16, color }} />,
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
  },
  {
    type: "docx",
    label: "Word Documents (.docx)",
    shortLabel: "Word Documents (.docx)",
    icon: (color) => <ArticleRoundedIcon sx={{ fontSize: 16, color }} />,
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.08)",
  },
];

const CABINETS = ["Cabinet A", "Cabinet B", "Cabinet C", "Cabinet D"];

export default function FileExplorerSidebar({
  documents,
  selectedCategory,
  selectedCabinet,
  selectedFileType,
  onSelectCategory,
  onSelectCabinet,
  onSelectFileType,
  isOpen,
  onToggleOpen,
}: FileExplorerSidebarProps) {
  // Folder tree expansion state (default: all open like Google Drive)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach((cat) => {
      initial[cat] = true;
    });
    return initial;
  });

  const [cabinetsOpen, setCabinetsOpen] = useState(false);

  // Compute category file counts and nested document type counts
  const categoryTree = useMemo(() => {
    const data: Record<
      string,
      {
        total: number;
        types: Record<DocumentFileType, number>;
      }
    > = {};

    CATEGORIES.forEach((cat) => {
      data[cat] = {
        total: 0,
        types: { pdf: 0, xlsx: 0, docx: 0 },
      };
    });

    documents.forEach((doc) => {
      if (!data[doc.category]) {
        data[doc.category] = {
          total: 0,
          types: { pdf: 0, xlsx: 0, docx: 0 },
        };
      }
      data[doc.category].total += 1;
      if (doc.fileType && data[doc.category].types[doc.fileType] !== undefined) {
        data[doc.category].types[doc.fileType] += 1;
      }
    });

    return data;
  }, [documents]);

  // Compute cabinet counts
  const cabinetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      counts[doc.cabinet] = (counts[doc.cabinet] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const toggleCategoryExpand = (cat: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  if (!isOpen) {
    return null;
  }

  const isAllSelected =
    selectedCategory === "All" &&
    selectedCabinet === "All" &&
    selectedFileType === "All";

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "100%", sm: 260 },
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
        transition: "width 0.2s ease-in-out",
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FolderOpenRoundedIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
            File Directory
          </Typography>
        </Box>

        <Tooltip title="Hide file directory">
          <IconButton size="small" onClick={onToggleOpen} sx={{ p: 0.5 }}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hierarchical Folder Directory Tree (Google Drive style) */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
        <List component="nav" dense disablePadding>
          {/* Root Level: All Documents */}
          <ListItemButton
            selected={isAllSelected}
            onClick={() => {
              onSelectCategory("All");
              onSelectCabinet("All");
              onSelectFileType("All");
            }}
            sx={{
              borderRadius: 1,
              py: 0.75,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                color: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 30, color: isAllSelected ? "primary.main" : "text.secondary" }}>
              <InsertDriveFileRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.82rem", fontWeight: isAllSelected ? 700 : 500 }}>
                  All Documents
                </Typography>
              }
            />
            <Chip
              label={documents.length}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.68rem",
                fontWeight: 600,
                borderRadius: 1,
                bgcolor: isAllSelected ? "primary.main" : "action.hover",
                color: isAllSelected ? "primary.contrastText" : "text.secondary",
              }}
            />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Section Header */}
          <Box sx={{ px: 1, py: 0.5 }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", color: "text.secondary" }}>
              FOLDERS & FILE TYPES
            </Typography>
          </Box>

          {/* Category Folders with Nested File Type Subfolders */}
          {CATEGORIES.map((cat) => {
            const catData = categoryTree[cat] || { total: 0, types: { pdf: 0, xlsx: 0, docx: 0 } };
            const isCatExpanded = !!expandedCategories[cat];
            const isCatSelected = selectedCategory === cat && selectedFileType === "All";
            const isAnySubfolderInCatSelected = selectedCategory === cat && selectedFileType !== "All";

            return (
              <Box key={cat} sx={{ mb: 0.5 }}>
                {/* Parent Category Folder Row */}
                <ListItemButton
                  selected={isCatSelected}
                  onClick={() => {
                    if (isCatSelected) {
                      toggleCategoryExpand(cat);
                    } else {
                      onSelectCategory(cat);
                      onSelectFileType("All");
                      onSelectCabinet("All");
                      setExpandedCategories((prev) => ({ ...prev, [cat]: true }));
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    py: 0.6,
                    my: 0.2,
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      color: "primary.main",
                    },
                  }}
                >
                  {/* Chevron Toggle */}
                  <Box
                    component="span"
                    onClick={(e) => toggleCategoryExpand(cat, e)}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      mr: 0.5,
                      color: "text.secondary",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    {isCatExpanded ? (
                      <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>

                  {/* Folder Icon */}
                  <ListItemIcon sx={{ minWidth: 26, color: isCatSelected || isAnySubfolderInCatSelected ? "primary.main" : "#EAB308" }}>
                    {isCatExpanded || isCatSelected ? (
                      <FolderOpenRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <FolderRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </ListItemIcon>

                  {/* Folder Name */}
                  <ListItemText
                    primary={
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: isCatSelected ? 700 : isAnySubfolderInCatSelected ? 600 : 500,
                          color: isCatSelected ? "primary.main" : "text.primary",
                        }}
                      >
                        {cat}
                      </Typography>
                    }
                  />

                  {/* Total Category Files Count */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      color: isCatSelected ? "primary.main" : "text.secondary",
                      fontWeight: isCatSelected ? 700 : 500,
                      ml: 0.5,
                    }}
                  >
                    {catData.total}
                  </Typography>
                </ListItemButton>

                {/* Nested Document Type Subfolders Inside This Category */}
                <Collapse in={isCatExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      pl: 2.5,
                      ml: 1.75,
                      borderLeft: "1.5px dashed",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                      py: 0.25,
                    }}
                  >
                    {FORMAT_CONFIG.map((fmt) => {
                      const count = catData.types[fmt.type] || 0;
                      if (count === 0) return null;

                      const isSubfolderSelected =
                        selectedCategory === cat && selectedFileType === fmt.type;

                      return (
                        <ListItemButton
                          key={fmt.type}
                          selected={isSubfolderSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSubfolderSelected) {
                              onSelectFileType("All");
                            } else {
                              onSelectCategory(cat);
                              onSelectFileType(fmt.type);
                              onSelectCabinet("All");
                            }
                          }}
                          sx={{
                            borderRadius: 1,
                            py: 0.45,
                            px: 1,
                            "&.Mui-selected": {
                              bgcolor: fmt.bgColor,
                              border: `1px solid ${alpha(fmt.color, 0.25)}`,
                              color: fmt.color,
                              "&:hover": {
                                bgcolor: fmt.bgColor,
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 22 }}>
                            {fmt.icon(fmt.color)}
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Typography
                                noWrap
                                sx={{
                                  fontSize: "0.76rem",
                                  fontWeight: isSubfolderSelected ? 700 : 500,
                                  color: isSubfolderSelected ? fmt.color : "text.secondary",
                                }}
                              >
                                {fmt.shortLabel}
                              </Typography>
                            }
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: isSubfolderSelected ? 700 : 500,
                              color: isSubfolderSelected ? fmt.color : "text.secondary",
                              bgcolor: isSubfolderSelected ? "transparent" : "action.hover",
                              px: 0.6,
                              py: 0.1,
                              borderRadius: 0.75,
                            }}
                          >
                            {count}
                          </Typography>
                        </ListItemButton>
                      );
                    })}

                    {catData.total === 0 && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.disabled", fontSize: "0.72rem", py: 0.5, pl: 1 }}
                      >
                        No files in folder
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}

          <Divider sx={{ my: 1 }} />

          {/* Optional Physical Filing Cabinets Explorer */}
          <ListItemButton
            onClick={() => setCabinetsOpen(!cabinetsOpen)}
            sx={{
              borderRadius: 1,
              py: 0.5,
              color: "text.secondary",
            }}
          >
            <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
              {cabinetsOpen ? (
                <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", color: "inherit" }}>
                  PHYSICAL CABINETS
                </Typography>
              }
            />
          </ListItemButton>

          <Collapse in={cabinetsOpen} timeout="auto" unmountOnExit>
            <List component="div" dense disablePadding sx={{ pl: 1 }}>
              {CABINETS.map((cab) => {
                const isSelected = selectedCabinet === cab;
                const count = cabinetCounts[cab] || 0;

                return (
                  <ListItemButton
                    key={cab}
                    selected={isSelected}
                    onClick={() => {
                      onSelectCabinet(isSelected ? "All" : cab);
                      onSelectCategory("All");
                      onSelectFileType("All");
                    }}
                    sx={{
                      borderRadius: 1,
                      py: 0.5,
                      my: 0.25,
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                        color: "primary.main",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 26,
                        color: isSelected ? "primary.main" : "text.secondary",
                      }}
                    >
                      <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: isSelected ? 700 : 500 }}>
                          {cab}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        color: isSelected ? "primary.main" : "text.secondary",
                        fontWeight: isSelected ? 700 : 500,
                        ml: 0.5,
                      }}
                    >
                      {count}
                    </Typography>
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Box>
    </Paper>
  );
}
