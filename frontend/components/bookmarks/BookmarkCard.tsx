"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
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
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { BookmarkItem, ClearanceLevel } from "./types";

interface BookmarkCardProps {
  item: BookmarkItem;
  isSelected?: boolean;
  onSelect: (item: BookmarkItem) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem, e: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export function getClearanceColor(level: ClearanceLevel): "success" | "info" | "warning" | "error" | "default" {
  switch (level) {
    case "Public":
      return "success";
    case "Internal":
      return "info";
    case "Restricted":
      return "warning";
    case "Confidential":
      return "error";
    default:
      return "default";
  }
}

export default function BookmarkCard({
  item,
  isSelected,
  onSelect,
  onTogglePin,
  onEditNote,
  onRemove,
}: BookmarkCardProps) {
  const router = useRouter();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleCopyOrderNo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.orderNo);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/chat?directive=${encodeURIComponent(item.orderNo)}`);
  };

  const handleLocatePhysical = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/locator?barcode=${encodeURIComponent(item.shelfLocation.barcode)}`);
  };

  return (
    <>
      <Card
        variant="outlined"
        onClick={() => onSelect(item)}
        sx={(theme) => ({
          borderRadius: 2.5,
          borderColor: isSelected ? "primary.main" : "divider",
          borderWidth: isSelected ? 2 : 1,
          bgcolor: isSelected ? "action.selected" : "background.paper",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.18s ease-in-out",
          position: "relative",
          boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.03)",
          "&:hover": {
            borderColor: isSelected ? "primary.main" : "text.secondary",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          },
        })}
      >
        <CardContent sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Top Row: Order Number, Year, Collection Pill & Star Pin */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {/* Order Number Monospace Tag */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "text.primary",
                }}
              >
                {item.orderNo}
                <Tooltip title={copiedOrder ? "Copied!" : "Copy Order No"}>
                  <IconButton
                    size="small"
                    onClick={handleCopyOrderNo}
                    sx={{ p: 0.25, color: "text.secondary", "&:hover": { color: "primary.main" } }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Chip
                size="small"
                label={item.seriesYear}
                variant="outlined"
                sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
              />

              <Chip
                size="small"
                label={item.collection}
                color="primary"
                variant="outlined"
                sx={{ height: 22, fontSize: "0.68rem", fontWeight: 600 }}
              />
            </Box>

            {/* Pin and Options */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip title={item.isPinned ? "Unpin directive" : "Pin for quick reference"}>
                <IconButton
                  size="small"
                  onClick={(e) => onTogglePin(item.id, e)}
                  sx={{ color: item.isPinned ? "#F59E0B" : "text.disabled", p: 0.5 }}
                >
                  {item.isPinned ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                </IconButton>
              </Tooltip>

              <IconButton size="small" onClick={handleOpenMenu} sx={{ color: "text.secondary", p: 0.5 }}>
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>

          {/* Title & Clearance */}
          <Box sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
              <Chip
                size="small"
                label={item.clearance}
                color={getClearanceColor(item.clearance)}
                sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {item.category}
              </Typography>
            </Stack>

            <Tooltip title={item.title}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.title}
              </Typography>
            </Tooltip>
          </Box>

          {/* Personal Research Notes Box (Amber callout) */}
          {item.personalNotes ? (
            <Box
              sx={(theme) => ({
                p: 1.25,
                borderRadius: 2,
                bgcolor: theme.vars
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(245, 158, 11, 0.08)",
                border: "1px solid",
                borderColor: "rgba(245, 158, 11, 0.25)",
                mb: 1.5,
              })}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <NoteAltOutlinedIcon sx={{ fontSize: 16, color: "#D97706", mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.personalNotes}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Box
              onClick={(e) => onEditNote(item, e)}
              sx={{
                p: 1,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                mb: 1.5,
                textAlign: "center",
                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                + Add research note or study comment
              </Typography>
            </Box>
          )}

          {/* Physical Custody Tag */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 1.5,
              p: 0.75,
              px: 1,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <PlaceOutlinedIcon sx={{ fontSize: 15, color: "#10B981" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem", flexGrow: 1 }}>
              {item.shelfLocation.cabinet} • {item.shelfLocation.shelf} • {item.shelfLocation.binder}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}
            >
              {item.shelfLocation.barcode}
            </Typography>
          </Box>

          {/* Bottom Shortcuts: Ask AI, Locate Physical, Google Drive */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              mt: "auto",
            }}
          >
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Ask AI Assistant about this directive">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAskAI}
                  startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.7rem",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1,
                    py: 0.25,
                  }}
                >
                  Ask AI
                </Button>
              </Tooltip>

              <Tooltip title="Locate on physical archive shelf">
                <Button
                  size="small"
                  variant="text"
                  onClick={handleLocatePhysical}
                  startIcon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.7rem",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    color: "text.secondary",
                  }}
                >
                  Locate
                </Button>
              </Tooltip>
            </Stack>

            {/* Google Drive Link if present */}
            {item.googleDriveLink && (
              <Tooltip title="Open synced copy in Google Drive">
                <IconButton
                  size="small"
                  component="a"
                  href={item.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ color: "#4285F4", p: 0.5 }}
                >
                  <GoogleIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180 } } }}
      >
        <MenuItem
          onClick={() => {
            onSelect(item);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Intelligence Drawer</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            onEditNote(item, e);
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
            onTogglePin(item.id, e);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <StarRoundedIcon fontSize="small" sx={{ color: item.isPinned ? "text.secondary" : "#F59E0B" }} />
          </ListItemIcon>
          <ListItemText>{item.isPinned ? "Unpin Directive" : "Pin Directive"}</ListItemText>
        </MenuItem>

        {item.googleDriveLink && (
          <MenuItem
            component="a"
            href={item.googleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCloseMenu}
          >
            <ListItemIcon>
              <GoogleIcon sx={{ fontSize: "16px !important", color: "#4285F4" }} />
            </ListItemIcon>
            <ListItemText>Open in Google Drive</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={(e) => {
            onRemove(item.id, e);
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
    </>
  );
}
