"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GoogleIcon from "@mui/icons-material/Google";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { PersonalFileItem } from "./types";
import { getFileFormatIcon } from "./PersonalFilesGridView";

interface PersonalFileInspectorDrawerProps {
  open: boolean;
  file: PersonalFileItem | null;
  onClose: () => void;
  onToggleStar: (fileId: string) => void;
  onSyncToDrive: (file: PersonalFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  isDriveConnected: boolean;
}

export default function PersonalFileInspectorDrawer({
  open,
  file,
  onClose,
  onToggleStar,
  onSyncToDrive,
  onDeleteFile,
  isDriveConnected,
}: PersonalFileInspectorDrawerProps) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!file) return null;

  const isSynced = file.isGoogleDriveSynced;

  const handleCopySnippet = () => {
    if (file.extractedTextSnippet) {
      navigator.clipboard.writeText(file.extractedTextSnippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 460 },
            p: 3,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Top Header: Close, Star, Actions */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getFileFormatIcon(file.fileExtension)}
          <Chip
            size="small"
            label={file.category}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, height: 22 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={file.isStarred ? "Remove Star" : "Star file"}>
            <IconButton
              size="small"
              onClick={() => onToggleStar(file.id)}
              sx={{ color: file.isStarred ? "#F59E0B" : "text.secondary" }}
            >
              {file.isStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
            </IconButton>
          </Tooltip>

          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Stack>

      {/* File Title */}
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
        {file.title}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
        {file.fileName} • {file.fileSize}
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={2.5}>
          {/* Extended Google Drive Sync Card */}
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: isSynced ? "#4285F4" : "divider",
              bgcolor: theme.vars
                ? isSynced
                  ? "rgba(66, 133, 244, 0.04)"
                  : `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
                : "action.hover",
            })}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GoogleIcon sx={{ color: "#4285F4", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Google Drive Cloud Link
                </Typography>
              </Box>

              {isSynced ? (
                <Chip
                  size="small"
                  icon={<CloudDoneRoundedIcon sx={{ fontSize: "13px !important" }} />}
                  label="In Drive"
                  color="success"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                />
              ) : (
                <Chip
                  size="small"
                  label="Local Vault Only"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem" }}
                />
              )}
            </Stack>

            {isSynced ? (
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                  This document is synchronized with your Google Drive and available across your
                  authorized Google Workspace devices.
                </Typography>

                <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
                    GOOGLE DRIVE LOCATION
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.78rem" }}>
                    {file.googleDriveFolder || "My Drive / Intelligent Document Search"}
                  </Typography>
                  {file.lastSyncedAt && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                      Last cloud sync: {file.lastSyncedAt}
                    </Typography>
                  )}
                </Box>

                {file.googleDriveWebViewLink && (
                  <Button
                    variant="contained"
                    size="small"
                    component="a"
                    href={file.googleDriveWebViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GoogleIcon />}
                    endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#4285F4",
                      "&:hover": { bgcolor: "#3367D6" },
                    }}
                  >
                    Open in Google Drive / Docs
                  </Button>
                )}
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                  {isDriveConnected
                    ? "This file is currently stored only in your local system vault. Sync it to Google Drive to enable cloud backup and Google Docs editing."
                    : "Connect your Google SSO account to sync this file to your Google Drive automatically."}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudSyncRoundedIcon />}
                  disabled={!isDriveConnected}
                  onClick={() => onSyncToDrive(file)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#4285F4",
                    color: "#4285F4",
                  }}
                >
                  {isDriveConnected ? "Sync to Google Drive" : "Connect Google to Sync"}
                </Button>
              </Stack>
            )}
          </Box>

          {/* OCR & AI Text Extraction */}
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
                : "action.hover",
            })}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                AI Document Intelligence & OCR
              </Typography>
              <Chip
                size="small"
                label={file.ocrStatus === "completed" ? "Indexed" : file.ocrStatus}
                color={file.ocrStatus === "completed" ? "success" : "warning"}
                variant="outlined"
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
              />
            </Stack>

            {file.extractedSummary && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
                  AI EXECUTIVE SUMMARY
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", mt: 0.25, fontSize: "0.82rem" }}>
                  {file.extractedSummary}
                </Typography>
              </Box>
            )}

            {file.extractedTextSnippet && (
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    EXTRACTED TEXT SAMPLE
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleCopySnippet}
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 12 }} />}
                    sx={{ fontSize: "0.68rem", textTransform: "none", p: 0.25 }}
                  >
                    {copiedSnippet ? "Copied!" : "Copy"}
                  </Button>
                </Stack>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "text.primary",
                    lineHeight: 1.4,
                  }}
                >
                  {file.extractedTextSnippet}
                </Box>
              </Box>
            )}
          </Box>

          {/* File Tags */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 1 }}>
              KEYWORDS & TAGS
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {file.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: "0.7rem", height: 22 }} />
              ))}
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Bottom Footer Actions */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteOutlineRoundedIcon />}
          onClick={() => {
            onDeleteFile(file.id);
            onClose();
          }}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Delete
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadRoundedIcon />}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Download
        </Button>
      </Stack>
    </Drawer>
  );
}
