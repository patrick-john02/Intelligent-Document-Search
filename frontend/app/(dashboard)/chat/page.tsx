"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Layout & Customizations
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";
import { api, ApiError, streamApi } from "@/lib/api";

// Chat Subcomponents
import ConversationSidebar, { ConversationItem } from "@/components/chat/ConversationSidebar";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatMessageItem, { ChatMessage, ReferencedDoc } from "@/components/chat/ChatMessageItem";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatThinkingIndicator from "@/components/chat/ChatThinkingIndicator";
import ChatSkeleton from "@/components/chat/ChatSkeleton";
import type { MentionableDocument } from "@/lib/chatApi";

export type { ReferencedDoc, ChatMessage };

// ---------- Backend response shapes (/api/chat) ----------
interface ApiConversation {
  id: number;
  title: string;
  user_id: number;
  created_at: string;
}

interface ApiChatMessage {
  id: number;
  sender_type: string;
  content: string;
  task_type?: string | null;
  created_at?: string | null;
  is_helpful?: boolean | null;
}

interface TalkResponse {
  message: string;
  conversation_id: number;
  chat: ApiChatMessage;
  assistant_message: ApiChatMessage;
}

// Backend stores naive UTC timestamps (no "Z"), so mark them as UTC before parsing.
const parseUtc = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  const d = new Date(hasZone ? iso : `${iso}Z`);
  return isNaN(d.getTime()) ? null : d;
};

const formatTime = (iso?: string | null): string => {
  const d = parseUtc(iso);
  return d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
};

const formatConvDate = (iso: string): string => {
  const d = parseUtc(iso);
  if (!d) return "";
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Today, ${formatTime(iso)}`;
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

// qwen3 can leak its <think>...</think> reasoning into the reply; hide it.
const cleanAiText = (text: string): string =>
  text.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();

const toConversationItem = (c: ApiConversation): ConversationItem => ({
  id: String(c.id),
  title: c.title,
  date: formatConvDate(c.created_at),
});

const toChatMessage = (m: ApiChatMessage): ChatMessage => {
  const isUser = m.sender_type === "user";
  return {
    id: String(m.id),
    sender: isUser ? "user" : "assistant",
    timestamp: formatTime(m.created_at),
    text: isUser ? m.content : cleanAiText(m.content),
    feedback: m.is_helpful === true ? "liked" : m.is_helpful === false ? "disliked" : null,
  };
};

const errorText = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?";

export default function ChatPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // States
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(""); // "" = new, unsaved chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<string | undefined>(undefined); // live agent status while streaming

  // Auto-scroll anchor
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Tracks the conversation on screen, so late responses don't land in the wrong chat
  const activeConvRef = useRef<string>("");
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.get<ApiConversation[]>("/chat/list");
      setConversations(data.map(toConversationItem));
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSelectConversation = async (id: string) => {
    if (id === activeConvId) return;
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveConvId(id);
    setMessages([]);
    setIsLoadingHistory(true);
    try {
      const data = await api.get<ApiChatMessage[]>(`/chat/${id}/chats-lists`);
      if (activeConvRef.current === id) setMessages(data.map(toChatMessage));
    } catch (err) {
      if (activeConvRef.current === id) {
        setMessages([
          { id: `err-${Date.now()}`, sender: "assistant", timestamp: "", text: `⚠️ ${errorText(err)}`, feedback: null },
        ]);
      }
    } finally {
      if (activeConvRef.current === id) setIsLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveConvId("");
    setMessages([]);
    setIsLoadingHistory(false);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    const previous = conversations;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );

    try {
      await api.patch(`/chat/${id}`, { title: newTitle });
    } catch (err) {
      console.error("Failed to rename conversation", err);
      setConversations(previous);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    const previous = conversations;
    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (activeConvId === id) {
      handleNewChat();
    }

    try {
      await api.delete(`/chat/delete/${id}`);
    } catch (err) {
      console.error("Failed to delete conversation", err);
      setConversations(previous);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Streams the supervisor's reply (POST /chat/talk/stream): live status, then the answer word by word
  const sendPrompt = async (prompt: string, activeDocs: MentionableDocument[] = []) => {
    const targetedDocs = activeDocs.length > 0 ? activeDocs : undefined; // for the UI chips
    const sentConvId = activeConvId;
    const tempId = `temp-${Date.now()}`;
    const aiTempId = `ai-${Date.now()}`;
    let convId = sentConvId;
    let rawAi = "";

    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: "user", timestamp: "Just now", text: prompt, targetedDocs },
    ]);
    setIsGenerating(true);
    setStreamStatus(undefined);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // User switched to another chat while streaming: the reply is still saved, just don't render it here
    const stillHere = () => activeConvRef.current === convId;

    // Create the assistant bubble on the first visible text, then keep updating it
    const showAiText = (text: string) =>
      setMessages((prev) =>
        prev.some((m) => m.id === aiTempId)
          ? prev.map((m) => (m.id === aiTempId ? { ...m, text } : m))
          : [...prev, { id: aiTempId, sender: "assistant", timestamp: "Just now", text, feedback: null, targetedDocs }]
      );

    try {
      await streamApi(
        "/chat/talk/stream",
        {
          content: prompt,
          conversation_id: sentConvId ? Number(sentConvId) : null,
          attachment_ids: activeDocs.map((d) => d.id), // documents targeted with @ (validated by clearance on the server)
        },
        (event, data) => {
          if (event === "meta") {
            convId = String(data.conversation_id);
            if (activeConvRef.current !== sentConvId) return;
            const userMsg = { ...toChatMessage(data.chat), targetedDocs };
            setMessages((prev) => prev.map((m) => (m.id === tempId ? userMsg : m)));
            if (!sentConvId) {
              activeConvRef.current = convId;
              setActiveConvId(convId);
              loadConversations(); // show the new conversation in the sidebar
            }
            return;
          }
          if (!stillHere()) return;

          switch (event) {
            case "status": // e.g. "Searching the archive…"
              setStreamStatus(data.text);
              break;
            case "reset": // supervisor decided to call a specialist: drop any partial text
              rawAi = "";
              setMessages((prev) => prev.filter((m) => m.id !== aiTempId));
              break;
            case "token": {
              rawAi += data.text;
              const visible = cleanAiText(rawAi);
              if (visible) showAiText(visible);
              break;
            }
            case "error": // backend couldn't save the reply
              setMessages((prev) => [
                ...prev.filter((m) => m.id !== aiTempId),
                { id: `err-${Date.now()}`, sender: "assistant", timestamp: "Just now", text: `⚠️ ${data.message}`, feedback: null },
              ]);
              break;
            case "done": {
              // swap the temporary bubble for the saved message (real id -> feedback works)
              const aiMsg = { ...toChatMessage(data.assistant_message), targetedDocs };
              setMessages((prev) =>
                prev.some((m) => m.id === aiTempId)
                  ? prev.map((m) => (m.id === aiTempId ? aiMsg : m))
                  : [...prev, aiMsg] // e.g. error fallback: no tokens were streamed
              );
              break;
            }
          }
        },
        controller.signal
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      if (!stillHere()) return;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== aiTempId),
        { id: `err-${Date.now()}`, sender: "assistant", timestamp: "Just now", text: `⚠️ ${errorText(err)}`, feedback: null },
      ]);
    } finally {
      setIsGenerating(false);
      setStreamStatus(undefined);
      abortControllerRef.current = null;
    }
  };

  // Response Feedback Actions: Like, Dislike, Regenerate
  const isSavedMessage = (msgId: string) => /^\d+$/.test(msgId);

  const handleFeedback = async (msgId: string, type: "liked" | "disliked") => {
    if (!isSavedMessage(msgId)) return;
    const current = messages.find((m) => m.id === msgId)?.feedback;
    if (current === type) return; // backend can't clear a rating, so no un-toggle

    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m)));
    try {
      await api.patch(`/chat/messages/${msgId}/feedback`, { is_helpful: type === "liked" });
    } catch (err) {
      console.error("Failed to save feedback", err);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, feedback: current ?? null } : m)));
    }
  };

  // Re-asks the question that produced this answer (adds a new Q&A pair)
  const handleRegenerate = (msgId: string) => {
    if (isGenerating) return;
    const idx = messages.findIndex((m) => m.id === msgId);
    const question = [...messages.slice(0, idx)].reverse().find((m) => m.sender === "user");
    if (question) sendPrompt(question.text, question.targetedDocs ?? []);
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
              onRename={handleRenameConversation}
              onDelete={handleDeleteConversation}
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
                {isLoadingHistory ? (
                  <ChatSkeleton />
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      onFeedback={handleFeedback}
                      onRegenerate={handleRegenerate}
                      isGenerating={isGenerating}
                    />
                  ))
                ) : (
                  /* Modern Empty State with Suggested Prompts Grid */
                  <ChatEmptyState
                    onSelectPrompt={(prompt) => sendPrompt(prompt)}
                  />
                )}

                {/* Loading indicator when assistant is synthesizing */}
                {isGenerating && !messages.some((m) => m.id.startsWith("ai-")) && (
                  <ChatThinkingIndicator label={streamStatus} onStop={handleStopGenerating} />
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Composer Bar (Pinned at Bottom with modern single-Paper ergonomics) */}
              <Box sx={{ pt: 1.5, flexShrink: 0 }}>
                <ChatComposer
                  onSendMessage={sendPrompt}
                  isGenerating={isGenerating}
                  onStopGenerating={handleStopGenerating}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
