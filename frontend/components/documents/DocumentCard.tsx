"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { ArchiveDocument } from "./types";
import { getFileTypeBadge, getInitials } from "./documentsUtils";

interface DocumentCardProps {
  document: ArchiveDocument;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLElement>, doc: ArchiveDocument) => void;
}

export default function DocumentCard({
  document: doc,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
}: DocumentCardProps) {
  const typeBadge = getFileTypeBadge(doc.fileType);

  return (
    <Paper
      variant="outlined"
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        bgcolor: isSelected ? "action.selected" : "background.paper",
        borderColor: isSelected ? "primary.main" : "divider",
        borderWidth: isSelected ? 2 : 1,
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 270,
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 18px rgba(0,0,0,0.3)"
              : "0 4px 14px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* Card Top: Type Icon + Title + 3-Dots Menu */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.25 }}>
          <Box
            sx={{
              p: 0.85,
              borderRadius: 1.25,
              bgcolor: typeBadge.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {typeBadge.icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={doc.title}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  color: "text.primary",
                  mb: 0.25,
                }}
              >
                {doc.title}
              </Typography>
            </Tooltip>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {doc.orderNo}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => onContextMenu(e, doc)}
            sx={{ p: 0.25, color: "text.secondary" }}
          >
            <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Stylized Document Canvas Preview Box */}
        <Box
          sx={{
            borderRadius: 1.5,
            p: 1.5,
            mb: 2,
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
            border: "1px solid",
            borderColor: "divider",
            height: 115,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Chip
                label={doc.clearance}
                size="small"
                color={doc.clearance === "Public" ? "success" : "default"}
                sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderRadius: 0.75 }}
              />
              {doc.isDeleted && (
                <Chip
                  label="Soft-Deleted"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    borderRadius: 0.75,
                    bgcolor: alpha("#F59E0B", 0.15),
                    color: "#D97706",
                    border: "1px solid",
                    borderColor: alpha("#F59E0B", 0.4),
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: typeBadge.color,
              }}
            >
              {doc.ocrAccuracy}% OCR
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {doc.summary}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
            {doc.shelfLocation}
          </Typography>
        </Box>
      </Box>

      {/* Card Bottom: Uploaded by & File Stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Avatar
            sx={{
              width: 22,
              height: 22,
              fontSize: "0.62rem",
              fontWeight: 700,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {getInitials(doc.uploadedBy?.name)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.uploadedBy?.name || "Records Officer"}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.72rem",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {doc.fileSize}
        </Typography>
      </Box>
    </Paper>
  );
}
