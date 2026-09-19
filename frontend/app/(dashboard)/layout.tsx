"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auth Guard: Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading Screen while verifying JWT session
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={36} color="primary" />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.85rem" }}
          >
            Verifying secure session...
          </Typography>
        </Box>
      </Box>
    );
  }

  // If not authenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
