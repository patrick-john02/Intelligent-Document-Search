"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useAuth } from "@/context/AuthContext";
import { DashboardRole, getDefaultRole, ROLE_CONFIGS } from "./types";

interface RoleSwitcherBarProps {
  activeRole: DashboardRole;
  onRoleChange: (role: DashboardRole) => void;
}

export default function RoleSwitcherBar({
  activeRole,
  onRoleChange,
}: RoleSwitcherBarProps) {
  const { user } = useAuth();
  const actualRole = getDefaultRole(user);

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: DashboardRole | null
  ) => {
    if (newRole !== null) {
      onRoleChange(newRole);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        px: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Left: Perspective Indicator & User Account Details */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            Perspective:
          </Typography>
        </Box>

        {/* Active Role Chip */}
        <Chip
          size="small"
          label={ROLE_CONFIGS[activeRole].label}
          color={ROLE_CONFIGS[activeRole].badgeColor}
          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
        />

        {/* User Account Info */}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          (Account:{" "}
          <strong>
            {user?.is_superuser ? "Super Admin" : "Staff"} • {user?.username}
          </strong>
          )
        </Typography>

        {/* Preview Alert pill if switching away from your real account role */}
        {activeRole !== actualRole && (
          <Chip
            size="small"
            variant="outlined"
            label="Preview Mode"
            color="warning"
            sx={{ fontSize: "0.7rem", height: 22 }}
          />
        )}
      </Box>

      {/* Right: Toggle Button Group with 3 clickable ToggleButtons */}
      <ToggleButtonGroup
        value={activeRole}
        exclusive
        onChange={handleRoleChange}
        size="small"
        aria-label="dashboard role perspective"
        sx={{
          bgcolor: "action.hover",
          p: 0.5,
          borderRadius: 2,
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: 1.5,
            px: 1.5,
            py: 0.6,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            cursor: "pointer",
            "&.Mui-selected": {
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "background.paper",
              },
            },
          },
        }}
      >
        <ToggleButton value="staff" aria-label="staff view">
          <PersonOutlineRoundedIcon fontSize="small" />
          <span>Staff View</span>
        </ToggleButton>

        <ToggleButton value="admin" aria-label="admin view">
          <AdminPanelSettingsOutlinedIcon fontSize="small" />
          <span>Admin View</span>
        </ToggleButton>

        <ToggleButton value="developer" aria-label="developer view">
          <TerminalOutlinedIcon fontSize="small" />
          <span>Developer View</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
