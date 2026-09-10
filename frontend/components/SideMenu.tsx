"use client";

import { useState } from "react";
import Link from "next/link";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { useAuth } from "@/context/AuthContext";
import { DashboardRole, getDefaultRole, ROLE_CONFIGS } from "./dashboard/types";

const drawerWidth = 250;
const collapsedDrawerWidth = 68;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: "visible",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: collapsedDrawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflow: "visible",

  "& .MuiListItemText-root, & .MuiListSubheader-root, & .MuiChip-root": {
    display: "none",
  },
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    justifyContent: "center",
    margin: "0 auto",
  },
  "& .MuiListItemButton-root": {
    justifyContent: "center",
    px: 1,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  overflow: "visible",
  ...(open && {
    ...openedMixin(theme),
    [`& .${drawerClasses.paper}`]: {
      ...openedMixin(theme),
      backgroundColor: "background.paper",
      overflow: "visible",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    [`& .${drawerClasses.paper}`]: {
      ...closedMixin(theme),
      backgroundColor: "background.paper",
      overflow: "visible",
    },
  }),
}));

interface SideMenuProps {
  currentRole?: DashboardRole;
}

export default function SideMenu({ currentRole }: SideMenuProps) {
  const [open, setOpen] = useState(true);

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
      open={open}
      sx={{
        display: { xs: "none", md: "block" },
      }}
    >
      {/* 1. Header / Logo + Overlapping Collapse Toggle <|> */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          mt: "calc(var(--template-frame-height, 0px) + 8px)",
          px: open ? 2 : 1.5,
          py: 1.5,
          minHeight: 56,
          overflow: "visible",
        }}
      >
        {/* Logo Section */}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
            overflow: "hidden",
            justifyContent: open ? "flex-start" : "center",
            width: open ? "auto" : "100%",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(15, 23, 42, 0.06)",
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/globe.svg"
              alt="Logo"
              sx={{
                width: 20,
                height: 20,
                filter: (theme) =>
                  theme.palette.mode === "dark"
                    ? "invert(1) brightness(1.8)"
                    : "none",
              }}
            />
          </Box>
          {open && (
            <Box sx={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  lineHeight: 1.2,
                  color: "text.primary",
                  letterSpacing: "-0.01em",
                }}
              >
                DocuArchive
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: "text.secondary",
                  display: "block",
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                Intelligent Retrieval
              </Typography>
            </Box>
          )}
        </Box>

        {/* Overlapping Sidebar Toggle Button <|> */}
        <Tooltip
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          placement="right"
        >
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translate(50%, -50%)",
              zIndex: (theme) => theme.zIndex.drawer + 2,
              width: 24,
              height: 24,
              minWidth: 24,
              p: 0,
              bgcolor: "background.paper",
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              cursor: "pointer",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                bgcolor: "background.paper",
                color: "text.primary",
                borderColor: "primary.main",
                transform: "translate(50%, -50%) scale(1.1)",
              },
            }}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* 2. Scrollable Navigation Menu (Role-filtered) & Archive Quick Tip */}
      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent currentRole={effectiveRole} />
        {open && <CardAlert />}
      </Box>

      {/* 3. User Profile Footer */}
      <Stack
        direction="row"
        sx={{
          p: open ? 2 : 1.5,
          gap: 1.25,
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor:
              ROLE_CONFIGS[effectiveRole].badgeColor === "primary"
                ? "primary.main"
                : "secondary.main",
            color: "primary.contrastText",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>

        {open && (
          <>
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
          </>
        )}
      </Stack>
    </Drawer>
  );
}

