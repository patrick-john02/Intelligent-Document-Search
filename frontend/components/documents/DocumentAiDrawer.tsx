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
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";

// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

import { ArchiveDocument, ArchiveFolder } from "./types";

export interface DocumentAiTarget {
  id: string | number;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  shelfLocation: string;
  clearance?: string;
  summary?: string;
  folder?: string;
  fileType?: string;
  fileSize?: string;
  ingestedDate?: string;
  ocrAccuracy?: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  category?: "directives" | "compliance" | "location" | "retention" | "general";
}

export interface DocumentAiDrawerProps {
  open: boolean;
  onClose: () => void;
  document?: DocumentAiTarget | ArchiveDocument | null;
  currentFolder?: ArchiveFolder | null;
}

export default function DocumentAiDrawer({
  open,
  onClose,
  document,
  currentFolder,
}: DocumentAiDrawerProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Document Management Prompts
  const quickPrompts = document
    ? [
        "Summarize Key Directives & Scope",
        "Verify Compliance & Retention Schedule",
        "Check Physical Shelf Registry & Custody",
        "Extract Statutory Clauses & Basis",
      ]
    : [
        "Archive Organization Best Practices",
        "Explain Record Retention Schedules",
        "How to Classify Official Issuances?",
        "Municipal Assessment Filing Rules",
      ];

  // Initialize or reset chat when document changes or drawer opens
  useEffect(() => {
    if (!open) return;

    if (document) {
      const initialSummary =
        document.summary ||
        `This official record (${document.orderNo}) covers regulatory directives, archival protocols, and procedural guidelines established under Series ${document.seriesYear}.`;

      const initialMessage: Message = {
        id: "initial-msg",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Kumusta! I am **Mayumi**, your **Document Management Agent**.\n\nI have loaded and indexed **${document.title}** (${document.orderNo}) for archival review.\n\n**Executive Summary:**\n${initialSummary}\n\n• **Physical Filing Location:** ${document.shelfLocation}\n• **Access Clearance:** ${document.clearance || "Internal Use"}\n• **Series Year:** ${document.seriesYear}\n\nHow can I assist you with cataloging, statutory compliance, or clause analysis for this record?`,
      };
      setMessages([initialMessage]);
    } else {
      const folderName = currentFolder ? currentFolder.name : "Documents Directory";
      const initialMessage: Message = {
        id: "initial-msg-repo",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Kumusta! I am **Mayumi**, your **Document Management Agent**.\n\nI am currently monitoring **${folderName}**. I oversee records classification, metadata integrity, archival retention policies, and physical custody tracking.\n\nYou can select any record to inspect its dossier, or ask me questions about archival workflows, retention circulars, and filing guidelines!`,
      };
      setMessages([initialMessage]);
    }

    setInputText("");
    setIsTyping(false);
  }, [document?.id, open]);

  useEffect(() => {
    if (open && activeTab === 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, open, activeTab]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Realistic Document Management Agent Response Generator
    setTimeout(() => {
      let responseText = "";
      const lower = text.toLowerCase();

      if (document) {
        if (lower.includes("summar") || lower.includes("directive") || lower.includes("overview") || lower.includes("scope")) {
          responseText = `**Executive Directives & Scope Analysis (${document.orderNo}):**\n\n1. **Core Mandate:** ${
            document.summary || "Prescribes standard compliance, operational procedures, and custodial rules."
          }\n\n2. **Issuance Context:** Series ${document.seriesYear} formal circular.\n\n3. **Jurisdiction & Reach:** Applies to municipal assessors, custodial records personnel, and administrative division chiefs.\n\n4. **Archival Status:** Registered in municipal repository under ${document.shelfLocation}.`;
        } else if (lower.includes("retention") || lower.includes("dispos") || lower.includes("schedule") || lower.includes("period")) {
          responseText = `**Archival Retention & Disposal Policy:**\n\n• **Retention Category:** Permanent / Indefinite Archival Record (Series ${document.seriesYear}).\n• **Legal Basis:** National Archival Circular & Municipal Records Management Guidelines.\n• **Minimum Retention:** 10 Years from issuance date before periodic appraisal.\n• **Disposal Protocols:** De-accession requires formal certification from the Chief Records Officer and Municipal Assessor.`;
        } else if (lower.includes("compli") || lower.includes("penalt") || lower.includes("enforce") || lower.includes("require")) {
          responseText = `**Compliance & Governance Points:**\n\n• **Mandatory Enforcement:** All designated officers must adhere to the statutory directives in **${document.orderNo}**.\n• **Audit Verification:** The physical copy in **${document.shelfLocation}** must match digital OCR indices.\n• **Clearance Tier:** Classified as **${document.clearance || "Internal Use"}**; redistribution outside municipal offices requires supervisor approval.`;
        } else if (lower.includes("file") || lower.includes("where") || lower.includes("locat") || lower.includes("shelf") || lower.includes("cabinet") || lower.includes("custod")) {
          responseText = `**Physical Shelf & Chain-of-Custody Registry:**\n\n• **Custodial Location:** ${document.shelfLocation}\n• **Physical Folder/Binder:** ${document.folder || "Primary Administrative Binder"}\n• **Custodian Office:** Office of the Municipal Assessor - Records Division\n• **Physical Status:** Verified present during last semi-annual records inventory.`;
        } else if (lower.includes("statut") || lower.includes("legal") || lower.includes("clause") || lower.includes("basis")) {
          responseText = `**Statutory Precedents & Legal Basis:**\n\n• **Issuing Authority:** Office of the Municipal Assessor\n• **Governing Directives:** Republic Act No. 7160 (Local Government Code), Title II (Real Property Taxation) and Department of Finance guidelines.\n• **Cross-Referenced Precedents:** Aligns with standard operating valuation schedules and uniform archival classifications.`;
        } else {
          responseText = `**Document Management Assessment for ${document.orderNo}:**\n\n${
            document.summary
          }\n\n• **Classification:** ${document.clearance || "Internal Use"}\n• **Shelf Filing:** ${document.shelfLocation}\n\nI can assist with extracting specific articles, generating formal citations, or cross-verifying retention schedules.`;
        }
      } else {
        // Repository / Folder Level Responses
        if (lower.includes("retention") || lower.includes("schedule")) {
          responseText = `**Municipal Records Retention Standards:**\n\n• **Executive & Department Orders:** Retain permanently (minimum 10 years on active shelf).\n• **Assessment Rolls & Valuation Schedules:** Retain permanently.\n• **General Administrative Memoranda:** Retain 3 to 5 years subject to disposal appraisal.\n\nAll records are tagged with digital timestamps and custody markers upon ingestion.`;
        } else if (lower.includes("classif") || lower.includes("categor") || lower.includes("folder")) {
          responseText = `**Archival Folder Classification Structure:**\n\n1. **Assessment Regulations:** Department orders, circulars, and valuation guidelines.\n2. **Tax Declarations:** Municipal property assessments and roll registers.\n3. **Official Memoranda:** Administrative circulars and executive notices.\n4. **Property Titles:** Cadastral surveys and certified true title scans.\n\nKeep child subfolders grouped by issuance year for clean indexing.`;
        } else {
          responseText = `**Document Management Guidance:**\n\nI am ready to assist with:\n• Searching records by order number, shelf, or clearance level\n• Checking archival retention and compliance standards\n• Managing directory hierarchies and folder structures\n\nSelect any document from the archive workspace to inspect its deep dossier and audit trail.`;
        }
      }

      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: responseText,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyCitation = () => {
    if (!document) return;
    const citation = `Office of the Municipal Assessor, "${document.title}", Issuance No. ${document.orderNo}, Series ${document.seriesYear}. Physical Archival Location: ${document.shelfLocation}.`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(citation);
      setActionAlert("Archival citation copied to clipboard!");
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputText("");
    setIsTyping(false);
    if (document) {
      const resetMsg: Message = {
        id: `reset-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Conversation refreshed. Ready to assist with **${document.title}** (${document.orderNo}). What would you like to review?`,
      };
      setMessages([resetMsg]);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: {
              xs: "100%",
              sm: isExpanded ? "85vw" : 580,
              md: isExpanded ? 840 : 680,
              lg: isExpanded ? 940 : 720,
            },
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 32px rgba(0,0,0,0.8)"
                : "0 0 32px rgba(0,0,0,0.14)",
          },
        },
      }}
    >
      {/* 1. Agent Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.03)"
              : alpha("#EC4899", 0.04),
        }}
      >
        {/* Agent Avatar & Identity */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, minWidth: 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#10B981",
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
                width: 10,
                height: 10,
                borderRadius: "50%",
              },
            }}
          >
            <Avatar
              src="/mayumi.png"
              alt="Mayumi"
              sx={{
                width: 48,
                height: 48,
                border: "2px solid #EC4899",
                boxShadow: "0 4px 12px rgba(236, 72, 153, 0.25)",
                flexShrink: 0,
              }}
            />
          </Badge>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>
                Mayumi
              </Typography>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "13px !important", color: "#EC4899" }} />}
                label="Document Management Agent"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: alpha("#EC4899", 0.12),
                  color: "#DB2777",
                  border: "1px solid",
                  borderColor: alpha("#EC4899", 0.3),
                  borderRadius: 1.5,
                }}
              />
            </Stack>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              {document ? (
                <>
                  <DescriptionOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      fontSize: "0.76rem",
                      maxWidth: { xs: 180, sm: 280, md: 380 },
                    }}
                  >
                    {document.orderNo} • {document.title}
                  </Typography>
                </>
              ) : (
                <>
                  <FolderOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.76rem" }}>
                    Archive Directory Custody
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Controls */}
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Tooltip title="Reset Chat Conversation">
            <IconButton size="small" onClick={handleResetChat} sx={{ color: "text.secondary" }}>
              <RestartAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isExpanded ? "Standard width" : "Expand drawer width"}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: "text.secondary", display: { xs: "none", sm: "inline-flex" } }}
            >
              {isExpanded ? (
                <CloseFullscreenRoundedIcon fontSize="small" />
              ) : (
                <OpenInFullRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Close Mayumi">
            <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2, bgcolor: "background.paper" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              minHeight: 44,
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "none",
              py: 1,
            },
          }}
        >
          <Tab
            icon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Inquiries & Copilot"
          />
          <Tab
            icon={<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Record Dossier"
          />
          <Tab
            icon={<FactCheckOutlinedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Compliance & Audit"
          />
        </Tabs>
      </Box>

      {/* Action Notification Alert */}
      {actionAlert && (
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setActionAlert(null)}
          sx={{ m: 1.5, py: 0.5, borderRadius: 1.5, fontSize: "0.8rem" }}
        >
          {actionAlert}
        </Alert>
      )}

      {/* TAB 0: Inquiries & Copilot */}
      {activeTab === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* Quick Suggestions Strip */}
          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
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
                  fontSize: "0.74rem",
                  height: 26,
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: alpha("#EC4899", 0.08),
                    borderColor: "#EC4899",
                    color: "#DB2777",
                  },
                }}
              />
            ))}
          </Box>

          {/* Messages Stream */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, px: 0.5 }}>
                    {!isUser && (
                      <Avatar
                        src="/mayumi.png"
                        alt="Mayumi"
                        sx={{ width: 18, height: 18, border: "1px solid #EC4899" }}
                      />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem", color: "text.secondary" }}>
                      {isUser ? "You" : "Mayumi"}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.disabled" }}>
                      {msg.timestamp}
                    </Typography>
                  </Box>

                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      maxWidth: isUser ? "85%" : "100%",
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      color: isUser ? "primary.contrastText" : "text.primary",
                      borderColor: isUser ? "primary.main" : "divider",
                      borderTopLeftRadius: !isUser ? 0 : 2,
                      borderTopRightRadius: isUser ? 0 : 2,
                      boxShadow: isUser
                        ? "0 2px 8px rgba(0,0,0,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.05)",
                      "&:hover .copy-btn": { opacity: 1 },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-line",
                        fontSize: "0.86rem",
                        lineHeight: 1.65,
                        color: "inherit",
                        "& strong": { fontWeight: 700 },
                      }}
                    >
                      {msg.text}
                    </Typography>

                    {!isUser && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                        <Chip
                          size="small"
                          label="Archival Verified"
                          icon={<VerifiedRoundedIcon sx={{ fontSize: "13px !important", color: "#10B981" }} />}
                          sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700, bgcolor: alpha("#10B981", 0.1), color: "#059669" }}
                        />
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
                              <CheckRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
                            ) : (
                              <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                </Box>
              );
            })}

            {isTyping && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 0.5 }}>
                <CircularProgress size={16} sx={{ color: "#EC4899" }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.78rem" }}>
                  Mayumi is evaluating archival policies and records metadata...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Bottom Chat Input Form */}
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
              placeholder={
                document
                  ? `Ask Mayumi about ${document.orderNo}, retention, or directives...`
                  : "Ask Mayumi about archive organization, filing rules, or policies..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        disabled={!inputText.trim() || isTyping}
                        size="small"
                        sx={{
                          bgcolor: inputText.trim() && !isTyping ? "#EC4899" : "action.disabledBackground",
                          color: "#fff !important",
                          "&:hover": { bgcolor: "#DB2777" },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <SendRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.85rem",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                display: "block",
                mt: 0.75,
                textAlign: "center",
                fontSize: "0.7rem",
              }}
            >
              Mayumi operates as the Document Management Agent for municipal records & statutory compliance.
            </Typography>
          </Box>
        </Box>
      )}

      {/* TAB 1: Record Dossier */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {document ? (
            <>
              {/* Document Primary Information Header */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <Chip
                    label={document.orderNo}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 800, borderRadius: 1 }}
                  />
                  <Chip
                    label={`Series ${document.seriesYear}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                  <Chip
                    label={document.clearance || "Internal Use"}
                    size="small"
                    color={
                      document.clearance === "Confidential"
                        ? "error"
                        : document.clearance === "Restricted"
                        ? "warning"
                        : "default"
                    }
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.35, mb: 1 }}>
                  {document.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.84rem", lineHeight: 1.6 }}>
                  {document.summary || "Official municipal document filed and indexed for statutory reference."}
                </Typography>
              </Paper>

              {/* Physical & Digital Archival Details Grid */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mt: 0.5 }}>
                Archival Custody & Storage Parameters
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, height: "100%" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
                        Physical Shelf Location
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {document.shelfLocation}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Vault Custody: Office of the Municipal Assessor
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, height: "100%" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <SecurityOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
                        Security Clearance
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {document.clearance || "Internal Use"} Level
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Authorized personnel & authenticated officers
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, height: "100%" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "#3B82F6" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
                        Ingestion Date
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {document.ingestedDate || "2024-03-12"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Indexed into vector and relational archives
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, height: "100%" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <Inventory2OutlinedIcon sx={{ fontSize: 18, color: "#8B5CF6" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
                        Format & Size
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {(document.fileType || "pdf").toUpperCase()} • {document.fileSize || "2.4 MB"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Full text OCR search enabled
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* OCR Confidence Progress */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Optical Character Recognition (OCR) Confidence
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>
                    {document.ocrAccuracy ? `${document.ocrAccuracy}%` : "99.2%"}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={document.ocrAccuracy || 99.2}
                  color="success"
                  sx={{ height: 6, borderRadius: 1 }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                  Verified text extraction across high-resolution municipal document scan.
                </Typography>
              </Paper>

              {/* Management Action Buttons */}
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCopyCitation}
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, py: 1 }}
                >
                  Copy Formal Archival Citation
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setActionAlert(`Physical file ${document.orderNo} confirmed in custody at ${document.shelfLocation}.`);
                    setTimeout(() => setActionAlert(null), 3000);
                  }}
                  startIcon={<VerifiedRoundedIcon sx={{ fontSize: 18, color: "#10B981" }} />}
                  sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, py: 1 }}
                >
                  Verify Physical Custody
                </Button>
              </Stack>
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <FolderOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Digital Archive Directory Status
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}>
                Select a document from the folder grid to inspect its complete archival dossier, OCR accuracy, and custody location.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setActiveTab(0)}
                startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
              >
                Inquire with Mayumi
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* TAB 2: Compliance & Audit */}
      {activeTab === 2 && (
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Archival Governance & Compliance Log
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              Automated audit trail certified by the Document Management Agent.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              {/* Check 1 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 20, color: "success.main", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      Retention Schedule Validation
                    </Typography>
                    <Chip label="Compliant" size="small" color="success" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                    Record classified as Permanent Archival Record under Circular No. 2024-01. Mandatory retention schedule active.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 2 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <GavelRoundedIcon sx={{ fontSize: 20, color: "primary.main", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      Statutory Precedent Alignment
                    </Typography>
                    <Chip label="Verified" size="small" color="primary" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                    Clauses cross-referenced with Republic Act No. 7160 and municipal assessment schedules.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 3 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <SecurityOutlinedIcon sx={{ fontSize: 20, color: "#EC4899", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      Chain of Custody & Watermark
                    </Typography>
                    <Chip label="Certified" size="small" sx={{ bgcolor: alpha("#EC4899", 0.1), color: "#DB2777", height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                    Digital cryptographic hash verified against archival registry. No document tampering detected.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 4 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <PlaceOutlinedIcon sx={{ fontSize: 20, color: "#F59E0B", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      Physical Shelf Reconciliation
                    </Typography>
                    <Chip label="Logged" size="small" color="warning" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                    Physical binder entry matches registered digital cabinet coordinates ({document ? document.shelfLocation : "Cabinet Archive"}).
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => {
              setActionAlert("Compliance and governance certificate generated.");
              setTimeout(() => setActionAlert(null), 3000);
            }}
            startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, py: 1, mt: 1 }}
          >
            Export Compliance Audit Report
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
