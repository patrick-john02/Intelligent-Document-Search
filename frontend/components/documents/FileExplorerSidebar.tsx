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
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import { ArchiveDocument, DocumentFileType, ArchiveFolder } from "./types";

interface FileExplorerSidebarProps {
  documents: ArchiveDocument[];
  folders?: ArchiveFolder[];
  currentFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
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

function FolderTreeItem({
  folder,
  allFolders,
  documents,
  currentFolderId,
  onSelectFolder,
  level = 0,
}: {
  folder: ArchiveFolder;
  allFolders: ArchiveFolder[];
  documents: ArchiveDocument[];
  currentFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  level?: number;
}) {
  const childFolders = allFolders.filter((f) => f.parentId === folder.id);
  const directFiles = documents.filter((d) => d.folderId === folder.id);
  const isSelected = currentFolderId === folder.id;
  const hasChildren = childFolders.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box sx={{ mb: 0.25 }}>
      <ListItemButton
        selected={isSelected}
        onClick={() => {
          onSelectFolder?.(folder.id);
        }}
        sx={{
          borderRadius: 1,
          py: 0.5,
          pl: 1 + level * 1.5,
          my: 0.15,
          "&.Mui-selected": {
            bgcolor: "action.selected",
            color: "primary.main",
          },
        }}
      >
        {hasChildren ? (
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
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
            {isOpen ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </Box>
        ) : (
          <Box sx={{ width: 16, mr: 0.5 }} />
        )}

        <ListItemIcon sx={{ minWidth: 24, color: folder.color || "#EAB308" }}>
          {isOpen || isSelected ? (
            <FolderOpenRoundedIcon sx={{ fontSize: 18, color: folder.color || "#EAB308" }} />
          ) : (
            <FolderRoundedIcon sx={{ fontSize: 18, color: folder.color || "#EAB308" }} />
          )}
        </ListItemIcon>

        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? "primary.main" : "text.primary",
              }}
            >
              {folder.name}
            </Typography>
          }
        />

        <Typography
          variant="caption"
          sx={{
            fontSize: "0.68rem",
            color: isSelected ? "primary.main" : "text.secondary",
            fontWeight: isSelected ? 700 : 500,
            ml: 0.5,
          }}
        >
          {directFiles.length}
        </Typography>
      </ListItemButton>

      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ borderLeft: "1.5px dashed", borderColor: "divider", ml: 1.5 + level * 1.5, pl: 0.5 }}>
            {childFolders.map((child) => (
              <FolderTreeItem
                key={child.id}
                folder={child}
                allFolders={allFolders}
                documents={documents}
                currentFolderId={currentFolderId}
                onSelectFolder={onSelectFolder}
                level={level + 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export default function FileExplorerSidebar({
  documents,
  folders,
  currentFolderId,
  onSelectFolder,
  selectedCategory,
  selectedCabinet,
  selectedFileType,
  onSelectCategory,
  onSelectCabinet,
  onSelectFileType,
  isOpen,
  onToggleOpen,
}: FileExplorerSidebarProps) {
  // FOLDERS & FILE TYPES section expansion (default: closed)
  const [foldersOpen, setFoldersOpen] = useState(false);

  // Folder tree expansion state (default: all closed)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [cabinetsOpen, setCabinetsOpen] = useState(false);

  // Dynamic categories list from documents
  const categoriesList = useMemo(() => {
    const fromDocs = Array.from(new Set(documents.map((d) => d.category))).filter(Boolean);
    return fromDocs.length > 0 ? fromDocs : CATEGORIES;
  }, [documents]);

  // Auto-open folders section if a category is currently active
  React.useEffect(() => {
    if (selectedCategory !== "All") {
      setFoldersOpen(true);
    }
  }, [selectedCategory]);

  // Compute category file counts and nested document type counts
  const categoryTree = useMemo(() => {
    const data: Record<
      string,
      {
        total: number;
        types: Record<DocumentFileType, number>;
      }
    > = {};

    categoriesList.forEach((cat) => {
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
  }, [documents, categoriesList]);

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

  const isAllSelected =
    selectedCategory === "All" &&
    selectedCabinet === "All" &&
    selectedFileType === "All";

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: isOpen ? "100%" : 0, sm: isOpen ? 260 : 54 },
        display: { xs: isOpen ? "flex" : "none", sm: "flex" },
        flexShrink: 0,
        height: "100%",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
        transition: "width 0.2s ease-in-out",
      }}
    >
      {!isOpen ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 1.5,
            gap: 1.25,
          }}
        >
          <Tooltip title="Expand File Directory" placement="right">
            <IconButton
              size="small"
              onClick={onToggleOpen}
              aria-label="Expand file directory"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
              }}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider sx={{ width: "65%", my: 0.25 }} />

          {/* Quick Home Icon */}
          <Tooltip title={`Home (${documents.length})`} placement="right">
            <IconButton
              size="small"
              onClick={() => {
                onSelectFolder?.(null);
                onSelectCategory("All");
                onSelectCabinet("All");
                onSelectFileType("All");
              }}
              aria-label="Go to Home"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                ...(isAllSelected && !currentFolderId
                  ? { bgcolor: "action.selected", color: "primary.main" }
                  : { color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }),
              }}
            >
              <HomeRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Quick Folders Icon -> Expands */}
          <Tooltip title="Folders (Click to expand)" placement="right">
            <IconButton
              size="small"
              onClick={onToggleOpen}
              aria-label="Expand folders"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                ...(Boolean(currentFolderId)
                  ? { bgcolor: "action.selected", color: "primary.main" }
                  : { color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }),
              }}
            >
              <FolderRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Quick Cabinets Icon -> Expands */}
          <Tooltip title="Physical Cabinets (Click to expand)" placement="right">
            <IconButton
              size="small"
              onClick={onToggleOpen}
              aria-label="Expand cabinets"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                ...(selectedCabinet !== "All"
                  ? { bgcolor: "action.selected", color: "primary.main" }
                  : { color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }),
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <>
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

            <Tooltip title="Collapse file directory">
              <IconButton size="small" onClick={onToggleOpen} sx={{ p: 0.5 }}>
                <MenuOpenRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Hierarchical Folder Directory Tree (Google Drive style) */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            <List component="nav" dense disablePadding>
              {/* Root Level: Home */}
              <ListItemButton
                selected={isAllSelected && !currentFolderId}
                onClick={() => {
                  onSelectFolder?.(null);
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
                <ListItemIcon sx={{ minWidth: 30, color: isAllSelected && !currentFolderId ? "primary.main" : "text.secondary" }}>
                  <HomeRoundedIcon sx={{ fontSize: 19 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: isAllSelected && !currentFolderId ? 700 : 500 }}>
                      Home
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
                    bgcolor: isAllSelected && !currentFolderId ? "primary.main" : "action.hover",
                    color: isAllSelected && !currentFolderId ? "primary.contrastText" : "text.secondary",
                  }}
                />
              </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Collapsible Section Header (Default: Closed) */}
          <ListItemButton
            onClick={() => setFoldersOpen(!foldersOpen)}
            sx={{
              borderRadius: 1,
              py: 0.5,
              color: "text.secondary",
            }}
          >
            <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
              {foldersOpen ? (
                <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", color: "inherit" }}>
                  FOLDERS & FILE TYPES
                </Typography>
              }
            />
          </ListItemButton>

          <Collapse in={foldersOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 0.5 }}>
              {folders && folders.length > 0 ? (
                folders
                  .filter((f) => f.parentId === null)
                  .map((rootFolder) => (
                    <FolderTreeItem
                      key={rootFolder.id}
                      folder={rootFolder}
                      allFolders={folders}
                      documents={documents}
                      currentFolderId={currentFolderId}
                      onSelectFolder={onSelectFolder}
                      level={0}
                    />
                  ))
              ) : (
                categoriesList.map((cat) => {
                  const catData = categoryTree[cat] || { total: 0, types: { pdf: 0, xlsx: 0, docx: 0 } };
                  const isCatExpanded = !!expandedCategories[cat];
                  const isCatSelected = selectedCategory === cat && selectedFileType === "All";
                  const isAnySubfolderInCatSelected = selectedCategory === cat && selectedFileType !== "All";

                  return (
                    <Box key={cat} sx={{ mb: 0.5 }}>
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

                        <ListItemIcon sx={{ minWidth: 26, color: isCatSelected || isAnySubfolderInCatSelected ? "primary.main" : "#EAB308" }}>
                          {isCatExpanded || isCatSelected ? (
                            <FolderOpenRoundedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <FolderRoundedIcon sx={{ fontSize: 18 }} />
                          )}
                        </ListItemIcon>

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
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })
              )}
            </Box>
          </Collapse>

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
        </>
      )}
    </Paper>
  );
}
