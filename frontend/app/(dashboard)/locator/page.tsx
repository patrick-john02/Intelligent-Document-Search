import AppNavbar from "@/components/AppNavbar";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";

export default function FileLocator() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu currentRole="staff" />
      <AppNavbar currentRole="staff" />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 2 },
          }}
        >
          <Header />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Document Locator
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
