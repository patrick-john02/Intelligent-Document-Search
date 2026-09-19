"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import BookmarkRemoveRoundedIcon from "@mui/icons-material/BookmarkRemoveRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { BookmarkItem } from "./types";

interface BookmarkListViewProps {
  items: BookmarkItem[];
  selectedId?: string;
  onSelect: (item: BookmarkItem) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onEditNote: (item: BookmarkItem, e: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export default function BookmarkListView({
  items,
  selectedId,
  onSelect,
  onTogglePin,
  onEditNote,
  onRemove,
}: BookmarkListViewProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.82rem",
          }}
        >
          <Box
            component="thead"
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(15, 23, 42, 0.03)",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box component="tr">
              <Box component="th" sx={{ py: 1.25, px: 1.5, width: 44, textAlign: "center" }}>
                Pin
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, fontWeight: 700, color: "text.secondary" }}>
                Directive & Title
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, fontWeight: 700, color: "text.secondary" }}>
                Collection
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, fontWeight: 700, color: "text.secondary" }}>
                Personal Notes
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, fontWeight: 700, color: "text.secondary" }}>
                Physical Location
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, fontWeight: 700, color: "text.secondary" }}>
                Date Saved
              </Box>
              <Box component="th" sx={{ py: 1.25, px: 2, textAlign: "right", fontWeight: 700, color: "text.secondary" }}>
                Actions
              </Box>
            </Box>
          </Box>

          <Box component="tbody">
            {items.map((item) => {
              const isSelected = selectedId === item.id;

              return (
                <Box
                  component="tr"
                  key={item.id}
                  onClick={() => onSelect(item)}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: isSelected ? "action.selected" : "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.12s ease",
                    "&:hover": {
                      bgcolor: isSelected ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  {/* Pin Column */}
                  <Box component="td" sx={{ py: 1.25, px: 1.5, textAlign: "center" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => onTogglePin(item.id, e)}
                      sx={{
                        p: 0.5,
                        color: item.isPinned ? "primary.main" : "text.secondary",
                      }}
                    >
                      {item.isPinned ? (
                        <PushPinRoundedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <PushPinOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Box>

                  {/* Directive & Title Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2, maxWidth: 320 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 800,
                            color: "primary.main",
                            fontSize: "0.78rem",
                          }}
                        >
                          {item.orderNo}
                        </Typography>
                        <Chip
                          label={item.clearance}
                          size="small"
                          color={
                            item.clearance === "Public"
                              ? "success"
                              : item.clearance === "Internal"
                              ? "info"
                              : "warning"
                          }
                          sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, borderRadius: 1 }}
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          fontSize: "0.82rem",
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Collection Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2 }}>
                    <Chip
                      label={item.collection}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1, fontSize: "0.72rem", fontWeight: 600 }}
                    />
                  </Box>

                  {/* Personal Notes Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2, maxWidth: 240 }}>
                    {item.personalNotes ? (
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontStyle: "italic",
                          fontSize: "0.76rem",
                        }}
                      >
                        “{item.personalNotes}”
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.74rem" }}>
                        No notes added
                      </Typography>
                    )}
                  </Box>

                  {/* Physical Coordinates Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2 }}>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 600, fontSize: "0.75rem" }}>
                      {item.shelfLocation.cabinet} • {item.shelfLocation.shelf}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      {item.shelfLocation.barcode}
                    </Typography>
                  </Box>

                  {/* Date Saved Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2, whiteSpace: "nowrap" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
                      {item.dateBookmarked}
                    </Typography>
                  </Box>

                  {/* Actions Column */}
                  <Box component="td" sx={{ py: 1.25, px: 2, textAlign: "right", whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                      <Tooltip title="Edit Personal Notes" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => onEditNote(item, e)}
                          sx={{ color: "text.secondary", p: 0.5 }}
                        >
                          <EditNoteRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove Bookmark" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => onRemove(item.id, e)}
                          sx={{ color: "text.secondary", p: 0.5, "&:hover": { color: "error.main" } }}
                        >
                          <BookmarkRemoveRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onSelect(item)}
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          textTransform: "none",
                          py: 0.2,
                          px: 0.75,
                        }}
                      >
                        Open
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
