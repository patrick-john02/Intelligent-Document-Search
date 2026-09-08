"use client";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import { useAuth } from "@/context/AuthContext";
import { DashboardRole, getDefaultRole, ROLE_CONFIGS } from "./dashboard/types";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
  currentRole?: DashboardRole;
}

export default function SideMenuMobile({ open, toggleDrawer, currentRole }: SideMenuMobileProps) {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    toggleDrawer(false)();
    logout();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          minWidth: "280px",
          maxWidth: "80dvw",
          height: "100%",
        }}
      >
        {/* User Header */}
        <Stack direction="row" sx={{ p: 2, pb: 1.5, gap: 1, alignItems: "center" }}>
          <Stack
            direction="row"
            sx={{ gap: 1.25, alignItems: "center", flexGrow: 1, overflow: "hidden" }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: ROLE_CONFIGS[effectiveRole].badgeColor === "primary" ? "primary.main" : "secondary.main",
                color: "primary.contrastText",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: "16px" }}>
                {displayName}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        {/* Navigation Content */}
        <Stack sx={{ flexGrow: 1, overflowY: "auto" }}>
          <MenuContent currentRole={effectiveRole} />
          <Divider sx={{ my: 1 }} />
          <CardAlert />
        </Stack>

        {/* Logout Button */}
        <Stack sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
