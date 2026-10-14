"use client";

import React from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

interface DocumentsBreadcrumbsProps {
  breadcrumbTrail: { id: string | null; name: string }[];
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
  onBack: () => void;
  folderCount: number;
  fileCount: number;
}

export default function DocumentsBreadcrumbs({
  breadcrumbTrail,
  currentFolderId,
  onNavigate,
  onBack,
  folderCount,
  fileCount,
}: DocumentsBreadcrumbsProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
      {currentFolderId && (
        <Button
          size="small"
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: 1.5,
            fontSize: "0.78rem",
            textTransform: "none",
            fontWeight: 600,
            height: 32,
            px: 1.25,
          }}
        >
          Back
        </Button>
      )}

      <Breadcrumbs
        separator={<NavigateNextRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />}
        aria-label="archive-breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-li": { display: "flex", alignItems: "center" },
        }}
      >
        {breadcrumbTrail.map((crumb, idx) => {
          const isLast = idx === breadcrumbTrail.length - 1;
          return (
            <Box
              key={crumb.id || "root"}
              component="button"
              type="button"
              onClick={() => onNavigate(crumb.id)}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: isLast ? 700 : 500,
                fontSize: isLast ? "0.95rem" : "0.88rem",
                color: isLast ? "text.primary" : "text.secondary",
                "&:hover": { color: "primary.main", textDecoration: "underline" },
              }}
            >
              {idx === 0 && <HomeRoundedIcon sx={{ fontSize: 18, color: "inherit" }} />}
              {crumb.name}
            </Box>
          );
        })}
      </Breadcrumbs>

      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
        • {folderCount} {folderCount === 1 ? "folder" : "folders"},{" "}
        {fileCount} {fileCount === 1 ? "file" : "files"}
      </Typography>
    </Box>
  );
}
