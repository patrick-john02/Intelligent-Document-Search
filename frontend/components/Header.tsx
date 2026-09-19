"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CustomDatePicker from "./CustomDatePicker";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "@/shared-theme/ColorModeIconDropdown";

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
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
      <NavbarBreadcrumbs />

      <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
        {isDashboard && <CustomDatePicker />}
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
