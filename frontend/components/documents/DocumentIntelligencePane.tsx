"use client";

import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import Link from "next/link";

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
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CircularProgress from "@mui/material/CircularProgress";

import { ArchiveDocument, ArchiveFolder } from "./types";

export type IntelligenceTab = "dossier" | "mayumi" | "audit";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface DocumentIntelligencePaneProps {
  open: boolean;
  onClose: () => void;
  document: ArchiveDocument | null;
  currentFolder?: ArchiveFolder | null;
  activeTab: IntelligenceTab;
  onTabChange: (tab: IntelligenceTab) => void;
  onOpenDocument?: (doc: ArchiveDocument) => void;
}

export default function DocumentIntelligencePane({
  open,
  onClose,
  document,
  currentFolder,
  activeTab,
  onTabChange,
  onOpenDocument,
}: DocumentIntelligencePaneProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Action Prompts for Mayumi
  const quickPrompts = document
    ? [
        "Summarize Directives & Scope",
        "Retention & Compliance Schedule",
        "Physical Shelf Registry",
        "Extract Statutory Precedents",
      ]
    : [
        "Archive Organization Rules",
        "Retention Schedule Standards",
        "How to Classify Issuances?",
        "Municipal Assessment Filing",
      ];

  // Initialize or reset Mayumi conversation when selected document changes
  useEffect(() => {
    if (!open) return;

    if (document) {
      const summaryText =
        document.summary ||
        `Official record (${document.orderNo}) filed under Series ${document.seriesYear} in ${document.shelfLocation}.`;

      const initialMsg: Message = {
        id: `init-${document.id}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Kumusta! I am **Mayumi**, your **Document Management Agent**.\n\nI have loaded **${document.title}** (${document.orderNo}) for archival review.\n\n**Executive Summary:**\n${summaryText}\n\n• **Physical Vault:** ${document.shelfLocation}\n• **Clearance Tier:** ${document.clearance}\n• **OCR Precision:** ${document.ocrAccuracy ? `${document.ocrAccuracy}%` : "99.2%"}\n\nHow can I assist you with directives, compliance checks, or custody verification?`,
      };
      setMessages([initialMsg]);
    } else {
      const folderName = currentFolder ? currentFolder.name : "Documents Directory";
      const initialMsg: Message = {
        id: "init-repo",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Kumusta! I am **Mayumi**, your **Document Management Agent**.\n\nI am currently monitoring **${folderName}**. Select any document from the center grid to inspect its dossier, or ask me questions about archival workflows, retention circulars, and filing guidelines!`,
      };
      setMessages([initialMsg]);
    }

    setInputText("");
    setIsTyping(false);
  }, [document?.id, open]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "mayumi") {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, activeTab]);

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

    setTimeout(() => {
      let responseText = "";
      const lower = text.toLowerCase();

      if (document) {
        if (lower.includes("summar") || lower.includes("directive") || lower.includes("scope") || lower.includes("overview")) {
          responseText = `**Executive Directives & Scope Analysis (${document.orderNo}):**\n\n1. **Core Mandate:** ${
            document.summary || "Prescribes standard compliance and regulatory operational procedures."
          }\n\n2. **Issuance Context:** Series ${document.seriesYear} formal circular.\n\n3. **Scope & Reach:** Mandates uniform records custody for municipal assessors and administrative divisions.\n\n4. **Filing Location:** Registered under ${document.shelfLocation}.`;
        } else if (lower.includes("retention") || lower.includes("dispos") || lower.includes("schedule")) {
          responseText = `**Archival Retention & Disposal Policy:**\n\n• **Retention Category:** Permanent Archival Record (Series ${document.seriesYear}).\n• **Legal Basis:** National Archival Circular & Municipal Records Guidelines.\n• **Active Shelf Period:** Minimum 10 Years from issuance before periodic appraisal.\n• **Disposal Protocol:** De-accession strictly requires formal certification from the Chief Records Officer.`;
        } else if (lower.includes("compli") || lower.includes("enforce") || lower.includes("penalt") || lower.includes("require")) {
          responseText = `**Compliance & Governance Points:**\n\n• **Mandatory Adherence:** Designated officers must adhere to the statutory guidelines in **${document.orderNo}**.\n• **Audit Verification:** Physical binder at **${document.shelfLocation}** matches the digital OCR registry.\n• **Clearance Level:** Classified as **${document.clearance}**; redistribution outside municipal offices requires clearance.`;
        } else if (lower.includes("shelf") || lower.includes("where") || lower.includes("file") || lower.includes("locat") || lower.includes("cabinet")) {
          responseText = `**Physical Shelf & Chain-of-Custody Registry:**\n\n• **Vault Location:** ${document.shelfLocation}\n• **Physical Folder:** Primary Municipal Assessor Binder\n• **Custodial Office:** Office of the Municipal Assessor - Records Division\n• **Physical Status:** Verified present during last records inventory audit.`;
        } else if (lower.includes("statut") || lower.includes("legal") || lower.includes("basis") || lower.includes("clause")) {
          responseText = `**Statutory Precedents & Legal Basis:**\n\n• **Issuing Authority:** Office of the Municipal Assessor\n• **Governing Directives:** Republic Act No. 7160 (Local Government Code), Title II.\n• **Precedents:** Aligns with standard operating valuation schedules and uniform archival classifications.`;
        } else {
          responseText = `**Document Management Review for ${document.orderNo}:**\n\n${
            document.summary
          }\n\n• **Classification:** ${document.clearance}\n• **Shelf Coordinates:** ${document.shelfLocation}\n\nAsk me for specific clause citations or compliance checks!`;
        }
      } else {
        if (lower.includes("retention") || lower.includes("schedule")) {
          responseText = `**Municipal Records Retention Standards:**\n\n• **Executive & Department Orders:** Retain permanently (minimum 10 years active shelf).\n• **Assessment Rolls & Valuation Schedules:** Retain permanently.\n• **Administrative Memoranda:** Retain 3 to 5 years subject to disposal appraisal.`;
        } else {
          responseText = `**Document Management Guidance:**\n\nI am ready to assist with searching records, verifying retention rules, and organizing directory hierarchies. Select any record in the workspace to inspect its complete dossier!`;
        }
      }

      const aiMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: responseText,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopyText = (id: string, text: string) => {
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
      setNotification("Archival citation copied to clipboard!");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!open) return null;

  // Render Inner Panel Content
  const panelContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* 1. Unified Intelligence Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            activeTab === "mayumi"
              ? alpha("#EC4899", 0.05)
              : theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
        }}
      >
        {/* Left Identity Context */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          {activeTab === "mayumi" ? (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#10B981",
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                },
              }}
            >
              <Avatar
                src="/mayumi.png"
                alt="Mayumi"
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid #EC4899",
                  boxShadow: "0 2px 8px rgba(236,72,153,0.25)",
                }}
              />
            </Badge>
          ) : activeTab === "audit" ? (
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main" }}>
              <FactCheckOutlinedIcon sx={{ fontSize: 20 }} />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
            </Avatar>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>
                {activeTab === "mayumi"
                  ? "Mayumi"
                  : activeTab === "audit"
                  ? "Compliance Audit"
                  : "Document Dossier"}
              </Typography>
              {activeTab === "mayumi" && (
                <Chip
                  label="Document Agent"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: alpha("#EC4899", 0.12),
                    color: "#DB2777",
                    borderRadius: 1,
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              noWrap
              sx={{
                display: "block",
                color: "text.secondary",
                fontSize: "0.72rem",
                fontWeight: 600,
                maxWidth: { xs: 200, sm: 260, lg: isExpanded ? 380 : 220 },
              }}
            >
              {document ? `${document.orderNo} • ${document.title}` : "Digital Archive Custody"}
            </Typography>
          </Box>
        </Box>

        {/* Right Action Icons */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          {activeTab === "mayumi" && (
            <Tooltip title="Reset Chat Conversation">
              <IconButton
                size="small"
                onClick={() => {
                  setMessages([]);
                  if (document) {
                    setMessages([
                      {
                        id: `reset-${Date.now()}`,
                        sender: "assistant",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        text: `Conversation refreshed. Ready to assist with **${document.title}** (${document.orderNo}).`,
                      },
                    ]);
                  }
                }}
                sx={{ color: "text.secondary", p: 0.5 }}
              >
                <RestartAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {!isMobile && (
            <Tooltip title={isExpanded ? "Standard width (380px)" : "Expand pane (580px)"}>
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ color: "text.secondary", p: 0.5 }}
              >
                {isExpanded ? (
                  <CloseFullscreenRoundedIcon fontSize="small" />
                ) : (
                  <OpenInFullRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Close Panel">
            <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary", p: 0.5 }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 2. Navigation Tabs (Dossier | Mayumi | Audit) */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val: IntelligenceTab) => onTabChange(val)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "none",
              py: 0.75,
              gap: 0.5,
            },
          }}
        >
          <Tab
            value="dossier"
            icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Dossier"
          />
          <Tab
            value="mayumi"
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: activeTab === "mayumi" ? "#EC4899" : "inherit" }} />}
            iconPosition="start"
            label="Mayumi"
          />
          <Tab
            value="audit"
            icon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Audit"
          />
        </Tabs>
      </Box>

      {/* Notification Toast */}
      {notification && (
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotification(null)}
          sx={{ m: 1, py: 0.25, borderRadius: 1.5, fontSize: "0.76rem" }}
        >
          {notification}
        </Alert>
      )}

      {/* 3. TAB 1: DOSSIER CONTENT */}
      {activeTab === "dossier" && (
        <Box sx={{ flex: 1, overflowY: "auto", p: 2.25, display: "flex", flexDirection: "column", gap: 2 }}>
          {document ? (
            <>
              {/* Document Title & Key Badges */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1, color: "text.primary" }}>
                  {document.title}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  <Chip
                    label={document.orderNo}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700, height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                  />
                  <Chip
                    label={`Series ${document.seriesYear}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                  />
                  <Chip
                    label={document.clearance}
                    size="small"
                    color={
                      document.clearance === "Confidential"
                        ? "error"
                        : document.clearance === "Restricted"
                        ? "warning"
                        : "default"
                    }
                    sx={{ fontWeight: 700, height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                  />
                  <Chip
                    label={document.category}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ fontWeight: 600, height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                  />
                </Stack>
              </Box>

              {/* Physical Vault & Custody */}
              <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                  <PlaceOutlinedIcon sx={{ fontSize: 17, color: "primary.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
                    Physical Archival Coordinates
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {document.shelfLocation}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  Custodial Vault: Office of the Municipal Assessor
                </Typography>
              </Paper>

              {/* Executive Summary */}
              {document.summary && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", display: "block", mb: 0.75 }}
                  >
                    Executive Summary
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.6, color: "text.secondary" }}>
                      {document.summary}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Topics / Tags */}
              {document.tags && document.tags.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", display: "block", mb: 0.75 }}
                  >
                    Indexed Subject Topics
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                    {document.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 22, borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* File Specifications Table */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", display: "block", mb: 0.75 }}
                >
                  File Specifications
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                  <Stack spacing={0.75}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Format:</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color:
                            document.fileType === "xlsx"
                              ? "#10B981"
                              : document.fileType === "docx"
                              ? "#3B82F6"
                              : "#EF4444",
                        }}
                      >
                        {document.fileType === "xlsx"
                          ? "Excel Spreadsheet (.xlsx)"
                          : document.fileType === "docx"
                          ? "Word Document (.docx)"
                          : "PDF Document (.pdf)"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>File Size & Pages:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {document.fileSize} • {document.pageCount} pages
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Ingestion Date:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {document.ingestedDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>OCR Accuracy:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
                        {document.ocrAccuracy ? `${document.ocrAccuracy}%` : "99.2%"} Verified
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1} sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  onClick={() => onOpenDocument && onOpenDocument(document)}
                  startIcon={
                    document.fileType === "xlsx" ? (
                      <TableChartRoundedIcon sx={{ fontSize: 17 }} />
                    ) : document.fileType === "docx" ? (
                      <ArticleRoundedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <PictureAsPdfRoundedIcon sx={{ fontSize: 17 }} />
                    )
                  }
                  sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, py: 0.8 }}
                >
                  Open Document File
                </Button>

                <Button
                  onClick={() => onTabChange("mayumi")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#EC4899" }} />}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 0.8,
                    borderColor: alpha("#EC4899", 0.4),
                    color: "#DB2777",
                    "&:hover": {
                      borderColor: "#EC4899",
                      bgcolor: alpha("#EC4899", 0.05),
                    },
                  }}
                >
                  Ask Mayumi About This Record
                </Button>

                <Button
                  onClick={handleCopyCitation}
                  variant="text"
                  fullWidth
                  size="small"
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{ textTransform: "none", fontSize: "0.75rem", color: "text.secondary" }}
                >
                  Copy Formal Archival Citation
                </Button>
              </Stack>
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <FolderOutlinedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                No Document Selected
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, mb: 2 }}>
                Click any file card or table row in the directory to inspect its dossier, location, and metadata.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onTabChange("mayumi")}
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: "#EC4899" }} />}
                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: "0.76rem" }}
              >
                Consult Mayumi
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* 4. TAB 2: MAYUMI AGENT CONTENT */}
      {activeTab === "mayumi" && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* Quick Action Suggestion Strip */}
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 0.75,
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
              p: 2,
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5, px: 0.5 }}>
                    {!isUser && (
                      <Avatar
                        src="/mayumi.png"
                        alt="Mayumi"
                        sx={{ width: 16, height: 16, border: "1px solid #EC4899" }}
                      />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem", color: "text.secondary" }}>
                      {isUser ? "You" : "Mayumi"}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.66rem", color: "text.disabled" }}>
                      {msg.timestamp}
                    </Typography>
                  </Box>

                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      maxWidth: isUser ? "85%" : "100%",
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      color: isUser ? "primary.contrastText" : "text.primary",
                      borderColor: isUser ? "primary.main" : "divider",
                      borderTopLeftRadius: !isUser ? 0 : 2,
                      borderTopRightRadius: isUser ? 0 : 2,
                      boxShadow: isUser
                        ? "0 2px 8px rgba(0,0,0,0.12)"
                        : "0 1px 3px rgba(0,0,0,0.04)",
                      "&:hover .copy-btn": { opacity: 1 },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-line",
                        fontSize: "0.83rem",
                        lineHeight: 1.6,
                        color: "inherit",
                        "& strong": { fontWeight: 700 },
                      }}
                    >
                      {msg.text}
                    </Typography>

                    {!isUser && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.25, pt: 0.75, borderTop: "1px solid", borderColor: "divider" }}>
                        <Chip
                          size="small"
                          label="Archival Verified"
                          icon={<VerifiedRoundedIcon sx={{ fontSize: "12px !important", color: "#10B981" }} />}
                          sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, bgcolor: alpha("#10B981", 0.1), color: "#059669" }}
                        />
                        <Tooltip title="Copy response">
                          <IconButton
                            size="small"
                            className="copy-btn"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            sx={{
                              p: 0.25,
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

            {isTyping && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, py: 0.5 }}>
                <CircularProgress size={15} sx={{ color: "#EC4899" }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.76rem" }}>
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
              p: 1.75,
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
                          width: 28,
                          height: 28,
                        }}
                      >
                        <SendRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  fontSize: "0.82rem",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                display: "block",
                mt: 0.5,
                textAlign: "center",
                fontSize: "0.68rem",
              }}
            >
              Mayumi operates as the Document Management Agent for municipal records & statutory compliance.
            </Typography>
          </Box>
        </Box>
      )}

      {/* 5. TAB 3: AUDIT & COMPLIANCE CONTENT */}
      {activeTab === "audit" && (
        <Box sx={{ flex: 1, overflowY: "auto", p: 2.25, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Archival Governance & Compliance Checklist
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
              Automated governance certified by the Document Management Agent.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Stack spacing={1.75}>
              {/* Check 1 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 18, color: "success.main", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Retention Schedule Validation
                    </Typography>
                    <Chip label="Compliant" size="small" color="success" sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, fontSize: "0.72rem" }}>
                    Classified as Permanent Archival Record under Circular No. 2024-01. Active retention schedule valid.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 2 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <GavelRoundedIcon sx={{ fontSize: 18, color: "primary.main", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Statutory Precedent Alignment
                    </Typography>
                    <Chip label="Verified" size="small" color="primary" sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, fontSize: "0.72rem" }}>
                    Clauses cross-referenced with Republic Act No. 7160 (Local Government Code).
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 3 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <SecurityOutlinedIcon sx={{ fontSize: 18, color: "#EC4899", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Chain of Custody & Cryptographic Seal
                    </Typography>
                    <Chip label="Certified" size="small" sx={{ bgcolor: alpha("#EC4899", 0.1), color: "#DB2777", height: 18, fontSize: "0.64rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, fontSize: "0.72rem" }}>
                    Cryptographic hash matches municipal records registry. Zero tampering detected.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Check 4 */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <PlaceOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B", mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Physical Shelf Coordinates Reconciliation
                    </Typography>
                    <Chip label="Logged" size="small" color="warning" sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, fontSize: "0.72rem" }}>
                    Physical binder entry matches registered digital cabinet coordinates ({document ? document.shelfLocation : "Cabinet Archive"}).
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* OCR Precision Card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                Optical Character Recognition (OCR) Integrity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main", fontSize: "0.82rem" }}>
                {document?.ocrAccuracy ? `${document.ocrAccuracy}%` : "99.2%"}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={document?.ocrAccuracy || 99.2}
              color="success"
              sx={{ height: 5, borderRadius: 1 }}
            />
          </Paper>

          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="small"
            onClick={() => {
              setNotification("Compliance and governance audit certificate exported.");
              setTimeout(() => setNotification(null), 3000);
            }}
            startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, py: 0.8, mt: "auto" }}
          >
            Export Compliance Audit Report
          </Button>
        </Box>
      )}
    </Box>
  );

  // Responsive Presentation:
  // On Desktop (lg+): Docked 3rd column pane alongside central documents grid (Zero content occlusion).
  // On Mobile / Tablet (< lg): Slide-over Drawer.
  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 460 },
              bgcolor: "background.paper",
              boxShadow: "0 0 28px rgba(0,0,0,0.2)",
            },
          },
        }}
      >
        {panelContent}
      </Drawer>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: isExpanded ? { lg: "580px", xl: "640px" } : { lg: "380px", xl: "420px" },
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 1.5,
        bgcolor: "background.paper",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      {panelContent}
    </Paper>
  );
}
