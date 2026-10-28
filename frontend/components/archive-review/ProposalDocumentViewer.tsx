"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

// Icons
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";

import { downloadDocumentVersion, saveBlob } from "@/lib/documentsApi";

interface ProposalDocumentViewerProps {
  versionId: number;
  fileName: string;
  pageHint?: number | null;
}

export default function ProposalDocumentViewer({
  versionId,
  fileName,
  pageHint,
}: ProposalDocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [rawBlob, setRawBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const isPdf = ext === "pdf";
  const isImage = ["png", "jpg", "jpeg", "webp", "bmp"].includes(ext);

  useEffect(() => {
    let active = true;
    let url: string | null = null;
    setLoading(true);
    setError(null);

    downloadDocumentVersion(versionId)
      .then((blob) => {
        if (!active) return;
        const typed = isPdf ? new Blob([blob], { type: "application/pdf" }) : blob;
        url = URL.createObjectURL(typed);
        setRawBlob(typed);
        setBlobUrl(url);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load document preview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [versionId, isPdf]);

  const handleDownload = () => {
    if (rawBlob) {
      saveBlob(rawBlob, fileName);
    }
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
    }
  };

  const iframeSrc = blobUrl ? (pageHint && isPdf ? `${blobUrl}#page=${pageHint}` : blobUrl) : "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#0F172A" : "#F8FAFC",
        borderRight: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Top Viewer Control Bar */}
      <Box
        sx={{
          py: 1,
          px: 1.75,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontWeight: 700,
              maxWidth: 240,
              fontSize: "0.76rem",
              color: "text.primary",
            }}
          >
            {fileName}
          </Typography>
          {pageHint && (
            <Chip
              size="small"
              label={`Viewing Page ${pageHint}`}
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          {isImage && (
            <>
              <Tooltip title="Zoom in">
                <IconButton size="small" onClick={() => setZoomLevel((z) => Math.min(z + 20, 200))}>
                  <ZoomInRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out">
                <IconButton size="small" onClick={() => setZoomLevel((z) => Math.max(z - 20, 50))}>
                  <ZoomOutRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Open in new window">
            <IconButton size="small" onClick={handleOpenNewTab} disabled={!blobUrl}>
              <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download original">
            <IconButton size="small" onClick={handleDownload} disabled={!blobUrl}>
              <DownloadRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main View Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        {loading ? (
          <Stack spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={32} thickness={4} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
              Streaming document scan...
            </Typography>
          </Stack>
        ) : error ? (
          <Box sx={{ textAlign: "center", p: 3, maxWidth: 360 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Could not load preview
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
              {error}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownload}
              sx={{ textTransform: "none", fontSize: "0.74rem" }}
            >
              Download original file
            </Button>
          </Box>
        ) : isPdf && blobUrl ? (
          <Box
            component="iframe"
            key={iframeSrc}
            src={iframeSrc}
            title={fileName}
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        ) : isImage && blobUrl ? (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box
              component="img"
              src={blobUrl}
              alt={fileName}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `scale(${zoomLevel / 100})`,
                transition: "transform 0.15s ease",
                borderRadius: 1,
                boxShadow: 2,
              }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Preview not available for .{ext} files
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
              Download to view in your system application.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownload}
              sx={{ textTransform: "none" }}
            >
              Download {fileName}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
