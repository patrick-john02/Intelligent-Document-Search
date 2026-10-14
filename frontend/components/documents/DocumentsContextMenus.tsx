"use client";

import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

// Icons
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";

import { ArchiveDocument, ArchiveFolder } from "./types";

interface DocumentContextMenuProps {
  anchorEl: HTMLElement | null;
  document: ArchiveDocument | null;
  onClose: () => void;
  onViewDetails: (doc: ArchiveDocument) => void;
  onAskAi: (doc: ArchiveDocument) => void;
  onCopyText: (text: string, label: string) => void;
  isDeletedMode?: boolean;
  onRestoreDocument?: (doc: ArchiveDocument) => void;
  onDeleteDocument?: (doc: ArchiveDocument) => void;
}

export function DocumentContextMenu({
  anchorEl,
  document: doc,
  onClose,
  onViewDetails,
  onAskAi,
  onCopyText,
  isDeletedMode = false,
  onRestoreDocument,
  onDeleteDocument,
}: DocumentContextMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            minWidth: 190,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.5)"
                : "0 4px 18px rgba(0,0,0,0.1)",
          },
        },
      }}
    >
      <MenuItem
        onClick={() => {
          if (doc) onViewDetails(doc);
          onClose();
        }}
        sx={{ fontSize: "0.82rem", py: 1 }}
      >
        <ListItemIcon>
          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="View Details" />
      </MenuItem>

      <MenuItem
        onClick={() => {
          if (doc) onAskAi(doc);
          onClose();
        }}
        sx={{ fontSize: "0.82rem", py: 1 }}
      >
        <ListItemIcon>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Ask Mayumi AI" />
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        onClick={() => {
          if (doc) onCopyText(doc.orderNo, "Order Number");
        }}
        sx={{ fontSize: "0.82rem", py: 1 }}
      >
        <ListItemIcon>
          <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Copy Order No." />
      </MenuItem>

      <MenuItem
        onClick={() => {
          if (doc) onCopyText(doc.shelfLocation, "Location");
        }}
        sx={{ fontSize: "0.82rem", py: 1 }}
      >
        <ListItemIcon>
          <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Copy Shelf Location" />
      </MenuItem>

      {isDeletedMode && onRestoreDocument && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              if (doc) onRestoreDocument(doc);
              onClose();
            }}
            sx={{ fontSize: "0.82rem", py: 1, color: "warning.dark" }}
          >
            <ListItemIcon sx={{ color: "warning.dark" }}>
              <RestoreFromTrashRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Restore Record" />
          </MenuItem>
        </>
      )}

      {!isDeletedMode && onDeleteDocument && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              if (doc) onDeleteDocument(doc);
              onClose();
            }}
            sx={{ fontSize: "0.82rem", py: 1, color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Soft-Delete Record" />
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

interface FolderContextMenuProps {
  anchorEl: HTMLElement | null;
  folder: ArchiveFolder | null;
  onClose: () => void;
  onOpenFolder: (folder: ArchiveFolder) => void;
  onRenameFolder: (folder: ArchiveFolder) => void;
  onDeleteFolder: (folder: ArchiveFolder) => void;
  isDeletedMode?: boolean;
  onRestoreFolder?: (folder: ArchiveFolder) => void;
}

export function FolderContextMenu({
  anchorEl,
  folder,
  onClose,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  isDeletedMode = false,
  onRestoreFolder,
}: FolderContextMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            minWidth: 175,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.5)"
                : "0 4px 18px rgba(0,0,0,0.1)",
          },
        },
      }}
    >
      <MenuItem
        onClick={() => {
          if (folder) onOpenFolder(folder);
          onClose();
        }}
        sx={{ fontSize: "0.82rem", py: 1 }}
      >
        <ListItemIcon>
          <FolderOpenRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
        </ListItemIcon>
        <ListItemText primary="Open Folder" />
      </MenuItem>

      {!isDeletedMode && (
        <>
          <MenuItem
            onClick={() => {
              if (folder) onRenameFolder(folder);
              onClose();
            }}
            sx={{ fontSize: "0.82rem", py: 1 }}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Rename Folder" />
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={() => {
              if (folder) onDeleteFolder(folder);
              onClose();
            }}
            sx={{ fontSize: "0.82rem", py: 1, color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Delete Folder" />
          </MenuItem>
        </>
      )}

      {isDeletedMode && onRestoreFolder && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              if (folder) onRestoreFolder(folder);
              onClose();
            }}
            sx={{ fontSize: "0.82rem", py: 1, color: "warning.dark" }}
          >
            <ListItemIcon sx={{ color: "warning.dark" }}>
              <RestoreFromTrashRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Restore Folder" />
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
