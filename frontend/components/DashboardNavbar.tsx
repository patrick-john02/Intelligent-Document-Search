"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { styled } from "@mui/material/styles";

import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "@/shared-theme/ColorModeIconDropdown";
import CustomDatePicker from "./CustomDatePicker";
import { DashboardRole } from "./dashboard/types";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: "0 6px",
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

interface RouteMeta {
  section: string;
  page: string;
  title: string;
}

const ROUTE_MAP: Record<string, RouteMeta> = {
  "/dashboard": { section: "Dashboard", page: "Overview", title: "Dashboard" },
  "/search": { section: "Records & Search", page: "Smart Search", title: "Smart Search" },
  "/chat": { section: "Records & Search", page: "AI Assistant", title: "AI Assistant" },
  "/documents": { section: "Records & Search", page: "Document Archive", title: "Document Archive" },
  "/locator": { section: "Records & Search", page: "Physical Locator", title: "Physical Locator" },
  "/uploads": { section: "My Workspace", page: "My Uploads", title: "My Uploads" },
  "/bookmarks": { section: "My Workspace", page: "Saved Directives", title: "Saved Directives" },
  "/help": { section: "My Workspace", page: "Search Guide", title: "Search Guide" },
  "/admin/approvals": { section: "Administration", page: "Document Approvals", title: "Document Approvals" },
  "/admin/users": { section: "Administration", page: "User Management", title: "User Management" },
  "/admin/audit": { section: "Administration", page: "Audit & Compliance", title: "Audit & Compliance" },
  "/admin/analytics": { section: "Administration", page: "Usage Analytics", title: "Usage Analytics" },
  "/developer/tasks": { section: "System Engineering", page: "OCR & Task Pipeline", title: "OCR Pipeline" },
  "/developer/database": { section: "System Engineering", page: "Vector & DB Health", title: "Database Health" },
  "/developer/logs": { section: "System Engineering", page: "System Logs & Traces", title: "System Logs" },
};

interface DashboardNavbarProps {
  currentRole?: DashboardRole;
}

export default function DashboardNavbar({ currentRole }: DashboardNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const meta = ROUTE_MAP[pathname] || {
    section: "Records & Search",
    page: pathname.replace("/", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard",
    title: pathname.replace("/", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard",
  };

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      {/* 1. Mobile Top Navigation Bar (Fixed for < md screens) */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "auto", md: "none" },
          boxShadow: 0,
          bgcolor: "background.paper",
          backgroundImage: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            minHeight: 56,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
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
                  width: 16,
                  height: 16,
                  filter: (theme) =>
                    theme.palette.mode === "dark"
                      ? "invert(1) brightness(1.8)"
                      : "none",
                }}
              />
            </Box>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              {meta.title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <ColorModeIconDropdown />
            <MenuButton aria-label="menu" onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon sx={{ fontSize: 20 }} />
            </MenuButton>
            <SideMenuMobile
              open={mobileOpen}
              toggleDrawer={(newOpen: boolean) => () => setMobileOpen(newOpen)}
              currentRole={currentRole}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* 2. Desktop Navigation Bar (Integrated for >= md screens) */}
      <Stack
        direction="row"
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 44,
          py: 0.5,
        }}
        spacing={2}
      >
        <StyledBreadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextRoundedIcon sx={{ fontSize: 16 }} />}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.82rem",
              fontWeight: 500,
            }}
          >
            {meta.section}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            {meta.page}
          </Typography>
        </StyledBreadcrumbs>

        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          {isDashboard && <CustomDatePicker />}
          <MenuButton showBadge aria-label="Open notifications">
            <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
          </MenuButton>
          <ColorModeIconDropdown />
        </Stack>
      </Stack>
    </>
  );
}
