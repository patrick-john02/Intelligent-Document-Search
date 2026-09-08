"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Link from "next/link";

export default function CardAlert() {
  return (
    <Card
      variant="outlined"
      sx={{
        m: 1.5,
        flexShrink: 0,
        borderRadius: 2.5,
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <AutoAwesomeRoundedIcon fontSize="small" sx={{ color: "primary.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
            AI Research Assistant
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1.75, color: "text.secondary", fontSize: "0.76rem", lineHeight: 1.4 }}>
          Search guidelines and get verified page citations across all archived directives.
        </Typography>
        <Button
          component={Link}
          href="/chat"
          variant="contained"
          size="small"
          fullWidth
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            boxShadow: "none",
          }}
        >
          Ask Question
        </Button>
      </CardContent>
    </Card>
  );
}
