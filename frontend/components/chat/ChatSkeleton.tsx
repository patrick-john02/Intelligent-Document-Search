"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export default function ChatSkeleton() {
  return (
    <Stack spacing={3} sx={{ width: "100%", py: 1 }}>
      {/* 1. User Message Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            width: { xs: "100%", sm: "60%" },
            bgcolor: "action.hover",
            borderColor: "divider",
          }}
        >
          <Skeleton variant="rectangular" width={100} height={14} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="90%" height={18} sx={{ borderRadius: 1 }} />
        </Paper>
      </Box>

      {/* 2. Assistant Response Skeleton */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Skeleton variant="rectangular" width={140} height={16} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={16} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Response paragraphs */}
        <Skeleton variant="rectangular" width="100%" height={16} sx={{ mb: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="95%" height={16} sx={{ mb: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="70%" height={16} sx={{ mb: 2.5, borderRadius: 1 }} />

        {/* Referenced Documents Header */}
        <Skeleton variant="rectangular" width={160} height={14} sx={{ mb: 1.5, borderRadius: 1 }} />

        {/* Referenced Document Cards Skeleton */}
        <Stack spacing={1.5}>
          <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 1 }} />
        </Stack>
      </Paper>
    </Stack>
  );
}
