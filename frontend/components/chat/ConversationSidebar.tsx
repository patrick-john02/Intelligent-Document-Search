"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

export interface ConversationItem {
  id: string;
  title: string;
  date: string;
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}: ConversationSidebarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "100%", md: "250px" },
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
        p: 1.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* 1. Header with Title and Solo New Chat Icon (No label) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 0.5,
          py: 0.5,
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: "0.88rem",
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Conversations
        </Typography>

        {/* Solo New Chat Icon Button (No label) */}
        <Tooltip title="New Chat" placement="right">
          <IconButton
            onClick={onNewChat}
            size="small"
            sx={{
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              p: 0.75,
              color: "text.primary",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
            aria-label="New Chat"
          >
            <EditNoteRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* 2. Sleek Conversation List */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        <Stack spacing={0.5}>
          {conversations.map((conv) => {
            const isSelected = conv.id === activeId;
            return (
              <Box
                key={conv.id}
                component="button"
                onClick={() => onSelect(conv.id)}
                sx={{
                  px: 1.5,
                  py: 1.2,
                  textAlign: "left",
                  bgcolor: isSelected ? "action.selected" : "transparent",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  borderLeft: isSelected ? "3px solid" : "3px solid transparent",
                  borderLeftColor: isSelected ? "primary.main" : "transparent",
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  width: "100%",
                  display: "block",
                  "&:hover": {
                    bgcolor: isSelected ? "action.selected" : "action.hover",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "primary.main" : "text.primary",
                    fontSize: "0.82rem",
                    lineHeight: 1.3,
                    mb: 0.35,
                  }}
                >
                  {conv.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.68rem",
                    display: "block",
                  }}
                >
                  {conv.date}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
