"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";

export interface SmartSearchSkeletonProps {
  count?: number;
}

export default function SmartSearchSkeleton({ count = 3 }: SmartSearchSkeletonProps) {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {/* 1. Results Summary Bar Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton variant="rectangular" width={220} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={110} height={20} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" width={140} height={20} sx={{ borderRadius: 1 }} />
      </Box>

      {/* 2. Repeated Result Card Skeletons - Rectangular, No Icons, Full Space */}
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            borderRadius: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            {/* Top row: Category tag, Clearance badge, AI Relevance score skeleton */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="rectangular" width={130} height={22} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width={120} height={22} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Document Title Skeleton */}
            <Skeleton variant="rectangular" width="80%" height={26} sx={{ mb: 1, borderRadius: 1 }} />

            {/* Metadata: Order No, Series Year, Shelf Location */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 2, flexWrap: "wrap" }}>
              <Skeleton variant="rectangular" width={150} height={18} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={110} height={18} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={160} height={18} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Excerpt Box Skeleton */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: 1,
                bgcolor: "action.hover",
                borderColor: "divider",
                mb: 2,
              }}
            >
              <Skeleton variant="rectangular" width={120} height={14} sx={{ mb: 1.25, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={16} sx={{ mb: 0.75, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="95%" height={16} sx={{ mb: 0.75, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="70%" height={16} sx={{ borderRadius: 1 }} />
            </Paper>

            {/* Bottom Actions Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Skeleton variant="rectangular" width={200} height={16} sx={{ borderRadius: 1 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={140} height={32} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
