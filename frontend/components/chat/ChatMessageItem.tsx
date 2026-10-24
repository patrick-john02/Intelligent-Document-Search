"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import { alpha } from "@mui/material/styles";

// Icons
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

// Subcomponents
import MultiAgentStepper, { PipelineStep } from "@/components/chat/MultiAgentStepper";
import { MentionableDocument } from "@/components/chat/DocumentMentionDropdown";

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
  pipelineSteps?: PipelineStep[];
  targetedDoc?: MentionableDocument;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  onFeedback: (msgId: string, type: "liked" | "disliked") => void;
  onRegenerate: (msgId: string) => void;
  isGenerating?: boolean;
}

export default function ChatMessageItem({
  message,
  onFeedback,
  onRegenerate,
  isGenerating = false,
}: ChatMessageItemProps) {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const isUser = message.sender === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDocExcerpt = (docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("@[") && part.endsWith("]")) {
        const docOrder = part.slice(2, -1);
        return (
          <Chip
            key={i}
            label={`@${docOrder}`}
            size="small"
            color="primary"
            sx={{
              mx: 0.5,
              height: 20,
              fontSize: "0.72rem",
              fontWeight: 700,
              borderRadius: 1,
            }}
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <Paper
          elevation={0}
          variant="outlined"
          sx={(theme) => ({
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderColor: alpha(theme.palette.primary.main, 0.18),
            maxWidth: { xs: "100%", md: "78%" },
            minWidth: 200,
          })}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75, gap: 2 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Box
                sx={(theme) => ({
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <PersonOutlineRoundedIcon sx={{ fontSize: 13 }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                You
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
              {message.timestamp}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              lineHeight: 1.6,
              fontSize: "0.88rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {renderMessageContent(message.text)}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Assistant Message Card
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={(theme) => ({
        p: 2.25,
        borderRadius: 2,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      })}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={(theme) => ({
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
            }}
          >
            Document Assistant
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
          {message.timestamp}
        </Typography>
      </Box>

      {/* Multi-Agent Stepper Pipeline if targeted scope */}
      {message.pipelineSteps && (
        <Box sx={{ mb: 2 }}>
          <MultiAgentStepper steps={message.pipelineSteps} />
        </Box>
      )}

      {/* Targeted Directive Indicator */}
      {message.targetedDoc && (
        <Box sx={{ mb: 1.5 }}>
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "13px !important" }} />}
            label={`Targeted Agent Directive: ${message.targetedDoc.orderNo} (${message.targetedDoc.shelfLocation})`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
          />
        </Box>
      )}

      {/* Response Text */}
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          lineHeight: 1.68,
          fontSize: "0.9rem",
          mb: message.referencedDocs && message.referencedDocs.length > 0 ? 2 : 1,
          whiteSpace: "pre-line",
        }}
      >
        {renderMessageContent(message.text)}
      </Typography>

      {/* Referenced Documents List */}
      {message.referencedDocs && message.referencedDocs.length > 0 && (
        <Box sx={{ mt: 2, pt: 1.75, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              display: "block",
              mb: 1.25,
            }}
          >
            Referenced Documents ({message.referencedDocs.length}):
          </Typography>

          <Stack spacing={1.25}>
            {message.referencedDocs.map((doc) => {
              const isExpanded = expandedDocId === doc.id;
              return (
                <Paper
                  key={doc.id}
                  elevation={0}
                  variant="outlined"
                  sx={(theme) => ({
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.action.hover, 0.4),
                    borderColor: "divider",
                    transition: "border-color 0.15s ease",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                  })}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Directive: {doc.orderNo} ({doc.seriesYear})
                      </Typography>
                    </Box>
                    <Chip
                      label={doc.relevanceMatch}
                      size="small"
                      color="success"
                      variant="filled"
                      sx={{
                        height: 20,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, pt: 0.5 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
                        Location: {doc.shelfLocation}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => toggleDocExcerpt(doc.id)}
                        sx={{
                          fontSize: "0.72rem",
                          textTransform: "none",
                          py: 0.25,
                          px: 1,
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
                        endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 13 }} />}
                        sx={{
                          fontSize: "0.72rem",
                          textTransform: "none",
                          py: 0.25,
                          px: 1,
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
                      elevation={0}
                      variant="outlined"
                      sx={(theme) => ({
                        mt: 1.25,
                        p: 1.25,
                        borderRadius: 1.25,
                        bgcolor: "background.paper",
                        borderLeft: "3px solid",
                        borderLeftColor: "primary.main",
                      })}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.25 }}>
                        Exact Document Excerpt:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.55, fontStyle: "italic", color: "text.primary" }}>
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

      {/* Response Action Bar: Copy, Refresh, Like, Dislike */}
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
        {/* Copy Button with dynamic Check icon feedback */}
        <Tooltip title={copied ? "Copied to clipboard!" : "Copy response"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              borderRadius: 1,
              p: 0.75,
              color: copied ? "success.main" : "text.secondary",
              "&:hover": { color: copied ? "success.dark" : "text.primary" },
            }}
            aria-label="Copy response"
          >
            {copied ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>

        {/* Regenerate Button */}
        <Tooltip title="Regenerate response">
          <span>
            <IconButton
              size="small"
              onClick={() => onRegenerate(message.id)}
              disabled={isGenerating}
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
          </span>
        </Tooltip>

        {/* Like Button */}
        <Tooltip title="Helpful response">
          <IconButton
            size="small"
            onClick={() => onFeedback(message.id, "liked")}
            sx={{
              borderRadius: 1,
              p: 0.75,
              color: message.feedback === "liked" ? "primary.main" : "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
            aria-label="Like response"
          >
            {message.feedback === "liked" ? (
              <ThumbUpRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Dislike Button */}
        <Tooltip title="Poor response">
          <IconButton
            size="small"
            onClick={() => onFeedback(message.id, "disliked")}
            sx={{
              borderRadius: 1,
              p: 0.75,
              color: message.feedback === "disliked" ? "error.main" : "text.secondary",
              "&:hover": { color: "error.main" },
            }}
            aria-label="Dislike response"
          >
            {message.feedback === "disliked" ? (
              <ThumbDownRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ThumbDownOutlinedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
