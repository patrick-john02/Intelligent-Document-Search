"use client";

import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import SelectContent from "./SelectContent";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { useAuth } from "@/context/AuthContext";
import { DashboardRole, getDefaultRole, ROLE_CONFIGS } from "./dashboard/types";

const drawerWidth = 250;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

interface SideMenuProps {
  currentRole?: DashboardRole;
}

export default function SideMenu({ currentRole }: SideMenuProps) {
  const { user } = useAuth();
  const effectiveRole = currentRole || getDefaultRole(user);

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "ST"
    : effectiveRole === "admin"
    ? "AD"
    : effectiveRole === "developer"
    ? "DEV"
    : "ST";

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : effectiveRole === "admin"
    ? "Admin Officer"
    : effectiveRole === "developer"
    ? "Developer Engineer"
    : "Staff Officer";

  const subtitle = user?.division || user?.office || ROLE_CONFIGS[effectiveRole].label;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* 1. Header / Agency Office Selector */}
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 8px)",
          p: 1.5,
          pb: 1,
        }}
      >
        <SelectContent />
      </Box>

      <Divider />

      {/* 2. Scrollable Navigation Menu (Role-filtered) & Archive Quick Tip */}
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent currentRole={effectiveRole} />
        <CardAlert />
      </Box>

      {/* 3. User Profile Footer */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1.25,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: ROLE_CONFIGS[effectiveRole].badgeColor === "primary" ? "primary.main" : "secondary.main",
            color: "primary.contrastText",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ mr: "auto", overflow: "hidden" }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 600, lineHeight: "18px", color: "text.primary" }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem" }}
          >
            {subtitle}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
