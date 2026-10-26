"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, icon }: QuickActionProps) {
  return (
    <Box
      component={Link}
      href={href}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.75,
        borderRadius: 2,
        textDecoration: "none",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: theme.vars
          ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.5)`
          : "action.hover",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
          transform: "translateY(-1px)",
          "& .action-arrow": {
            transform: "translateX(3px)",
            color: "primary.main",
          },
        },
      })}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.primary",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        </Box>
      </Stack>

      <ArrowForwardRoundedIcon
        className="action-arrow"
        sx={{
          fontSize: 18,
          color: "text.secondary",
          transition: "transform 0.2s, color 0.2s",
        }}
      />
    </Box>
  );
}

export default function ProfileActivityCard() {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "divider",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          Workspace Shortcuts
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
          Quick access to your documents and saved assets
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <QuickAction
            title="My Uploads"
            description="View and manage submitted directives"
            href="/uploads"
            icon={<CloudUploadOutlinedIcon fontSize="small" />}
          />
          <QuickAction
            title="Saved Directives"
            description="Access your pinned & physical documents"
            href="/bookmarks"
            icon={<BookmarkBorderRoundedIcon fontSize="small" />}
          />
          <QuickAction
            title="Smart Search"
            description="Explore full-text OCR archives"
            href="/search"
            icon={<SearchRoundedIcon fontSize="small" />}
          />
          <QuickAction
            title="AI Assistant"
            description="Chat with document intelligence"
            href="/chat"
            icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
