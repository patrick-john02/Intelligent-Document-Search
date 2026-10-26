"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { ProfileViewProps } from "./types";

interface InfoFieldProps {
  label: string;
  value?: string | null;
  badge?: React.ReactNode;
  fallback?: string;
}

function InfoField({ label, value, badge, fallback = "Not Specified" }: InfoFieldProps) {
  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        bgcolor: theme.vars
          ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
          : "action.hover",
        border: "1px solid",
        borderColor: "divider",
      })}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: value ? "text.primary" : "text.disabled",
            wordBreak: "break-word",
          }}
        >
          {value || fallback}
        </Typography>
        {badge}
      </Box>
    </Box>
  );
}

export default function PersonalInfoCard({ user }: ProfileViewProps) {
  const isGoogleLinked = user?.auth_provider === "google" || !!user?.google_id;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return dateStr;
    }
  };

  return (
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
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonOutlineRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Personal Details
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Identity and registered personal information
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* 2-Column Responsive Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          <InfoField label="First Name" value={user?.first_name} />
          <InfoField label="Middle Name" value={user?.middle_name} fallback="None" />
          <InfoField label="Last Name" value={user?.last_name} />
          <InfoField label="System Username" value={user?.username ? `@${user.username}` : null} />
          
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <InfoField
              label="Primary Work Email"
              value={user?.email}
              badge={
                isGoogleLinked ? (
                  <Chip
                    size="small"
                    icon={<GoogleIcon sx={{ fontSize: "12px !important" }} />}
                    label="Google Verified"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    size="small"
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: "12px !important" }} />}
                    label="Active Email"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                  />
                )
              }
            />
          </Box>

          <InfoField
            label="Date of Birth"
            value={formatDate(user?.birth_date)}
            fallback="Confidential / On File"
          />

          <InfoField
            label="Account Status"
            value={user?.is_active ? "Active & Authorized" : "Inactive"}
            badge={
              <Chip
                size="small"
                label={user?.is_active ? "Active" : "Disabled"}
                color={user?.is_active ? "success" : "error"}
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
              />
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
}
