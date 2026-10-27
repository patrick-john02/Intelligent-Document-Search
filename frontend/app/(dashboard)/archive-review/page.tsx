"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
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
import { alpha } from "@mui/material/styles";

// Layout (same as the other dashboard pages)
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

import { ApiError } from "@/lib/api";
import { ArchiveProposal, ProposalStatus, listQueue, ARCHIVE_REVIEW_CHANGED } from "@/lib/archiveReviewApi";
import ProposalReviewDrawer from "@/components/archive-review/ProposalReviewDrawer";

// Tabs shown at the top (superseded is internal history, so it's not a tab)
const STATUS_TABS: { value: ProposalStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "edited", label: "Edited" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
];

const errorText = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?";

// Backend stores naive UTC timestamps (no "Z"), so mark them as UTC before formatting
const formatDate = (iso: string): string => {
  const d = new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  return isNaN(d.getTime()) ? "" : d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

export default function ArchiveReviewPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // ---- state ----
  const [status, setStatus] = useState<ProposalStatus>("pending");
  const [rows, setRows] = useState<ArchiveProposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // true on first load
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null); // drawer opens for this proposal
  const [toast, setToast] = useState<{ message: string; severity: "success" | "info" | "warning" } | null>(null);

  const [reloadKey, setReloadKey] = useState<number>(0);  // bump to re-fetch the current tab
  const deepLinkDone = useRef<boolean>(false);

  // ---- data loading ----
  // Runs whenever `status` (tab) or `reloadKey` changes. Without `status` in the dependency
  // array, switching tabs would keep showing the first tab's rows.
  // State is only set inside the async callbacks (React rule: no synchronous setState in effects).
  useEffect(() => {
    let cancelled = false; // ignore a slow response if the user already switched tabs

    listQueue(status)
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setError(null);

        // Deep link (once): /archive-review?proposal=12 opens that proposal's drawer
        // (used by the upload modal's "Review now" button)
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

  // Event handlers set `loading` (allowed), then the effect above fetches
  const changeTab = (value: ProposalStatus) => {
    setLoading(true);
    setStatus(value);
  };
  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
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
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Title */}
          <Box sx={{ py: 1.5, flexShrink: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Archive Review
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Alon proposes the archive metadata for each upload. Check it, correct it if needed, and accept or reject.
            </Typography>
          </Box>

          {/* Status tabs */}
          <Tabs
            value={status}
            onChange={(_, value: ProposalStatus) => changeTab(value)}
            sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
          >
            {STATUS_TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} />
            ))}
          </Tabs>

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflow: "auto", pt: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : rows.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                <Typography variant="h6">
                  {status === "pending" ? "Nothing to review 🎉" : "No proposals here yet"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>File</TableCell>
                      <TableCell>Current title</TableCell>
                      <TableCell>Alon&apos;s title</TableCell>
                      <TableCell>Proposed type</TableCell>
                      <TableCell>Flags</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const p = row.proposal; // null when Alon failed
                      const issueCount = p?.issues?.length ?? 0;
                      const duplicateCount = p?.duplicates?.length ?? 0;
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={row.id === selectedId}
                          onClick={() => setSelectedId(row.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.file_name}
                          </TableCell>
                          <TableCell>{row.current.title}</TableCell>
                          <TableCell sx={{ maxWidth: 320 }}>
                            {p?.title ?? <Typography variant="body2" color="error">{row.error_message ?? "No proposal"}</Typography>}
                          </TableCell>
                          <TableCell>{p?.document_type ?? "—"}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                              {row.needs_human_review && <Chip size="small" color="warning" label="Needs review" />}
                              {issueCount > 0 && <Chip size="small" variant="outlined" label={`${issueCount} issue${issueCount > 1 ? "s" : ""}`} />}
                              {duplicateCount > 0 && <Chip size="small" color="error" variant="outlined" label={`${duplicateCount} duplicate${duplicateCount > 1 ? "s" : ""}`} />}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(row.created_at)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Review drawer: opens for the clicked row */}
          <ProposalReviewDrawer
            key={selectedId ?? "closed"} /* new proposal = fresh drawer state, no manual resets needed */
            proposalId={selectedId}
            open={selectedId !== null}
            onClose={() => setSelectedId(null)}
            onReviewed={(message, severity = "success") => {
              setSelectedId(null);                                    // close the drawer
              reload();                                               // refresh the list (item leaves "Pending")
              window.dispatchEvent(new Event(ARCHIVE_REVIEW_CHANGED)); // tell the menu badge to recount
              setToast({ message, severity });
            }}
          />

          {/* Success / info message after an action */}
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
