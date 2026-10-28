"use client";

import React, { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

// Icons
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

// Subcomponents
import DocumentMentionDropdown from "@/components/chat/DocumentMentionDropdown";
import { MentionableDocument, searchMentionableDocuments } from "@/lib/chatApi";

const MAX_TARGETS = 3; // e.g. "compare @A with @B"

interface ChatComposerProps {
  onSendMessage: (text: string, targetedDocs: MentionableDocument[]) => void;
  isGenerating: boolean;
  onStopGenerating?: () => void;
  initialText?: string;
}

export default function ChatComposer({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  initialText = "",
}: ChatComposerProps) {
  const [inputText, setInputText] = useState<string>(initialText);
  const [showMentionMenu, setShowMentionMenu] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState<number>(0);
  const [targetedDocs, setTargetedDocs] = useState<MentionableDocument[]>([]);
  const [results, setResults] = useState<MentionableDocument[]>([]);   // what the dropdown shows
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Sync external text changes (e.g. from empty state quick prompt click)
  // copy a new initialText into the input while rendering (React's "adjust state on prop change" pattern)
  const [prevInitialText, setPrevInitialText] = useState(initialText);
  if (initialText !== prevInitialText) {
    setPrevInitialText(initialText);
    if (initialText) setInputText(initialText);
  }
  useEffect(() => {
    if (!initialText) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [initialText]);

  // Server-side document search for the "@query" (debounced 250 ms; a newer query cancels the older one).
  // State is only set inside the timer/promise callbacks (React rule: no synchronous setState in effects).
  useEffect(() => {
    if (!showMentionMenu) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setResultsLoading(true);
      searchMentionableDocuments(mentionQuery, 8, controller.signal)
        .then((docs) => {
          setResults(docs);
          setMentionSelectedIndex(0);
        })
        .catch((err) => {
          if ((err as Error)?.name !== "AbortError") setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setResultsLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [showMentionMenu, mentionQuery]);

  // Mention handler when typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    const cursor = e.target.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9\-_.]*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentionMenu(true);
      setMentionSelectedIndex(0);
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (doc: MentionableDocument) => {
    const cursor = inputRef.current?.selectionStart ?? inputText.length;
    const textBeforeCursor = inputText.slice(0, cursor);
    const textAfterCursor = inputText.slice(cursor);

    const newBefore = textBeforeCursor.replace(/@([a-zA-Z0-9\-_.]*)$/, `@[${doc.label}] `);
    setInputText(newBefore + textAfterCursor);
    // add as a target (no duplicates, max MAX_TARGETS)
    setTargetedDocs((prev) =>
      prev.some((d) => d.id === doc.id) || prev.length >= MAX_TARGETS ? prev : [...prev, doc]
    );
    setShowMentionMenu(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleTriggerMention = () => {
    setInputText((prev) => (prev.endsWith(" ") || prev === "" ? `${prev}@` : `${prev} @`));
    setMentionQuery("");
    setShowMentionMenu(true);
    setMentionSelectedIndex(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleClearInput = () => {
    setInputText("");
    setTargetedDocs([]);
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    // the chips are the source of truth for which documents are targeted
    const activeDocs = targetedDocs;

    const prompt = inputText;
    setInputText("");
    setTargetedDocs([]);
    setShowMentionMenu(false);

    onSendMessage(prompt, activeDocs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (showMentionMenu) {
      const filtered = results; // same list the dropdown shows

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filtered.length > 0) {
          setMentionSelectedIndex((prev) => (prev + 1) % filtered.length);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filtered.length > 0) {
          setMentionSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        }
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey) {
        e.preventDefault();
        if (filtered.length > 0 && filtered[mentionSelectedIndex]) {
          handleSelectMention(filtered[mentionSelectedIndex]);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionMenu(false);
        return;
      }
    }

    if (e.key === "Escape" && isGenerating && onStopGenerating) {
      e.preventDefault();
      onStopGenerating();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", flexShrink: 0 }}>
      {/* Floating Mention Autocomplete Popover */}
      <DocumentMentionDropdown
        open={showMentionMenu}
        query={mentionQuery}
        docs={results}
        loading={resultsLoading}
        selectedIndex={mentionSelectedIndex}
        onSelect={handleSelectMention}
      />

      {/* Main Composer Card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={(theme) => ({
          p: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          borderColor: showMentionMenu ? "primary.main" : "divider",
          transition: "border-color 0.18s ease, box-shadow 0.18s ease",
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
        })}
      >
        {/* Active Targeted Directive Chip */}
        {targetedDocs.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
            {targetedDocs.map((doc) => (
              <Chip
                key={doc.id}
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "14px !important" }} />}
                label={`${doc.label}${doc.shelfLocation ? ` (${doc.shelfLocation})` : ""}`}
                title={doc.title}
                color="primary"
                size="small"
                onDelete={() => setTargetedDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                deleteIcon={<CloseRoundedIcon sx={{ fontSize: "14px !important" }} />}
                sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: "0.74rem" }}
              />
            ))}
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
              {targetedDocs.length === 1
                ? "The answer will use only this document"
                : `The answer will use only these ${targetedDocs.length} documents`}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {/* Borderless Multiline Input */}
          <InputBase
            fullWidth
            multiline
            inputRef={inputRef}
            minRows={1}
            maxRows={6}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question, or type '@' to target a directive for the agent..."
            inputProps={{ "aria-label": "Chat prompt input" }}
            sx={{
              fontSize: "0.92rem",
              lineHeight: 1.55,
              px: 0.5,
              py: 0.25,
              color: "text.primary",
            }}
          />

          {/* Composer Bottom Toolbar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              pt: 0.75,
              borderTop: "1px solid",
              borderColor: (theme) => alpha(theme.palette.divider, 0.6),
            }}
          >
            {/* Left Toolbar Actions */}
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Button
                size="small"
                startIcon={<AlternateEmailRoundedIcon sx={{ fontSize: 13 }} />}
                onClick={handleTriggerMention}
                variant="outlined"
                color="primary"
                sx={{
                  fontSize: "0.72rem",
                  textTransform: "none",
                  borderRadius: 1,
                  py: "2px",
                  px: "8px",
                  fontWeight: 700,
                }}
              >
                Target Directive (@)
              </Button>

              {inputText.length > 0 && (
                <Tooltip title="Clear input text">
                  <IconButton
                    size="small"
                    onClick={handleClearInput}
                    sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "text.primary" } }}
                    aria-label="Clear input text"
                  >
                    <ClearRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Right Toolbar Actions: Key Hint & Send/Stop Button */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontSize: "0.7rem",
                  display: { xs: "none", sm: "inline-block" },
                  userSelect: "none",
                }}
              >
                <Box
                  component="kbd"
                  sx={{
                    px: 0.5,
                    py: 0.2,
                    borderRadius: 0.75,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    fontFamily: "inherit",
                    fontSize: "0.68rem",
                    mr: 0.5,
                  }}
                >
                  Shift
                </Box>
                +
                <Box
                  component="kbd"
                  sx={{
                    px: 0.5,
                    py: 0.2,
                    borderRadius: 0.75,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    fontFamily: "inherit",
                    fontSize: "0.68rem",
                    mx: 0.5,
                  }}
                >
                  ↵
                </Box>
                for newline
              </Typography>

              {/* Dual-State Send / Stop Button */}
              {isGenerating ? (
                <Tooltip title="Stop synthesizing response (Esc)">
                  <IconButton
                    onClick={onStopGenerating}
                    color="error"
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: "error.main",
                      color: "error.contrastText",
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      "&:hover": {
                        bgcolor: "error.dark",
                      },
                    }}
                    aria-label="Stop generation"
                  >
                    <StopRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Send message (Enter)">
                  <span>
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={!inputText.trim()}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                        "&.Mui-disabled": {
                          bgcolor: "action.disabledBackground",
                          color: "action.disabled",
                        },
                      }}
                      aria-label="Send message"
                    >
                      <SendRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
