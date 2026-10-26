"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import GoogleIcon from "@mui/icons-material/Google";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { PersonalFileItem } from "./types";

interface PersonalFilesGridViewProps {
  files: PersonalFileItem[];
  selectedFileId: string | null;
  onSelectFile: (file: PersonalFileItem) => void;
  onToggleStar: (fileId: string) => void;
  onSyncToDrive: (file: PersonalFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  isDriveConnected: boolean;
}

export function getFileFormatIcon(ext: string) {
  switch (ext) {
    case "pdf":
      return <PictureAsPdfRoundedIcon sx={{ color: "#EF4444" }} />;
    case "docx":
      return <DescriptionRoundedIcon sx={{ color: "#2563EB" }} />;
    case "xlsx":
      return <TableChartRoundedIcon sx={{ color: "#10B981" }} />;
    case "image":
      return <ImageRoundedIcon sx={{ color: "#8B5CF6" }} />;
    default:
      return <InsertDriveFileRoundedIcon sx={{ color: "#6B7280" }} />;
  }
}

export default function PersonalFilesGridView({
  files,
  selectedFileId,
  onSelectFile,
  onToggleStar,
  onSyncToDrive,
  onDeleteFile,
  isDriveConnected,
}: PersonalFilesGridViewProps) {
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
    return (
      <Box
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <InsertDriveFileRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
          No personal files match your criteria
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400, mx: "auto" }}>
          Try selecting a different filter tab or category, or click &quot;Upload File&quot; to add a new
          document to your personal vault and extended Google Drive.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {files.map((file) => {
          const isSelected = file.id === selectedFileId;
          const isSynced = file.isGoogleDriveSynced;

          return (
            <Card
              key={file.id}
              variant="outlined"
              onClick={() => onSelectFile(file)}
              sx={(theme) => ({
                borderRadius: 2.5,
                borderColor: isSelected ? "primary.main" : "divider",
                borderWidth: isSelected ? 2 : 1,
                bgcolor: "background.paper",
                boxShadow: isSelected
                  ? "0 4px 14px rgba(0,0,0,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  borderColor: isSelected ? "primary.main" : "text.secondary",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              })}
            >
              <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header: File Type Icon, Google Drive Chip, Star, Menu */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getFileFormatIcon(file.fileExtension)}
                    {isSynced ? (
                      <Chip
                        size="small"
                        icon={<GoogleIcon sx={{ fontSize: "12px !important" }} />}
                        label="In Drive"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
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
                        label="Local Vault"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title={file.isStarred ? "Unstar" : "Star file"}>
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
                    </Tooltip>

                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, file)}
                      sx={{ color: "text.secondary", p: 0.5 }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Stack>

                {/* Title */}
                <Tooltip title={file.title}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "text.primary",
                      mb: 0.75,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {file.title}
                  </Typography>
                </Tooltip>

                {/* File preview text container */}
                <Box
                  sx={(theme) => ({
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: theme.vars
                      ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.7)`
                      : "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1.5,
                    flex: 1,
                  })}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: "0.72rem",
                      lineHeight: 1.4,
                      fontStyle: file.extractedSummary ? "normal" : "italic",
                    }}
                  >
                    {file.extractedSummary || "Indexed document for smart search and OCR extraction."}
                  </Typography>
                </Box>

                {/* Metadata Row: Category & Size */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    pt: 0.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.72rem" }}
                  >
                    {file.category} • {file.fileSize}
                  </Typography>

                  {/* Quick Google Drive Action */}
                  {isSynced && file.googleDriveWebViewLink ? (
                    <Tooltip title="Open in Google Drive">
                      <IconButton
                        size="small"
                        component="a"
                        href={file.googleDriveWebViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          p: 0.5,
                          color: "#4285F4",
                          "&:hover": { bgcolor: "rgba(66, 133, 244, 0.08)" },
                        }}
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
                            fontSize: "0.68rem",
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
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

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
    </>
  );
}
