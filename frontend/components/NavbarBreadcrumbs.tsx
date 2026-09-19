"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

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
}

const ROUTE_MAP: Record<string, RouteMeta> = {
  "/dashboard": { section: "Dashboard", page: "Overview" },
  "/search": { section: "Records & Search", page: "Smart Search" },
  "/chat": { section: "Records & Search", page: "AI Assistant" },
  "/documents": { section: "Records & Search", page: "Document Archive" },
  "/locator": { section: "Records & Search", page: "Physical Locator" },
  "/uploads": { section: "My Workspace", page: "My Uploads" },
  "/bookmarks": { section: "My Workspace", page: "Saved Directives" },
  "/help": { section: "My Workspace", page: "Search Guide" },
  "/admin/approvals": { section: "Administration", page: "Document Approvals" },
  "/admin/users": { section: "Administration", page: "User Management" },
  "/admin/audit": { section: "Administration", page: "Audit & Compliance" },
  "/admin/analytics": { section: "Administration", page: "Usage Analytics" },
  "/developer/tasks": { section: "System Engineering", page: "OCR & Task Pipeline" },
  "/developer/database": { section: "System Engineering", page: "Vector & DB Health" },
  "/developer/logs": { section: "System Engineering", page: "System Logs & Traces" },
};

export default function NavbarBreadcrumbs() {
  const pathname = usePathname();

  const meta = ROUTE_MAP[pathname] || {
    section: "Records & Search",
    page: pathname.replace("/", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard",
  };

  return (
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
  );
}
