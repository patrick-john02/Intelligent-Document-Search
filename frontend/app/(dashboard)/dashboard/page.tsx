"use client";

import React, { useState, useEffect } from "react";
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '@/components/AppNavbar';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import AppTheme from '@/shared-theme/AppTheme';

import RoleSwitcherBar from "@/components/dashboard/RoleSwitcherBar";
import StaffDashboard from "@/components/dashboard/views/StaffDashboard";
import AdminDashboard from "@/components/dashboard/views/AdminDashboard";
import DeveloperDashboard from "@/components/dashboard/views/DeveloperDashboard";
import { DashboardRole, getDefaultRole } from "@/components/dashboard/types";
import { useAuth } from "@/context/AuthContext";

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '@/theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<DashboardRole>("staff");

  useEffect(() => {
    if (user) {
      setActiveRole(getDefaultRole(user));
    }
  }, [user]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />

            {/* Role-Adaptive Container */}
            <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
              <RoleSwitcherBar activeRole={activeRole} onRoleChange={setActiveRole} />

              {/* Dynamic View Rendering */}
              {activeRole === "staff" && <StaffDashboard />}
              {activeRole === "admin" && <AdminDashboard />}
              {activeRole === "developer" && <DeveloperDashboard />}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
