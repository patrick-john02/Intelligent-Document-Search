"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import GoogleIcon from "@mui/icons-material/Google";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { ROLE_CONFIGS } from "@/components/dashboard/types";
import { ProfileViewProps } from "./types";

export default function ProfileHeaderCard({ user, effectiveRole }: ProfileViewProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const roleConfig = ROLE_CONFIGS[effectiveRole];

  const fullName = user
    ? [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ")
    : "System User";

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "U";

  const isGoogleLinked = user?.auth_provider === "google" || !!user?.google_id;

  const handleCopyEmployeeId = () => {
    if (user?.employee_number) {
      navigator.clipboard.writeText(user.employee_number);
      setCopySuccess(true);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 3,
          borderColor: "divider",
          background: theme.vars
            ? `linear-gradient(135deg, ${theme.vars.palette.background.paper} 0%, ${theme.vars.palette.action.hover} 100%)`
            : "background.paper",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          overflow: "visible",
        })}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2.5, sm: 3.5 }}
            sx={{
              alignItems: { xs: "center", md: "flex-start" },
              justifyContent: "space-between",
            }}
          >
            {/* Left: Avatar & Identity Details */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{
                alignItems: { xs: "center", sm: "flex-start" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={user?.picture || user?.avatar_url}
                  alt={fullName}
                  sx={{
                    width: 96,
                    height: 96,
                    fontSize: "2rem",
                    fontWeight: 700,
                    bgcolor:
                      roleConfig.badgeColor === "primary"
                        ? "primary.main"
                        : "secondary.main",
                    color: "primary.contrastText",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    border: "3px solid",
                    borderColor: "background.paper",
                  }}
                >
                  {initials}
                </Avatar>
                {/* Google or Verified status indicator */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: isGoogleLinked ? "#4285F4" : "success.main",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: "background.paper",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  {isGoogleLinked ? (
                    <GoogleIcon sx={{ fontSize: 13 }} />
                  ) : (
                    <VerifiedUserRoundedIcon sx={{ fontSize: 13 }} />
                  )}
                </Box>
              </Box>

              <Stack spacing={1}>
                {/* Name & Chips Row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {fullName}
                  </Typography>

                  <Chip
                    size="small"
                    label={roleConfig.label}
                    color={roleConfig.badgeColor}
                    sx={{ fontWeight: 600, fontSize: "0.72rem", height: 24 }}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label="Active Status"
                    color="success"
                    sx={{ fontWeight: 600, fontSize: "0.72rem", height: 24 }}
                  />

                  {isGoogleLinked && (
                    <Chip
                      size="small"
                      icon={<GoogleIcon sx={{ fontSize: "14px !important" }} />}
                      label="Google Linked"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        height: 24,
                        bgcolor: "rgba(66, 133, 244, 0.08)",
                        color: "#1976D2",
                        borderColor: "rgba(66, 133, 244, 0.3)",
                      }}
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Subtitle / Username & Position */}
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  @{user?.username || "user"}
                  {user?.position ? ` • ${user.position}` : ""}
                </Typography>

                {/* Quick Info Badges */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    pt: 1,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {user?.email || "No email registered"}
                    </Typography>
                  </Box>

                  {user?.employee_number && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <BadgeOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          color: "text.secondary",
                          fontWeight: 600,
                        }}
                      >
                        {user.employee_number}
                      </Typography>
                      <Tooltip title="Copy Employee ID">
                        <Button
                          size="small"
                          onClick={handleCopyEmployeeId}
                          sx={{
                            minWidth: 0,
                            p: 0.25,
                            color: "text.secondary",
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                        </Button>
                      </Tooltip>
                    </Box>
                  )}

                  {(user?.office || user?.division) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <BusinessRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {[user.office, user.division].filter(Boolean).join(" / ")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Stack>

            {/* Right: Quick Context Summary */}
            <Stack
              direction={{ xs: "row", md: "column" }}
              spacing={1}
              sx={{
                alignItems: { xs: "center", md: "flex-end" },
                minWidth: { md: 180 },
                pt: { xs: 1, md: 0 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontWeight: 600,
                }}
              >
                Access Privilege
              </Typography>
              <Chip
                label={user?.is_superuser ? "Superuser (Full System)" : "Standard Access"}
                size="small"
                variant="outlined"
                color={user?.is_superuser ? "warning" : "default"}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2500}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          Employee ID copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
