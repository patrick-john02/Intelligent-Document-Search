"use client";

import React, { useState } from "react";
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
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { PersonalFileItem } from "./types";
import { getFileFormatIcon } from "./PersonalFilesGridView";

interface PersonalFilesListViewProps {
  files: PersonalFileItem[];
  selectedFileId: string | null;
  onSelectFile: (file: PersonalFileItem) => void;
  onToggleStar: (fileId: string) => void;
  onSyncToDrive: (file: PersonalFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  isDriveConnected: boolean;
}

export default function PersonalFilesListView({
  files,
  selectedFileId,
  onSelectFile,
  onToggleStar,
  onSyncToDrive,
  onDeleteFile,
  isDriveConnected,
}: PersonalFilesListViewProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuFile, setActiveMenuFile] = useState<PersonalFileItem | null>(null);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, file: PersonalFileItem) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setActiveMenuFile(file);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuFile(null);
  };

  if (files.length === 0) {
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
              FILE NAME & DIRECTIVE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              CATEGORY
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              STORAGE & GOOGLE DRIVE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              SIZE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              LAST MODIFIED
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => {
            const isSelected = file.id === selectedFileId;
            const isSynced = file.isGoogleDriveSynced;

            return (
              <TableRow
                key={file.id}
                hover
                onClick={() => onSelectFile(file)}
                selected={isSelected}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                  },
                }}
              >
                {/* Star icon */}
                <TableCell sx={{ py: 1, px: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(file.id);
                    }}
                    sx={{ color: file.isStarred ? "#F59E0B" : "text.disabled", p: 0.5 }}
                  >
                    {file.isStarred ? (
                      <StarRoundedIcon fontSize="small" />
                    ) : (
                      <StarBorderRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </TableCell>

                {/* Name & format icon */}
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {getFileFormatIcon(file.fileExtension)}
                    </Box>
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          maxWidth: { xs: 200, sm: 300, md: 360 },
                        }}
                      >
                        {file.title}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block" }}>
                        {file.fileName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    size="small"
                    label={file.category}
                    variant="outlined"
                    sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }}
                  />
                </TableCell>

                {/* Google Drive Status */}
                <TableCell sx={{ py: 1 }}>
                  {isSynced ? (
                    <Chip
                      size="small"
                      icon={<GoogleIcon sx={{ fontSize: "12px !important" }} />}
                      label="Synced to Drive"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: "rgba(66, 133, 244, 0.08)",
                        color: "#1976D2",
                        borderColor: "rgba(66, 133, 244, 0.3)",
                      }}
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Local Vault Only"
                      variant="outlined"
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 500, color: "text.secondary" }}
                    />
                  )}
                </TableCell>

                {/* Size */}
                <TableCell sx={{ py: 1, color: "text.secondary", fontSize: "0.82rem" }}>
                  {file.fileSize}
                </TableCell>

                {/* Modified */}
                <TableCell sx={{ py: 1, color: "text.secondary", fontSize: "0.82rem" }}>
                  {file.lastModified}
                </TableCell>

                {/* Action buttons */}
                <TableCell align="right" sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                    {isSynced && file.googleDriveWebViewLink ? (
                      <Tooltip title="Open in Google Drive">
                        <IconButton
                          size="small"
                          component="a"
                          href={file.googleDriveWebViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: "#4285F4" }}
                        >
                          <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          isDriveConnected
                            ? "Sync to Google Drive"
                            : "Connect Google SSO to sync this file"
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            disabled={!isDriveConnected}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSyncToDrive(file);
                            }}
                            sx={{
                              fontSize: "0.7rem",
                              textTransform: "none",
                              fontWeight: 700,
                              py: 0.25,
                              px: 0.75,
                              minWidth: 0,
                            }}
                          >
                            Sync
                          </Button>
                        </span>
                      </Tooltip>
                    )}

                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, file)}
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
            if (activeMenuFile) onSelectFile(activeMenuFile);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details & OCR</ListItemText>
        </MenuItem>

        {activeMenuFile?.isGoogleDriveSynced && activeMenuFile.googleDriveWebViewLink && (
          <MenuItem
            component="a"
            href={activeMenuFile.googleDriveWebViewLink}
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

        {!activeMenuFile?.isGoogleDriveSynced && (
          <MenuItem
            disabled={!isDriveConnected}
            onClick={() => {
              if (activeMenuFile) onSyncToDrive(activeMenuFile);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <CloudSyncRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sync to Google Drive</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (activeMenuFile) onToggleStar(activeMenuFile.id);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            {activeMenuFile?.isStarred ? (
              <StarBorderRoundedIcon fontSize="small" />
            ) : (
              <StarRoundedIcon fontSize="small" sx={{ color: "#F59E0B" }} />
            )}
          </ListItemIcon>
          <ListItemText>{activeMenuFile?.isStarred ? "Remove Star" : "Add Star"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <DownloadRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download File</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeMenuFile) onDeleteFile(activeMenuFile.id);
            handleCloseMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete from Vault</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
}
