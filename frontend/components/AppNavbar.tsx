"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "@/shared-theme/ColorModeIconDropdown";
import { DashboardRole } from "./dashboard/types";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/search": "Smart Search",
  "/chat": "AI Assistant",
  "/documents": "Document Archive",
  "/locator": "Physical Locator",
  "/uploads": "My Uploads",
  "/bookmarks": "Saved Directives",
  "/help": "Search Guide",
  "/admin/approvals": "Document Approvals",
  "/admin/users": "User Management",
  "/admin/audit": "Audit & Compliance",
  "/admin/analytics": "Usage Analytics",
  "/developer/tasks": "OCR & Task Pipeline",
  "/developer/database": "Vector & DB Health",
  "/developer/logs": "System Logs & Traces",
};

export default function AppNavbar({ currentRole }: { currentRole?: DashboardRole }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] || "DocuArchive";

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
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
            {title}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <ColorModeIconDropdown />
          <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </MenuButton>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} currentRole={currentRole} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
