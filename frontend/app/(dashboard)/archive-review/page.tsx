"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import CssBaseline from "@mui/material/CssBaseline";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

// MUI Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

// Layout
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

import { ApiError } from "@/lib/api";
import {
  ArchiveProposal,
  ProposalStatus,
  listQueue,
  acceptProposal,
  rerunAlon,
  ARCHIVE_REVIEW_CHANGED,
} from "@/lib/archiveReviewApi";
import ProposalReviewDrawer from "@/components/archive-review/ProposalReviewDrawer";
import ArchiveReviewMetricsBar from "@/components/archive-review/ArchiveReviewMetricsBar";
import ArchiveReviewToolbar, { UrgencyFilter } from "@/components/archive-review/ArchiveReviewToolbar";

const errorText = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?";

const formatDate = (iso: string): string => {
  const d = new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  return isNaN(d.getTime()) ? "" : d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

export default function ArchiveReviewPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Queue State
  const [status, setStatus] = useState<ProposalStatus>("pending");
  const [rows, setRows] = useState<ArchiveProposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "info" | "warning" } | null>(null);

  // Counts & Filtering
  const [statusCounts, setStatusCounts] = useState<Record<ProposalStatus, number>>({
    pending: 0,
    accepted: 0,
    edited: 0,
    rejected: 0,
    failed: 0,
    superseded: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [isBatchWorking, setIsBatchWorking] = useState(false);

  const [reloadKey, setReloadKey] = useState<number>(0);
  const deepLinkDone = useRef<boolean>(false);

  // Fetch status counts for tabs
  const fetchCounts = async () => {
    const tabs: ProposalStatus[] = ["pending", "accepted", "edited", "rejected", "failed"];
    const counts: Record<ProposalStatus, number> = {
      pending: 0,
      accepted: 0,
      edited: 0,
      rejected: 0,
      failed: 0,
      superseded: 0,
    };
    await Promise.all(
      tabs.map(async (t) => {
        try {
          const list = await listQueue(t, 200);
          counts[t] = list.length;
        } catch {
          counts[t] = 0;
        }
      })
    );
    setStatusCounts(counts);
  };

  useEffect(() => {
    void fetchCounts();
  }, [reloadKey]);

  // Load current tab rows
  useEffect(() => {
    let cancelled = false;

    listQueue(status)
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setError(null);
        setSelectedRowIds([]);

        // Deep link handling (e.g. /archive-review?proposal=12)
        if (!deepLinkDone.current) {
          deepLinkDone.current = true;
          const id = Number(new URLSearchParams(window.location.search).get("proposal"));
          if (id) setSelectedId(id);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorText(err));
        setRows([]);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const changeTab = (value: ProposalStatus) => {
    setLoading(true);
    setStatus(value);
    setSelectedRowIds([]);
    setSearchQuery("");
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    let list = rows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const p = r.proposal;
        return (
          r.file_name.toLowerCase().includes(q) ||
          r.current.title?.toLowerCase().includes(q) ||
          p?.title?.toLowerCase().includes(q) ||
          p?.department_order?.toLowerCase().includes(q) ||
          p?.document_type?.toLowerCase().includes(q)
        );
      });
    }

    if (status === "pending" && urgencyFilter !== "all") {
      if (urgencyFilter === "flagged") {
        list = list.filter(
          (r) =>
            r.needs_human_review ||
            (r.proposal?.issues?.length ?? 0) > 0 ||
            (r.proposal?.duplicates?.length ?? 0) > 0
        );
      } else if (urgencyFilter === "clean") {
        list = list.filter(
          (r) =>
            !r.needs_human_review &&
            (r.proposal?.issues?.length ?? 0) === 0 &&
            (r.proposal?.duplicates?.length ?? 0) === 0 &&
            (r.proposal?.document_type_confidence ?? 0) >= 0.75
        );
      }
    }
    return list;
  }, [rows, searchQuery, status, urgencyFilter]);

  // Checkbox Selection
  const allFilteredSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectedRowIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredRows.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Inline Quick Accept (One-Click)
  const handleQuickAccept = async (e: React.MouseEvent, row: ArchiveProposal) => {
    e.stopPropagation();
    try {
      await acceptProposal(row.id);
      setToast({
        message: `Accepted "${row.proposal?.title || row.file_name}" ✓`,
        severity: "success",
      });
      reload();
      window.dispatchEvent(new Event(ARCHIVE_REVIEW_CHANGED));
    } catch (err) {
      setToast({ message: errorText(err), severity: "warning" });
    }
  };

  // Inline Quick Re-run
  const handleQuickRerun = async (e: React.MouseEvent, row: ArchiveProposal) => {
    e.stopPropagation();
    try {
      await rerunAlon(row.document_version_id);
      setToast({
        message: `Re-queued Alon extraction for ${row.file_name} ✓`,
        severity: "info",
      });
      reload();
    } catch (err) {
      setToast({ message: errorText(err), severity: "warning" });
    }
  };

  // Batch Accept
  const handleBatchAccept = async () => {
    if (selectedRowIds.length === 0) return;
    setIsBatchWorking(true);
    let successCount = 0;
    try {
      for (const id of selectedRowIds) {
        try {
          await acceptProposal(id);
          successCount++;
        } catch {
          /* continue on partial fail */
        }
      }
      setToast({
        message: `Batch verified & committed ${successCount} proposal(s) to the archive ✓`,
        severity: "success",
      });
      setSelectedRowIds([]);
      reload();
      window.dispatchEvent(new Event(ARCHIVE_REVIEW_CHANGED));
    } finally {
      setIsBatchWorking(false);
    }
  };

  // Batch Re-run Failed
  const handleBatchRerunFailed = async () => {
    const failedRows = rows.filter((r) => r.status === "failed");
    if (failedRows.length === 0) return;
    setIsBatchWorking(true);
    let queuedCount = 0;
    try {
      for (const r of failedRows) {
        try {
          await rerunAlon(r.document_version_id);
          queuedCount++;
        } catch {
          /* continue */
        }
      }
      setToast({
        message: `Queued ${queuedCount} failed record(s) for Alon re-extraction ✓`,
        severity: "info",
      });
      reload();
    } finally {
      setIsBatchWorking(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") return <TableChartRoundedIcon sx={{ fontSize: 18, color: "#10B981" }} />;
    if (ext === "docx" || ext === "doc") return <ArticleRoundedIcon sx={{ fontSize: 18, color: "#3B82F6" }} />;
    if (ext === "pdf") return <PictureAsPdfRoundedIcon sx={{ fontSize: 18, color: "#EF4444" }} />;
    return <InsertDriveFileRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

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
          {/* Top Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Page Title & Status Header */}
          <Box sx={{ py: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <Box>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.2 }}>
                  Archive Review Studio
                </Typography>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "13px !important", color: "#06B6D4" }} />}
                  label="Alon Verification Desk"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    bgcolor: alpha("#06B6D4", 0.08),
                    color: "#0284C7",
                    border: "1px solid",
                    borderColor: alpha("#06B6D4", 0.3),
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                Audit AI-extracted circular codes, resolve duplicates, and commit verified records into the municipal archive.
              </Typography>
            </Box>
          </Box>

          {/* 1. Metric KPI Strip */}
          <ArchiveReviewMetricsBar proposals={rows} statusCounts={statusCounts} />

          {/* 2. Status Tabs, Search & Fast-Track Toolbar */}
          <ArchiveReviewToolbar
            status={status}
            onStatusChange={changeTab}
            statusCounts={statusCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            urgencyFilter={urgencyFilter}
            onUrgencyFilterChange={setUrgencyFilter}
            selectedCount={selectedRowIds.length}
            onBatchAcceptSelected={handleBatchAccept}
            onBatchRerunFailed={handleBatchRerunFailed}
            isBatchWorking={isBatchWorking}
            onRefresh={reload}
            isRefreshing={loading}
          />

          {/* 3. Main Data Grid */}
          <Box sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 260 }}>
                <CircularProgress size={36} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : filteredRows.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 2.5,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: alpha("#10B981", 0.12),
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  <CheckCircleRoundedIcon sx={{ fontSize: 30 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {status === "pending"
                    ? searchQuery
                      ? "No pending records match your search"
                      : "All caught up! Zero pending reviews"
                    : `No ${status} proposals found`}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", maxWidth: 440, display: "block", mx: "auto", mt: 0.5 }}>
                  {status === "pending"
                    ? "Agent Alon has indexed all current intake scans. New proposals will appear here as records are dropped."
                    : `Records marked as ${status} will appear in this history tab.`}
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 800, fontSize: "0.74rem", py: 1.25 } }}>
                      {status === "pending" && (
                        <TableCell padding="checkbox" sx={{ width: 44 }}>
                          <Checkbox
                            size="small"
                            checked={allFilteredSelected}
                            indeterminate={selectedRowIds.length > 0 && !allFilteredSelected}
                            onChange={handleToggleSelectAll}
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ minWidth: 200 }}>File & Source</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>Alon Proposed Title</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>Type & Confidence</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Verification Flags</TableCell>
                      <TableCell sx={{ minWidth: 130 }}>Ingested Date</TableCell>
                      <TableCell align="right" sx={{ minWidth: 100 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const p = row.proposal;
                      const isSelected = selectedRowIds.includes(row.id);
                      const isOpened = row.id === selectedId;
                      const issueCount = p?.issues?.length ?? 0;
                      const duplicateCount = p?.duplicates?.length ?? 0;
                      const conf = Math.round((p?.document_type_confidence ?? 0) * 100);

                      const titleChanged =
                        Boolean(p?.title) &&
                        p?.title?.trim().toLowerCase() !== row.current.title?.trim().toLowerCase();

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={isOpened}
                          onClick={() => setSelectedId(row.id)}
                          sx={{
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            "& td": { py: 1.1, fontSize: "0.78rem" },
                          }}
                        >
                          {status === "pending" && (
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={(e) => handleToggleSelectRow(e as unknown as React.MouseEvent, row.id)}
                              />
                            </TableCell>
                          )}

                          {/* File Column */}
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
                              <Box sx={{ flexShrink: 0 }}>{getFileIcon(row.file_name)}</Box>
                              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                                <Tooltip title={row.file_name}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{ fontWeight: 700, fontSize: "0.79rem", lineHeight: 1.25 }}
                                  >
                                    {row.file_name}
                                  </Typography>
                                </Tooltip>
                                {row.current.department_order && (
                                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                                    {row.current.department_order}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Proposed Title */}
                          <TableCell sx={{ maxWidth: 280 }}>
                            {p?.title ? (
                              <Box>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{ fontWeight: 700, fontSize: "0.8rem", color: titleChanged ? "primary.main" : "text.primary" }}
                                >
                                  {p.title}
                                </Typography>
                                {titleChanged && (
                                  <Typography variant="caption" noWrap sx={{ color: "text.secondary", fontSize: "0.68rem", display: "block" }}>
                                    Orig: &quot;{row.current.title || "None"}&quot;
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="error" sx={{ fontSize: "0.78rem" }}>
                                {row.error_message || "Extraction failed"}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Proposed Type & Confidence */}
                          <TableCell>
                            {p?.document_type ? (
                              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                                <Chip
                                  size="small"
                                  label={p.document_type}
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                                />
                                <Chip
                                  size="small"
                                  label={`${conf}%`}
                                  sx={{
                                    height: 18,
                                    fontSize: "0.64rem",
                                    fontWeight: 800,
                                    bgcolor:
                                      conf >= 85
                                        ? alpha("#10B981", 0.12)
                                        : conf >= 70
                                        ? alpha("#06B6D4", 0.12)
                                        : alpha("#F59E0B", 0.14),
                                    color:
                                      conf >= 85
                                        ? "#059669"
                                        : conf >= 70
                                        ? "#0284C7"
                                        : "#D97706",
                                  }}
                                />
                              </Stack>
                            ) : (
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                —
                              </Typography>
                            )}
                          </TableCell>

                          {/* Flags Column */}
                          <TableCell>
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                              {row.needs_human_review && (
                                <Chip
                                  size="small"
                                  color="warning"
                                  icon={<WarningAmberRoundedIcon sx={{ fontSize: "11px !important" }} />}
                                  label="Needs Review"
                                  sx={{ height: 19, fontSize: "0.64rem", fontWeight: 700 }}
                                />
                              )}
                              {duplicateCount > 0 && (
                                <Chip
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  label={`${duplicateCount} Duplicate${duplicateCount > 1 ? "s" : ""}`}
                                  sx={{ height: 19, fontSize: "0.64rem", fontWeight: 800 }}
                                />
                              )}
                              {issueCount > 0 && (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`${issueCount} Issue${issueCount > 1 ? "s" : ""}`}
                                  sx={{ height: 19, fontSize: "0.64rem" }}
                                />
                              )}
                              {!row.needs_human_review && duplicateCount === 0 && issueCount === 0 && p && (
                                <Chip
                                  size="small"
                                  icon={<BoltRoundedIcon sx={{ fontSize: "11px !important", color: "#06B6D4" }} />}
                                  label="Clean"
                                  sx={{ height: 19, fontSize: "0.64rem", fontWeight: 700, bgcolor: alpha("#06B6D4", 0.08) }}
                                />
                              )}
                            </Stack>
                          </TableCell>

                          {/* Created */}
                          <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: "0.74rem" }}>
                            {formatDate(row.created_at)}
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                              {status === "pending" && (
                                <Tooltip title="Quick Accept as proposed">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => handleQuickAccept(e, row)}
                                    sx={{ p: 0.5, "&:hover": { bgcolor: alpha("#10B981", 0.12), color: "success.main" } }}
                                  >
                                    <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {status === "failed" && (
                                <Tooltip title="Re-run Alon">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => handleQuickRerun(e, row)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <RefreshRoundedIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Inspect & Verify in Studio">
                                <IconButton
                                  size="small"
                                  onClick={() => setSelectedId(row.id)}
                                  sx={{ p: 0.5, color: "text.secondary" }}
                                >
                                  <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* 4. Dual-Pane Review Studio Drawer */}
          <ProposalReviewDrawer
            key={selectedId ?? "closed"}
            proposalId={selectedId}
            open={selectedId !== null}
            onClose={() => setSelectedId(null)}
            onReviewed={(message, severity = "success") => {
              setSelectedId(null);
              reload();
              window.dispatchEvent(new Event(ARCHIVE_REVIEW_CHANGED));
              setToast({ message, severity });
            }}
          />

          {/* Notification Feedback Toast */}
          <Snackbar
            open={toast !== null}
            autoHideDuration={4000}
            onClose={() => setToast(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            {toast ? (
              <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
                {toast.message}
              </Alert>
            ) : undefined}
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
}
