"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { ROLE_CONFIGS } from "@/components/dashboard/types";
import { ProfileViewProps } from "./types";

interface OrgFieldProps {
  label: string;
  value?: string | null;
  code?: boolean;
  highlight?: boolean;
}

function OrgField({ label, value, code, highlight }: OrgFieldProps) {
  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        bgcolor: theme.vars
          ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
          : "action.hover",
        border: "1px solid",
        borderColor: highlight ? "primary.main" : "divider",
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
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          fontFamily: code ? "monospace" : "inherit",
          color: value ? "text.primary" : "text.disabled",
          letterSpacing: code ? 0.5 : "normal",
        }}
      >
        {value || "Not Assigned"}
      </Typography>
    </Box>
  );
}

export default function OrganizationInfoCard({ user, effectiveRole }: ProfileViewProps) {
  const roleConfig = ROLE_CONFIGS[effectiveRole];

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
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CorporateFareRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Institutional & Departmental Data
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Official bureau affiliation and system role tier
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
            mb: 2.5,
          }}
        >
          <OrgField
            label="Employee Identification No."
            value={user?.employee_number}
            code
            highlight
          />
          <OrgField
            label="Official Position / Title"
            value={user?.position || roleConfig.description}
          />
          <OrgField label="Office / Bureau" value={user?.office} />
          <OrgField label="Division / Unit" value={user?.division} />

          <Box
            sx={(theme) => ({
              gridColumn: { xs: "1", sm: "1 / -1" },
              p: 2,
              borderRadius: 2,
              bgcolor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.6)`
                : "action.hover",
              border: "1px solid",
              borderColor: "divider",
            })}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
              <Box>
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
                  Assigned Security Role & Scope
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SecurityRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {roleConfig.label} (Role ID: {user?.system_role_id ?? "Default"})
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25, display: "block" }}>
                  {roleConfig.description}
                </Typography>
              </Box>

              <Chip
                label={user?.is_superuser ? "Full Super Admin" : "Standard Authority"}
                color={user?.is_superuser ? "warning" : "default"}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>
        </Box>

        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
          Institutional records and department assignments are synced with central directory policies.
          Contact an IT administrator to update employee designation or unit transfers.
        </Alert>
      </CardContent>
    </Card>
  );
}
