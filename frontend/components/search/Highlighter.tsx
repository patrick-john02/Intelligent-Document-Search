"use client";

import React from "react";
import Box from "@mui/material/Box";

interface HighlighterProps {
  text: string;
  query?: string;
}

export default function Highlighter({ text, query }: HighlighterProps) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  // Extract individual search words (minimum 2 chars)
  const words = query
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter((w) => w.length > 1);

  if (words.length === 0) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        // Reset regex state after test
        regex.lastIndex = 0;

        if (isMatch) {
          return (
            <Box
              component="mark"
              key={index}
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 214, 0, 0.28)"
                    : "rgba(255, 235, 59, 0.42)",
                color: "inherit",
                px: 0.35,
                py: 0.1,
                borderRadius: "3px",
                fontWeight: 600,
              }}
            >
              {part}
            </Box>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
