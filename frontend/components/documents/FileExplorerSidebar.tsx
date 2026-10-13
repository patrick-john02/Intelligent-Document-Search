"use client";

import React, { useState } from "react";
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

// Icons
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { ArchiveDocument } from "./types";

interface FileExplorerSidebarProps {
  documents: ArchiveDocument[];
  selectedCategory: string;
  selectedCabinet: string;
  onSelectCategory: (category: string) => void;
  onSelectCabinet: (cabinet: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function FileExplorerSidebar({
  documents,
  selectedCategory,
  selectedCabinet,
  onSelectCategory,
  onSelectCabinet,
  isOpen,
  onToggleOpen,
}: FileExplorerSidebarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [cabinetsOpen, setCabinetsOpen] = useState(false);

  // Compute category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  // Compute cabinet counts
  const cabinetCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      counts[doc.cabinet] = (counts[doc.cabinet] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const categories = [
    "Assessment Regulations",
    "Treasury Advisories",
    "Legal Opinions",
    "Standard Procedures",
    "Memorandums",
  ];

  const cabinets = ["Cabinet A", "Cabinet B", "Cabinet C", "Cabinet D"];

  if (!isOpen) {
    return null;
  }

  const isAllSelected = selectedCategory === "All" && selectedCabinet === "All";

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

      {/* Directory Tree */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
        <List component="nav" dense disablePadding>
          {/* Root: All Documents */}
          <ListItemButton
            selected={isAllSelected}
            onClick={() => {
              onSelectCategory("All");
              onSelectCabinet("All");
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

          {/* Categories Section Header */}
          <ListItemButton
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            sx={{
              borderRadius: 1,
              py: 0.5,
              color: "text.secondary",
            }}
          >
            <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
              {categoriesOpen ? (
                <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", color: "inherit" }}>
                  CATEGORIES
                </Typography>
              }
            />
          </ListItemButton>

          {/* Categories Sub-items */}
          <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
            <List component="div" dense disablePadding sx={{ pl: 1 }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;

                return (
                  <ListItemButton
                    key={cat}
                    selected={isSelected}
                    onClick={() => {
                      onSelectCategory(cat);
                      onSelectCabinet("All");
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
                      {isSelected ? (
                        <FolderOpenRoundedIcon sx={{ fontSize: 17 }} />
                      ) : (
                        <FolderRoundedIcon sx={{ fontSize: 17 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: isSelected ? 700 : 500 }}>
                          {cat}
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

          <Divider sx={{ my: 1 }} />

          {/* Cabinets Section Header */}
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
                  CABINETS
                </Typography>
              }
            />
          </ListItemButton>

          {/* Cabinets Sub-items */}
          <Collapse in={cabinetsOpen} timeout="auto" unmountOnExit>
            <List component="div" dense disablePadding sx={{ pl: 1 }}>
              {cabinets.map((cab) => {
                const isSelected = selectedCabinet === cab;
                const count = cabinetCounts[cab] || 0;

                return (
                  <ListItemButton
                    key={cab}
                    selected={isSelected}
                    onClick={() => {
                      onSelectCabinet(cab);
                      onSelectCategory("All");
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
