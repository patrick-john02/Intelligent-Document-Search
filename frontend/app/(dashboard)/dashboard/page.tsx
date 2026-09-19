"use client";

import React, { useState } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import DashboardNavbar from "@/components/DashboardNavbar";
import SideMenu from "@/components/SideMenu";
import AppTheme from "@/shared-theme/AppTheme";

import StaffDashboard from "@/components/dashboard/views/StaffDashboard";
import AdminDashboard from "@/components/dashboard/views/AdminDashboard";
import DeveloperDashboard from "@/components/dashboard/views/DeveloperDashboard";
import { useAuth } from "@/context/AuthContext";
import { DashboardRole, getDefaultRole } from "@/components/dashboard/types";

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "@/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<DashboardRole>(() => getDefaultRole(user));

  // Automatically adapt to the authenticated user's account role
  React.useEffect(() => {
    if (user) {
      setActiveRole(getDefaultRole(user));
    }
  }, [user]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu currentRole={activeRole} />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
            px: { xs: 2, sm: 3 },
            pb: 4,
            pt: { xs: 8, md: 1.5 },
          })}
        >
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={activeRole} />
          </Box>

          {/* Role-Adaptive Container */}
          <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
            {/* Dynamic View Rendering */}
            {activeRole === "staff" && <StaffDashboard />}
            {activeRole === "admin" && <AdminDashboard />}
            {activeRole === "developer" && <DeveloperDashboard />}
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
