"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import GoogleIcon from "@mui/icons-material/Google";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useAuth } from "@/context/AuthContext";
import { GoogleDriveAccountMeta } from "./types";

interface GoogleDriveSyncBannerProps {
  driveMeta: GoogleDriveAccountMeta;
  onToggleConnect: () => void;
  onSyncAll: () => Promise<void>;
  isSyncingAll: boolean;
  syncedCount: number;
  totalCount: number;
}

export default function GoogleDriveSyncBanner({
  driveMeta,
  onToggleConnect,
  onSyncAll,
  isSyncingAll,
  syncedCount,
  totalCount,
}: GoogleDriveSyncBannerProps) {
  const { user } = useAuth();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const isConnected = driveMeta.isConnected;
  const userEmail = driveMeta.email || user?.google_email || user?.email || "user@organization.gov";

  return (
    <>
      <Card
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 3,
          borderColor: isConnected ? "primary.main" : "divider",
          bgcolor: theme.vars
            ? isConnected
              ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.03)`
              : "background.paper"
            : "background.paper",
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)",
          position: "relative",
          overflow: "hidden",
        })}
      >
        {/* Subtle accent bar on top */}
        <Box
          sx={{
            height: 3,
            width: "100%",
            bgcolor: isConnected ? "#4285F4" : "divider",
          }}
        />

        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={{ xs: 2, lg: 3 }}
            sx={{
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: "space-between",
            }}
          >
            {/* Left Column: Brand & Status info */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "flex-start", flex: "1 1 auto" }}
            >
              {/* Google Drive Logo Badge */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}
              >
                <GoogleIcon sx={{ color: isConnected ? "#4285F4" : "#EA4335", fontSize: 26 }} />
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Extended Google Drive Workspace
                  </Typography>

                  {isConnected ? (
                    <Chip
                      size="small"
                      icon={<CloudDoneRoundedIcon sx={{ fontSize: "14px !important" }} />}
                      label="Connected & Synced"
                      color="success"
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Cloud Backup Available"
                      variant="outlined"
                      color="primary"
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                    />
                  )}

                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${syncedCount} of ${totalCount} Files in Drive`}
                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {isConnected ? (
                    <>
                      Linked to Google Account: <strong>{userEmail}</strong> • Destination:{" "}
                      <code>{driveMeta.targetFolder || "My Drive / Intelligent Document Search"}</code>
                    </>
                  ) : (
                    "Connect your Google SSO account to turn this workspace into an extended Google Drive with automatic cloud synchronization and Google Docs/Sheets integration."
                  )}
                </Typography>
              </Box>
            </Stack>

            {/* Middle: Storage Quota Meter (if connected) */}
            {isConnected && (
              <Box
                sx={{
                  minWidth: { xs: "100%", md: 240 },
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.75,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <StorageRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                      Drive Storage
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {driveMeta.storageUsedFormatted} / {driveMeta.storageTotalFormatted}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={driveMeta.storagePercent || 28}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#4285F4",
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}

            {/* Right: Actions */}
            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={1}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "flex-start", lg: "flex-end" },
              }}
            >
              {isConnected ? (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      isSyncingAll ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CloudSyncRoundedIcon />
                      )
                    }
                    disabled={isSyncingAll}
                    onClick={onSyncAll}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#4285F4",
                      "&:hover": { bgcolor: "#3367D6" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSyncingAll ? "Syncing..." : "Sync All to Drive"}
                  </Button>

                  <Tooltip title="Open Google Drive in new tab">
                    <Button
                      variant="outlined"
                      size="small"
                      component="a"
                      href="https://drive.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Drive
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GoogleIcon />}
                  onClick={() => setConnectModalOpen(true)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#4285F4",
                    "&:hover": { bgcolor: "#3367D6" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Connect Google Drive
                </Button>
              )}

              {/* Development / Testing Quick Switcher */}
              <Tooltip title="Switch between Google SSO Connected & Local mode for testing">
                <Button
                  size="small"
                  variant="text"
                  onClick={onToggleConnect}
                  sx={{
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isConnected ? "Simulate Disconnect" : "Simulate Connect"}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Connect Modal */}
      <Dialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          <GoogleIcon sx={{ color: "#4285F4" }} />
          Connect Extended Google Drive
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Connecting with Google Single Sign-On grants the workspace permission to create a
            dedicated folder in your Google Drive (<code>Intelligent Document Search / Personal Files</code>).
          </Typography>
          <Alert severity="success" variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleRoundedIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Instant two-way OCR search and cloud backup
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConnectModalOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConnectModalOpen(false);
              onToggleConnect();
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#4285F4",
              "&:hover": { bgcolor: "#3367D6" },
            }}
          >
            Authorize & Connect
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
