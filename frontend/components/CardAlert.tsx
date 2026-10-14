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
      
    </Card>
  );
}
