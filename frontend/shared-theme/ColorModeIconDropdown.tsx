"use client";

import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import Tooltip from "@mui/material/Tooltip";

export default function ColorModeIconDropdown(props: IconButtonProps) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Box sx={{ width: 34, height: 34 }} />;
  }

  const resolvedMode = (mode === "system" ? systemMode : mode) || "light";
  const isDark = resolvedMode === "dark";

  const handleToggle = () => {
    setMode(isDark ? "light" : "dark");
  };

  return (
    <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <IconButton
        size="small"
        onClick={handleToggle}
        {...props}
        sx={{
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          p: 0.75,
          "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          ...props.sx,
        }}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
