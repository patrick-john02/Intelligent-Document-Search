"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export interface SmartSearchSkeletonProps {
  count?: number;
}

export default function SmartSearchSkeleton({ count = 3 }: SmartSearchSkeletonProps) {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            borderColor: "divider",
            bgcolor: "background.paper",
            width: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            {/* Top row: Category and status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.25,
              }}
            >
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="rectangular" width={75} height={22} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Document Title */}
            <Skeleton variant="text" width="85%" height={28} sx={{ mb: 1 }} />

            {/* Metadata line */}
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />

            {/* Excerpt Snippet */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={55}
              sx={{ borderRadius: 1, mb: 2 }}
            />

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 1.25,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Skeleton variant="text" width={120} height={20} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
