"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SideMenu from "@/components/SideMenu";
import AppNavbar from "@/components/AppNavbar";
import Header from "@/components/Header";

export default function SmartSearchPage() {
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
            Smart Search
          </Typography>
          <TextField
            fullWidth
            placeholder="Search documents by keywords, subjects, or directive number..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
