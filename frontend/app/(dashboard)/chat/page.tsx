"use client";

import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

// Icons (Functional only)
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

// Layout & Customizations
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Chat Subcomponents
import ConversationSidebar, { ConversationItem } from "@/components/chat/ConversationSidebar";

export interface ReferencedDoc {
  id: string;
  title: string;
  orderNo: string;
  seriesYear: number | string;
  shelfLocation: string;
  relevanceMatch: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text: string;
  referencedDocs?: ReferencedDoc[];
  feedback?: "liked" | "disliked" | null;
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-1",
    title: "Property Tax Delinquency Rules",
    date: "Today, 10:45 AM",
  },
  {
    id: "conv-2",
    title: "Treasury Receipting Protocols",
    date: "Yesterday",
  },
  {
    id: "conv-3",
    title: "Franchise Tax Exemptions Review",
    date: "Sep 16, 2024",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    timestamp: "10:44 AM",
    text: "What are the official surcharges and maximum penalty periods for delinquent real property tax in Region II, and where are the physical guidelines filed?",
  },
  {
    id: "msg-2",
    sender: "assistant",
    timestamp: "10:45 AM",
    text: "Under BLGF Department Order No. 2024-018, delinquent real property taxes are subject to a uniform 2% monthly surcharge on unremitted assessments. The surcharges are capped at a statutory ceiling of 72 months (equivalent to a maximum 144% penalty). Municipal treasurers are mandated to issue a formal final demand notice before physical levy or public auction.\n\nFor regional collection offices, Treasury Circular TC-2024-009 also directs all municipal and provincial treasury units within Region II to maintain electronic logs that sync with the central archival repository for compliance auditing.",
    feedback: null,
    referencedDocs: [
      {
        id: "doc-1",
        title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
        orderNo: "BLGF-DO-2024-018",
        seriesYear: 2024,
        shelfLocation: "Cabinet A • Shelf 2",
        relevanceMatch: "98% Match",
        excerpt:
          "Section 4.1 Delinquent Assessment Penalties: Municipal treasurers shall enforce the revised 2% monthly surcharges on unremitted real property taxes, with a statutory maximum ceiling of 72 months from the date of final demand notice.",
      },
      {
        id: "doc-2",
        title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
        orderNo: "TC-2024-009",
        seriesYear: 2024,
        shelfLocation: "Cabinet B • Shelf 1",
        relevanceMatch: "93% Match",
        excerpt:
          "All municipal and provincial collection offices within Region II are directed to integrate electronic treasury receipting systems with the Central Archival and Ingestion node by Q4 2024 to ensure automated compliance auditing.",
      },
    ],
  },
];

const QUICK_PROMPTS = [
  "Property tax penalty ceiling",
  "Treasury electronic receipting deadline",
  "Municipal franchise tax exemptions",
];

export default function ChatPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // States
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Auto-scroll anchor
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    if (id === "conv-1") {
      setMessages(INITIAL_MESSAGES);
    } else {
      setMessages([
        {
          id: `msg-${id}-1`,
          sender: "assistant",
          timestamp: "Archived",
          text: `Displaying conversation history for "${conversations.find((c) => c.id === id)?.title}". Ask any follow-up question below.`,
          feedback: null,
        },
      ]);
    }
  };

  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      title: "New Conversation",
      date: "Just now",
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    setMessages([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      text: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    const prompt = inputText;
    setInputText("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        timestamp: "Just now",
        text: `Based on the regional archive database regarding "${prompt}", all applicable directives have been cross-verified. The provisions cited below are currently active and filed under the records management division.`,
        feedback: null,
        referencedDocs: [
          {
            id: `doc-${Date.now()}`,
            title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
            orderNo: "BLGF-DO-2024-018",
            seriesYear: 2024,
            shelfLocation: "Cabinet A • Shelf 2",
            relevanceMatch: "96% Match",
            excerpt:
              "Section 4.1 Delinquent Assessment Penalties: Municipal treasurers shall enforce the revised 2% monthly surcharges on unremitted real property taxes, with a statutory maximum ceiling of 72 months from the date of final demand notice.",
          },
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 850);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const toggleDocExcerpt = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  // Response Feedback Actions: Like, Dislike, Copy, Refresh
  const handleFeedback = (msgId: string, type: "liked" | "disliked") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const newFeedback = msg.feedback === type ? null : type;
          return { ...msg, feedback: newFeedback };
        }
        return msg;
      })
    );
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = (msgId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              text: `${msg.text}\n\n[Regenerated on ${new Date().toLocaleTimeString()}]: Refreshed with latest regional indices and verified active validity.`,
              timestamp: "Just now (Regenerated)",
            };
          }
          return msg;
        })
      );
      setIsGenerating(false);
    }, 700);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Work Area - Strictly Fixed Height with Independent Scroll */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            height: "100vh",
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            px: { xs: 2, sm: 3 },
            pb: 2,
            pt: { xs: 8, md: 1.5 },
          })}
        >
          {/* Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Title Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI Assistant
                </Typography>
                <Chip
                  label="Document Intelligence"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Ask questions to find and verify rules from archived official directives.
              </Typography>
            </Box>
          </Box>

          {/* 2-Pane Container (Conversations Left, Messages Right) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              pt: 1.5,
              width: "100%",
            }}
          >
            {/* Left Pane: Conversations Sidebar */}
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={handleSelectConversation}
              onNewChat={handleNewChat}
            />

            {/* Right Pane: Chat Console (Header fixed, Input fixed, only Messages scroll) */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/* Messages Stream - ONLY THIS CONTAINER SCROLLS */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <Box key={msg.id} sx={{ width: "100%" }}>
                      {msg.sender === "user" ? (
                        /* User Message Box */
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.75,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                              borderColor: "divider",
                              maxWidth: { xs: "100%", md: "78%" },
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, gap: 2 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                You
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {msg.timestamp}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.55 }}>
                              {msg.text}
                            </Typography>
                          </Paper>
                        </Box>
                      ) : (
                        /* Assistant Message Box */
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "background.paper",
                            borderColor: "divider",
                            width: "100%",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}
                            >
                              Document Assistant
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {msg.timestamp}
                            </Typography>
                          </Box>

                          {/* Response Text */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.primary",
                              lineHeight: 1.65,
                              fontSize: "0.9rem",
                              mb: 2,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {msg.text}
                          </Typography>

                          {/* Referenced Documents List */}
                          {msg.referencedDocs && msg.referencedDocs.length > 0 && (
                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: "text.secondary",
                                  display: "block",
                                  mb: 1,
                                }}
                              >
                                Referenced Documents:
                              </Typography>

                              <Stack spacing={1}>
                                {msg.referencedDocs.map((doc) => {
                                  const isExpanded = expandedDocId === doc.id;
                                  return (
                                    <Paper
                                      key={doc.id}
                                      variant="outlined"
                                      sx={{
                                        p: 1.25,
                                        borderRadius: 1,
                                        bgcolor: "action.hover",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.84rem", color: "text.primary" }}>
                                            {doc.title}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Order: {doc.orderNo} ({doc.seriesYear})
                                          </Typography>
                                        </Box>
                                        <Chip
                                          label={doc.relevanceMatch}
                                          size="small"
                                          color="success"
                                          sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                                        />
                                      </Box>

                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, pt: 0.25 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                          Location: {doc.shelfLocation}
                                        </Typography>

                                        <Stack direction="row" spacing={1}>
                                          <Button
                                            size="small"
                                            onClick={() => toggleDocExcerpt(doc.id)}
                                            sx={{
                                              fontSize: "0.72rem",
                                              textTransform: "none",
                                              p: "2px 8px",
                                              borderRadius: 1,
                                            }}
                                          >
                                            {isExpanded ? "Hide Excerpt" : "View Excerpt"}
                                          </Button>

                                          <Button
                                            component={Link}
                                            href="/documents"
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              fontSize: "0.72rem",
                                              textTransform: "none",
                                              p: "2px 8px",
                                              borderRadius: 1,
                                            }}
                                          >
                                            Open PDF
                                          </Button>
                                        </Stack>
                                      </Box>

                                      {/* Collapsible Document Excerpt */}
                                      <Collapse in={isExpanded}>
                                        <Paper
                                          variant="outlined"
                                          sx={{
                                            mt: 1.25,
                                            p: 1.25,
                                            borderRadius: 1,
                                            bgcolor: "background.paper",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.25 }}>
                                            Exact Document Excerpt:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.55 }}>
                                            "{doc.excerpt}"
                                          </Typography>
                                        </Paper>
                                      </Collapse>
                                    </Paper>
                                  );
                                })}
                              </Stack>
                            </Box>
                          )}

                          {/* Response Action Bar: Like, Dislike, Refresh, Copy */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 1.5,
                              pt: 1,
                              borderTop: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {/* Copy Button */}
                            <Tooltip title={copiedMsgId === msg.id ? "Copied!" : "Copy Response"}>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                sx={{
                                  borderRadius: 1,
                                  p: 0.75,
                                  color: copiedMsgId === msg.id ? "primary.main" : "text.secondary",
                                  "&:hover": { color: "text.primary" },
                                }}
                                aria-label="Copy response"
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Refresh / Regenerate Button */}
                            <Tooltip title="Regenerate Response">
                              <IconButton
                                size="small"
                                onClick={() => handleRegenerate(msg.id)}
                                sx={{
                                  borderRadius: 1,
                                  p: 0.75,
                                  color: "text.secondary",
                                  "&:hover": { color: "text.primary" },
                                }}
                                aria-label="Regenerate response"
                              >
                                <RefreshRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Like Button */}
                            <Tooltip title="Good Response">
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(msg.id, "liked")}
                                sx={{
                                  borderRadius: 1,
                                  p: 0.75,
                                  color: msg.feedback === "liked" ? "primary.main" : "text.secondary",
                                  "&:hover": { color: "primary.main" },
                                }}
                                aria-label="Like response"
                              >
                                {msg.feedback === "liked" ? (
                                  <ThumbUpRoundedIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </Tooltip>

                            {/* Dislike Button */}
                            <Tooltip title="Poor Response">
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(msg.id, "disliked")}
                                sx={{
                                  borderRadius: 1,
                                  p: 0.75,
                                  color: msg.feedback === "disliked" ? "error.main" : "text.secondary",
                                  "&:hover": { color: "error.main" },
                                }}
                                aria-label="Dislike response"
                              >
                                {msg.feedback === "disliked" ? (
                                  <ThumbDownRoundedIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <ThumbDownOutlinedIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  ))
                ) : (
                  /* Empty state */
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 1,
                      borderColor: "divider",
                      my: "auto",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      How can I assist you with official documents?
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}>
                      Ask questions about tax advisories, treasury memorandums, or regulatory procedures. All answers will cite the verified document and physical shelf location.
                    </Typography>
                  </Paper>
                )}

                {/* Loading indicator when assistant is thinking */}
                {isGenerating && (
                  <Box sx={{ width: "100%", p: 1.5, textAlign: "left" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      Searching archives & synthesizing response...
                    </Typography>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Suggestions row (above the input) */}
              <Box sx={{ pt: 1, pb: 0.75, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  Suggestions:
                </Typography>
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    size="small"
                    onClick={() => handleQuickPrompt(prompt)}
                    sx={{
                      fontSize: "0.72rem",
                      textTransform: "none",
                      color: "text.secondary",
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      py: "1px",
                      px: "6px",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </Box>

              {/* Chat Input Bar (Pinned at Bottom, Expands Upward with Multiline) */}
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <form onSubmit={handleSendMessage}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                    {/* Multiline input: expands upward as user types */}
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={6}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask a question about circulars, memorandums, or tax rules... (Shift+Enter for newline)"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          fontSize: "0.9rem",
                          p: "8px 12px",
                        },
                      }}
                    />

                    {/* Solo Icon Send Button */}
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={!inputText.trim()}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        mb: "1px",
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
                      <SendRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </form>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}