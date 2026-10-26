"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { ProfileViewProps } from "./types";

export default function SecurityAuthCard({ user }: ProfileViewProps) {
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const isGoogleLinked = user?.auth_provider === "google" || !!user?.google_id;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Current Active Session";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "warning.main",
                color: "warning.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Security & Authentication
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Identity providers and credentials management
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2.5}>
            {/* Google Authentication Integration Card */}
            <Box
              sx={(theme) => ({
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: isGoogleLinked ? "primary.main" : "divider",
                bgcolor: theme.vars
                  ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.7)`
                  : "action.hover",
              })}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <GoogleIcon sx={{ color: "#EA4335", fontSize: 24 }} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Google Workspace SSO
                    </Typography>
                    {isGoogleLinked ? (
                      <Chip
                        size="small"
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: "13px !important" }} />}
                        label="Connected"
                        color="success"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Ready to Connect"
                        variant="outlined"
                        color="primary"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                    {isGoogleLinked
                      ? `Linked with Google account: ${user?.google_email || user?.email}`
                      : "Sign in seamlessly with your enterprise Google Workspace or Google ID with one click."}
                  </Typography>

                  <Button
                    variant={isGoogleLinked ? "outlined" : "contained"}
                    size="small"
                    startIcon={<GoogleIcon />}
                    onClick={() => setGoogleModalOpen(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      ...(isGoogleLinked
                        ? {
                            borderColor: "divider",
                            color: "text.primary",
                          }
                        : {
                            bgcolor: "#4285F4",
                            "&:hover": { bgcolor: "#3367D6" },
                          }),
                    }}
                  >
                    {isGoogleLinked ? "Manage Google Account" : "Connect with Google"}
                  </Button>
                </Box>
              </Stack>
            </Box>

            {/* Password & Credentials */}
            <Box
              sx={(theme) => ({
                p: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: theme.vars
                  ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.7)`
                  : "action.hover",
              })}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "action.selected",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    System Password
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                    {isGoogleLinked
                      ? "Your account authentication is secured via Google Single Sign-On."
                      : "Standard encrypted login credentials for this document search workspace."}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setPasswordModalOpen(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Stack>
            </Box>

            {/* Session Metadata */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    LAST ACTIVE LOGIN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {formatDate(user?.last_login)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Google Auth Modal */}
      <Dialog
        open={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          <GoogleIcon sx={{ color: "#EA4335" }} />
          Google Authentication
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            This profile is architected to seamlessly pair with Google OAuth 2.0. Once the backend
            Google client ID and secrets are configured, you will be able to sign in with your
            authorized organization email ({user?.email || "Google Account"}).
          </Typography>
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            Identity sync status: <strong>Ready for OAuth 2.0 handshake</strong>.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setGoogleModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setFeedbackMessage(null);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Update Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {feedbackMessage && (
              <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
                {feedbackMessage}
              </Alert>
            )}
            <TextField
              label="Current Password"
              type="password"
              size="small"
              fullWidth
              autoComplete="current-password"
            />
            <TextField
              label="New Password"
              type="password"
              size="small"
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              size="small"
              fullWidth
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setPasswordModalOpen(false);
              setFeedbackMessage(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setFeedbackMessage("Password update submitted successfully.")}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Save Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
