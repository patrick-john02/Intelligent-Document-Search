"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

export default function ArchiveMetricsBar() {
  const metrics = [
    { label: "Archived Documents", value: "1,248 Records" },
    { label: "Digitization Quality", value: "98.6% Clarity" },
    { label: "Archived Storage", value: "14.8 GB (Cataloged)" },
    { label: "Physical Cabinets", value: "4 Units In Service" },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        flexShrink: 0,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />}
        spacing={{ xs: 1.5, sm: 3 }}
        sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
      >
        {metrics.map((item, idx) => (
          <Box key={idx} sx={{ px: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.68rem" }}>
              {item.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.92rem", lineHeight: 1.2 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
