"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Layout & Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Profile Subcomponents
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import PersonalInfoCard from "@/components/profile/PersonalInfoCard";
import OrganizationInfoCard from "@/components/profile/OrganizationInfoCard";
import SecurityAuthCard from "@/components/profile/SecurityAuthCard";
import ProfileActivityCard from "@/components/profile/ProfileActivityCard";

export default function ProfilePage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
            px: { xs: 2, sm: 3 },
            pb: 5,
            pt: { xs: 8, md: 1.5 },
          })}
        >
          {/* Top Navbar */}
          <Box sx={{ flexShrink: 0, mb: 2.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Profile Container */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { sm: "100%", md: "1400px" },
              mx: "auto",
            }}
          >
            <Stack spacing={3}>
              {/* Header Hero Card */}
              <ProfileHeaderCard user={user} effectiveRole={effectiveRole} />

              {/* Two-Column Responsive Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" },
                  gap: 3,
                  alignItems: "start",
                }}
              >
                {/* Left Column: Personal and Organizational Information */}
                <Stack spacing={3}>
                  <PersonalInfoCard user={user} effectiveRole={effectiveRole} />
                  <OrganizationInfoCard user={user} effectiveRole={effectiveRole} />
                </Stack>

                {/* Right Column: Security (Google Auth) and Workspace Shortcuts */}
                <Stack spacing={3}>
                  <SecurityAuthCard user={user} effectiveRole={effectiveRole} />
                  <ProfileActivityCard />
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
