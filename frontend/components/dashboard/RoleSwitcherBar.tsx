"use client";

import React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
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

  // Normal staff users are locked to Staff view and cannot switch
  if (!user?.is_superuser && actualRole !== "developer" && actualRole !== "admin") {
    return null;
  }

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: DashboardRole | null
  ) => {
    if (newRole !== null) {
      onRoleChange(newRole);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      {/* Preview Alert pill if switching away from your real account role */}
      {activeRole !== actualRole && (
        <Chip
          size="small"
          label={`Previewing ${ROLE_CONFIGS[activeRole].label}`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
        />
      )}

      {/* Role Toggle Buttons for Administrators & Developers */}
      <ToggleButtonGroup
        value={activeRole}
        exclusive
        onChange={handleRoleChange}
        size="small"
        aria-label="dashboard role perspective"
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          p: 0.5,
          borderRadius: 2,
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: 1.5,
            px: 1.5,
            py: 0.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              color: "text.primary",
              fontWeight: 700,
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
    </Box>
  );
}
