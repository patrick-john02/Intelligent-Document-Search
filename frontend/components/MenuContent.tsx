"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole, DashboardRole } from "./dashboard/types";
import { MAIN_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./dashboard/navigationConfig";

interface MenuContentProps {
  currentRole?: DashboardRole;
}

export default function MenuContent({ currentRole }: MenuContentProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // If role is passed as prop (e.g. from RoleSwitcherBar in design mode), use it;
  // otherwise determine from logged-in user!
  const effectiveRole: DashboardRole = currentRole || getDefaultRole(user);

  // Dynamic Section Labels based on Role
  const primaryHeader =
    effectiveRole === "admin"
      ? "Administration"
      : effectiveRole === "developer"
      ? "System Engineering"
      : "Records & Search";

  const secondaryHeader =
    effectiveRole === "staff" ? "My Workspace" : "System & Settings";

  // Filter items matching the effective role
  const visiblePrimary = MAIN_NAV_ITEMS.filter((item) =>
    item.roles.includes(effectiveRole)
  );

  const visibleSecondary = SECONDARY_NAV_ITEMS.filter((item) =>
    item.roles.includes(effectiveRole)
  );

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      {/* 1. Primary Role-Based Navigation */}
      <List dense disablePadding>
        <ListSubheader
          sx={{
            bgcolor: "transparent",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
            px: 1.5,
            py: 0.5,
            lineHeight: "24px",
          }}
        >
          {primaryHeader}
        </ListSubheader>

        {visiblePrimary.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block", mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    color: "primary.main",
                    fontWeight: 700,
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color={item.badge === "AI" ? "primary" : "default"}
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      borderRadius: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* 2. Secondary Role-Based Navigation */}
      {visibleSecondary.length > 0 && (
        <List dense disablePadding sx={{ mt: 2 }}>
          <ListSubheader
            sx={{
              bgcolor: "transparent",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              px: 1.5,
              py: 0.5,
              lineHeight: "24px",
            }}
          >
            {secondaryHeader}
          </ListSubheader>

          {visibleSecondary.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: "block", mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      color: "primary.main",
                      fontWeight: 700,
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: isActive ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.84rem",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Stack>
  );
}