"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha, useTheme } from "@mui/material/styles";

// MUI Icons
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "review" | "process" | "warning" | "system";
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Archive Review Pending",
    message: "3 new uploaded proposals are waiting for archivist review.",
    time: "10m ago",
    unread: true,
    type: "review",
    link: "/archive-review",
  },
  {
    id: "notif-2",
    title: "Document Ingested",
    message: "Executive_Order_No_14.pdf was successfully indexed and vectorized.",
    time: "45m ago",
    unread: true,
    type: "process",
    link: "/documents",
  },
  {
    id: "notif-3",
    title: "Duplicate Record Flagged",
    message: "Potential duplicate detected for Memo_2024_03.docx (92% similarity).",
    time: "2h ago",
    unread: true,
    type: "warning",
    link: "/archive-review",
  },
  {
    id: "notif-4",
    title: "AI Extraction Completed",
    message: "Agent Alon finished metadata extraction for batch scan #104.",
    time: "Yesterday",
    unread: false,
    type: "system",
    link: "/archive-review",
  },
];

export default function NotificationPopover() {
  const theme = useTheme();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark this notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    if (notif.link) {
      handleClose();
      router.push(notif.link);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return n.unread;
    return true;
  });

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "review":
        return {
          icon: <FactCheckRoundedIcon sx={{ fontSize: 18 }} />,
          color: theme.palette.warning.main,
          bg: alpha(theme.palette.warning.main, 0.12),
        };
      case "process":
        return {
          icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
          color: theme.palette.success.main,
          bg: alpha(theme.palette.success.main, 0.12),
        };
      case "warning":
        return {
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />,
          color: theme.palette.error.main,
          bg: alpha(theme.palette.error.main, 0.12),
        };
      case "system":
      default:
        return {
          icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />,
          color: theme.palette.primary.main,
          bg: alpha(theme.palette.primary.main, 0.12),
        };
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          aria-describedby={id}
          onClick={handleOpen}
          size="small"
          sx={{
            p: 0.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
          }}
        >
          <Badge
            color="error"
            badgeContent={unreadCount}
            variant={unreadCount > 9 ? "standard" : "standard"}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.68rem",
                height: 16,
                minWidth: 16,
                padding: "0 4px",
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsRoundedIcon sx={{ fontSize: 19 }} />
            ) : (
              <NotificationsNoneRoundedIcon sx={{ fontSize: 19, color: "text.secondary" }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 320, sm: 380 },
              maxWidth: "calc(100vw - 32px)",
              maxHeight: 520,
              mt: 1,
              borderRadius: 2,
              boxShadow: 8,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  size="small"
                  label={`${unreadCount} new`}
                  color="primary"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                />
              )}
            </Stack>

            {unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={handleMarkAllAsRead}
                startIcon={<DoneAllRoundedIcon sx={{ fontSize: "16px !important" }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  py: 0.25,
                  px: 1,
                  fontWeight: 600,
                }}
              >
                Mark all read
              </Button>
            )}
          </Stack>

          {/* Filter Toggle: All vs Unread */}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, val) => val && setFilter(val)}
            size="small"
            sx={{
              width: "100%",
              "& .MuiToggleButton-root": {
                flex: 1,
                py: 0.35,
                fontSize: "0.76rem",
                fontWeight: 600,
                textTransform: "none",
              },
            }}
          >
            <ToggleButton value="all">
              All ({notifications.length})
            </ToggleButton>
            <ToggleButton value="unread">
              Unread ({unreadCount})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Notification List */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ py: 6, px: 3, textAlign: "center" }}>
              <NotificationsOffOutlinedIcon sx={{ fontSize: 36, color: "text.secondary", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                No notifications
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                {filter === "unread"
                  ? "You have read all your notifications."
                  : "You're all caught up with your documents and reviews."}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((notif, index) => {
                const iconConfig = getNotificationIcon(notif.type);
                return (
                  <React.Fragment key={notif.id}>
                    <ListItemButton
                      alignItems="flex-start"
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        bgcolor: notif.unread
                          ? alpha(theme.palette.primary.main, 0.04)
                          : "transparent",
                        "&:hover": {
                          bgcolor: notif.unread
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.action.hover, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 42, mt: 0.25 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: iconConfig.bg,
                            color: iconConfig.color,
                          }}
                        >
                          {iconConfig.icon}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notif.unread ? 700 : 500,
                                fontSize: "0.82rem",
                                color: "text.primary",
                              }}
                            >
                              {notif.title}
                            </Typography>
                            {notif.unread && (
                              <Box
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  bgcolor: "primary.main",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.35,
                              }}
                            >
                              {notif.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.disabled",
                                fontSize: "0.68rem",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              {notif.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    {index < filteredNotifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box
              sx={{
                p: 1,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.4),
              }}
            >
              <Button
                size="small"
                color="inherit"
                onClick={handleClearAll}
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: "16px !important" }} />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              >
                Clear all
              </Button>

              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  router.push("/archive-review");
                }}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Review Queue
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
}
