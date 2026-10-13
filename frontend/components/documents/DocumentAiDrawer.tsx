"use client";

import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { ArchiveDocument } from "./types";

export interface DocumentAiTarget {
  id: string | number;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  shelfLocation: string;
  clearance?: string;
  summary?: string;
  folder?: string;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface DocumentAiDrawerProps {
  open: boolean;
  onClose: () => void;
  document: DocumentAiTarget | ArchiveDocument | null;
}

export default function DocumentAiDrawer({
  open,
  onClose,
  document,
}: DocumentAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt presets
  const quickPrompts = [
    "Summarize key directives",
    "What are the compliance requirements?",
    "Who does this policy apply to?",
    "Where is the physical copy filed?",
  ];

  // Initialize or reset chat when document changes
  useEffect(() => {
    if (!document) {
      setMessages([]);
      return;
    }

    const initialSummary =
      document.summary ||
      `This official record (${document.orderNo}) covers regulatory directives, archival protocols, and procedural guidelines established under Series ${document.seriesYear}.`;

    const initialMessage: Message = {
      id: "initial-msg",
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello! I have loaded and indexed **${document.title}** (${document.orderNo}).\n\n**Executive Summary:**\n${initialSummary}\n\n**Filing Location:** ${document.shelfLocation}\n**Access Clearance:** ${document.clearance}\n\nHow can I help you analyze this document today?`,
    };

    setMessages([initialMessage]);
    setInputText("");
    setIsTyping(false);
  }, [document?.id]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, open]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !document) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Realistic AI Document Analysis Simulation
    setTimeout(() => {
      let responseText = "";
      const lower = text.toLowerCase();

      if (lower.includes("summar") || lower.includes("directive") || lower.includes("overview")) {
        responseText = `**Directives Summary for ${document.orderNo}:**\n\n1. **Mandate:** ${
          document.summary || "Prescribes standard compliance and regulatory operational procedures."
        }\n\n2. **Applicable Period:** Series ${document.seriesYear} issuance.\n\n3. **Primary Scope:** Covers municipal assessment, custodial handling, and official regional compliance.`;
      } else if (lower.includes("compli") || lower.includes("penalt") || lower.includes("require")) {
        responseText = `**Compliance & Enforcement Points:**\n\n• Designated officers are required to adhere to the statutory guidelines stipulated in **${document.orderNo}**.\n• Disciplinary or surcharge enforcement follows standard regional guidelines.\n• Relevant records are cataloged in **${document.shelfLocation}** for verification during internal audits.`;
      } else if (lower.includes("who") || lower.includes("appli") || lower.includes("target")) {
        responseText = `**Target Entities & Scope:**\n\nThis issuance directly applies to provincial and municipal department heads, records officers, and administrative staff operating under the division jurisdiction.`;
      } else if (lower.includes("file") || lower.includes("where") || lower.includes("locat") || lower.includes("shelf") || lower.includes("cabinet")) {
        responseText = `**Physical Archival Location:**\n\n• **Cabinet/Shelf:** ${document.shelfLocation}\n• **Classification:** ${document.clearance} record\n• **Physical Binder:** ${document.folder || "Standard Archival Binder"}\n\nYou can inspect the physical copy in person at the custodial records office.`;
      } else {
        responseText = `Based on my analysis of **${document.title}** (${document.orderNo}):\n\n${
          document.summary
        }\n\nIf you need specific excerpts or procedural clauses extracted, feel free to ask!`;
      }

      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: responseText,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!document) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 460, md: 520 },
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 28px rgba(0,0,0,0.7)"
                : "0 0 28px rgba(0,0,0,0.12)",
          },
        },
      }}
    >
      {/* 1. Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.92rem" }}>
              AI Document Assistant
            </Typography>
            <Chip
              label="Live Analysis"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
            />
          </Stack>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "0.82rem",
              color: "text.primary",
              lineHeight: 1.3,
            }}
          >
            {document.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
            {document.orderNo} • {document.shelfLocation}
          </Typography>
        </Box>

        <Tooltip title="Close Assistant">
          <IconButton size="small" onClick={onClose} sx={{ mt: 0.25 }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 2. Quick Suggestion Pills */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 1,
          overflowX: "auto",
          whiteSpace: "nowrap",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {quickPrompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            size="small"
            onClick={() => handleSendMessage(prompt)}
            disabled={isTyping}
            sx={{
              fontSize: "0.72rem",
              height: 24,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": {
                bgcolor: "action.selected",
                borderColor: "primary.main",
                color: "primary.main",
              },
            }}
          />
        ))}
      </Box>

      {/* 3. Messages Stream */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                  px: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem", color: "text.secondary" }}>
                  {isUser ? "You" : "Document Assistant"}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.disabled" }}>
                  {msg.timestamp}
                </Typography>
              </Box>

              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  maxWidth: isUser ? "85%" : "100%",
                  bgcolor: isUser ? "primary.main" : "background.paper",
                  color: isUser ? "primary.contrastText" : "text.primary",
                  borderColor: isUser ? "primary.main" : "divider",
                  borderTopLeftRadius: !isUser ? 0 : 1.5,
                  borderTopRightRadius: isUser ? 0 : 1.5,
                  position: "relative",
                  "&:hover .copy-btn": { opacity: 1 },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-line",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "inherit",
                    "& strong": { fontWeight: 700 },
                  }}
                >
                  {msg.text}
                </Typography>

                {!isUser && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Tooltip title="Copy response">
                      <IconButton
                        size="small"
                        className="copy-btn"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        sx={{
                          p: 0.5,
                          opacity: copiedId === msg.id ? 1 : 0.6,
                          fontSize: "0.7rem",
                          color: "text.secondary",
                        }}
                      >
                        {copiedId === msg.id ? (
                          <CheckRoundedIcon sx={{ fontSize: 15, color: "success.main" }} />
                        ) : (
                          <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}

        {/* Typing / Analysis Progress */}
        {isTyping && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              Analyzing document clauses...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* 4. Bottom Input Form */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question about this document..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!inputText.trim() || isTyping}
                    size="small"
                  >
                    <SendRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              fontSize: "0.85rem",
            },
          }}
        />
        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.75, textAlign: "center", fontSize: "0.68rem" }}>
          Answers are synthesized directly from verified archival records for employee reference.
        </Typography>
      </Box>
    </Drawer>
  );
}
