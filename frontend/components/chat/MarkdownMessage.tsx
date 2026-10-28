"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Box from "@mui/material/Box";

// Renders the assistant's Markdown (bold, lists, headings, tables, code) with MUI theme styles.
// react-markdown does NOT render raw HTML by default, so model output can't inject scripts.
export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <Box
      sx={(theme) => ({
        fontSize: "0.9rem",
        lineHeight: 1.68,
        color: "text.primary",
        wordBreak: "break-word",
        "& p": { my: 0.75 },
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
        "& ul, & ol": { pl: 3, my: 0.75 },
        "& li": { my: 0.25 },
        "& h1, & h2, & h3, & h4": { fontSize: "1rem", fontWeight: 700, mt: 1.5, mb: 0.75 },
        // tables (from remark-gfm); scroll sideways on small screens
        "& table": { borderCollapse: "collapse", my: 1.25, fontSize: "0.85rem", display: "block", overflowX: "auto" },
        "& th, & td": {
          border: `1px solid ${theme.palette.divider}`,
          px: 1.25,
          py: 0.75,
          textAlign: "left",
          verticalAlign: "top",
        },
        "& td, & th": { wordBreak: "normal", overflowWrap: "break-word" }, // break between words, not inside
        "& tr > :first-of-type": { whiteSpace: "nowrap" },                   // keep the label column on one line
        "& th": { bgcolor: "action.hover", fontWeight: 700 },
        "& code": { fontFamily: "monospace", fontSize: "0.82rem", px: 0.5, borderRadius: 0.5, bgcolor: "action.hover" },
        "& pre": { p: 1.5, borderRadius: 1, overflowX: "auto", bgcolor: "action.hover" },
        "& pre code": { p: 0, bgcolor: "transparent" },
        "& blockquote": { borderLeft: `3px solid ${theme.palette.divider}`, pl: 1.5, ml: 0, color: "text.secondary" },
        "& a": { color: "primary.main" },
        "& hr": { border: 0, borderTop: `1px solid ${theme.palette.divider}`, my: 1.5 },
      })}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // open links in a new tab
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}