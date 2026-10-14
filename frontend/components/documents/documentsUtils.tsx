import React from "react";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { DocumentFileType } from "./types";

export function parseSizeInBytes(sizeStr: string): number {
  const match = sizeStr.match(/([\d.]+)\s*(MB|KB|GB|Bytes)/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === "GB") return num * 1024 * 1024 * 1024;
  if (unit === "MB") return num * 1024 * 1024;
  if (unit === "KB") return num * 1024;
  return num;
}

export function getFileTypeBadge(fileType: DocumentFileType) {
  switch (fileType) {
    case "xlsx":
      return {
        label: "Excel",
        extension: ".xlsx",
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        icon: <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />,
      };
    case "docx":
      return {
        label: "Word",
        extension: ".docx",
        color: "#3B82F6",
        bgColor: "rgba(59, 130, 246, 0.1)",
        icon: <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />,
      };
    case "pdf":
    default:
      return {
        label: "PDF",
        extension: ".pdf",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        icon: <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />,
      };
  }
}

export function getInitials(name?: string): string {
  if (!name) return "DOC";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
