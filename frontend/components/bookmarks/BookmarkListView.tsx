"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { BookmarkItem } from "./types";
import { getClearanceColor } from "./BookmarkCard";

interface BookmarkListViewProps {
  items: BookmarkItem[];
  selectedId?: string;
  onSelect: (item: BookmarkItem) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem, e: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export default function BookmarkListView({
  items,
  selectedId,
  onSelect,
  onTogglePin,
  onEditNote,
  onRemove,
}: BookmarkListViewProps) {
  const router = useRouter();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuFile, setActiveMenuFile] = useState<BookmarkItem | null>(null);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, item: BookmarkItem) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setActiveMenuFile(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuFile(null);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ width: 40, py: 1.25 }} />
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              DIRECTIVE & ORDER NO
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              COLLECTION
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              PERSONAL RESEARCH NOTES
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              PHYSICAL SHELF & BARCODE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              DATE SAVED
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <TableRow
                key={item.id}
                hover
                onClick={() => onSelect(item)}
                selected={isSelected}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": { bgcolor: "action.selected" },
                }}
              >
                {/* Pin star */}
                <TableCell sx={{ py: 1, px: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => onTogglePin(item.id, e)}
                    sx={{ color: item.isPinned ? "#F59E0B" : "text.disabled", p: 0.5 }}
                  >
                    {item.isPinned ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
                  </IconButton>
                </TableCell>

                {/* Directive & Order No */}
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ maxWidth: 360 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "text.primary",
                          bgcolor: "action.hover",
                          px: 0.75,
                          py: 0.2,
                          borderRadius: 1,
                        }}
                      >
                        {item.orderNo}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.clearance}
                        color={getClearanceColor(item.clearance)}
                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Collection */}
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    size="small"
                    label={item.collection}
                    color="primary"
                    variant="outlined"
                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                </TableCell>

                {/* Personal Notes */}
                <TableCell sx={{ py: 1, maxWidth: 240 }}>
                  {item.personalNotes ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <NoteAltOutlinedIcon sx={{ fontSize: 16, color: "#D97706", flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {item.personalNotes}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                      No personal notes
                    </Typography>
                  )}
                </TableCell>

                {/* Physical Shelf Coordinates */}
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <PlaceOutlinedIcon sx={{ fontSize: 15, color: "#10B981" }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        {item.shelfLocation.cabinet} • {item.shelfLocation.shelf}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.7rem" }}>
                        {item.shelfLocation.barcode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Date Saved */}
                <TableCell sx={{ py: 1, color: "text.secondary", fontSize: "0.8rem" }}>
                  {item.dateBookmarked}
                </TableCell>

                {/* Action Buttons */}
                <TableCell align="right" sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                    <Tooltip title="Ask AI about this directive">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/chat?directive=${encodeURIComponent(item.orderNo)}`);
                        }}
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                      >
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Locate on physical shelf">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/locator?barcode=${encodeURIComponent(item.shelfLocation.barcode)}`);
                        }}
                        sx={{ color: "text.secondary", "&:hover": { color: "#10B981" } }}
                      >
                        <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>

                    {item.googleDriveLink && (
                      <Tooltip title="Open in Google Drive">
                        <IconButton
                          size="small"
                          component="a"
                          href={item.googleDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: "#4285F4" }}
                        >
                          <GoogleIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, item)}
                      sx={{ color: "text.secondary" }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180 } } }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuFile) onSelect(activeMenuFile);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details Drawer</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            if (activeMenuFile) onEditNote(activeMenuFile, e);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <EditNoteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Personal Notes</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            if (activeMenuFile) onTogglePin(activeMenuFile.id, e);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <StarRoundedIcon fontSize="small" sx={{ color: activeMenuFile?.isPinned ? "text.secondary" : "#F59E0B" }} />
          </ListItemIcon>
          <ListItemText>{activeMenuFile?.isPinned ? "Unpin Directive" : "Pin Directive"}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            if (activeMenuFile) onRemove(activeMenuFile.id, e);
            handleCloseMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove Bookmark</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}
