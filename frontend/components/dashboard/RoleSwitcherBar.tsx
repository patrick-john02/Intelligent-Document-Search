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
}
