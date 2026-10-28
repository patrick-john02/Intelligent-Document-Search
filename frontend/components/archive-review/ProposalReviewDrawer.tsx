"use client";

import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";

// Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { ApiError } from "@/lib/api";
import {
  AcceptBody,
  ArchiveProposal,
  acceptProposal,
  getProposal,
  listDocumentTypes,
  rejectProposal,
  rerunAlon,
} from "@/lib/archiveReviewApi";
import ProposalDocumentViewer from "./ProposalDocumentViewer";

interface ProposalReviewDrawerProps {
  proposalId: number | null;
  open: boolean;
  onClose: () => void;
  onReviewed: (message: string, severity?: "success" | "info" | "warning") => void;
}

export interface FinalValues {
  title: string;
  document_type: string;
  series_year: string;
  department_order: string;
  physical_shelf_location: string;
}

const errorText = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?";

const STATUS_COLOR: Record<string, "default" | "warning" | "success" | "info" | "error"> = {
  pending: "warning",
  accepted: "success",
  edited: "info",
  rejected: "error",
  failed: "error",
  superseded: "default",
};

const prefill = (p: ArchiveProposal): FinalValues => {
  const alon = p.proposal;
  const cur = p.current;
  return {
    title: alon?.title || cur.title || "",
    document_type: alon?.document_type || cur.document_type || "",
    series_year: String(alon?.series_year ?? cur.series_year ?? ""),
    department_order: alon?.department_order || cur.department_order || "",
    physical_shelf_location: alon?.suggested_shelf_location || cur.physical_shelf_location || "",
  };
};

const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));

export default function ProposalReviewDrawer({
  proposalId,
  open,
  onClose,
  onReviewed,
}: ProposalReviewDrawerProps) {
  const [proposal, setProposal] = useState<ArchiveProposal | null>(null);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [initial, setInitial] = useState<FinalValues | null>(null);
  const [final, setFinal] = useState<FinalValues | null>(null);

  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Dual-pane controls
  const [showDocViewer, setShowDocViewer] = useState<boolean>(true);
  const [activePageHint, setActivePageHint] = useState<number | null>(null);

  useEffect(() => {
    if (!open || proposalId === null) return;
    let cancelled = false;

    getProposal(proposalId)
      .then((p) => {
        if (cancelled) return;
        setProposal(p);
        const values = prefill(p);
        setInitial(values);
        setFinal(values);
      })
      .catch((err) => !cancelled && setError(errorText(err)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, proposalId]);

  useEffect(() => {
    listDocumentTypes().then(setDocTypes).catch(() => setDocTypes([]));
  }, []);

  const setField = (field: keyof FinalValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFinal((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  const buildAcceptBody = (): AcceptBody => {
    const body: AcceptBody = {};
    if (!initial || !final) return body;
    const changed = (f: keyof FinalValues) =>
      final[f].trim() !== initial[f].trim() && final[f].trim() !== "";

    if (changed("title")) body.title = final.title.trim();
    if (changed("document_type")) body.document_type = final.document_type;
    if (changed("series_year")) body.series_year = Number(final.series_year);
    if (changed("department_order")) body.department_order = final.department_order.trim();
    if (changed("physical_shelf_location"))
      body.physical_shelf_location = final.physical_shelf_location.trim();
    if (note.trim()) body.review_note = note.trim();
    return body;
  };

  const handleActionError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 409) {
      onReviewed("This proposal was already reviewed", "warning");
      return;
    }
    setActionError(errorText(err));
  };

  const handleAccept = async () => {
    if (!proposal) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await acceptProposal(proposal.id, buildAcceptBody());
      onReviewed(
        res.status === "edited" ? "Accepted with archivist changes ✓" : "Accepted as proposed ✓",
        "success"
      );
    } catch (err) {
      handleActionError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    setSaving(true);
    setActionError(null);
    try {
      await rejectProposal(proposal.id, note.trim());
      onReviewed("Proposal rejected ✓", "info");
    } catch (err) {
      handleActionError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRerun = async () => {
    if (!proposal) return;
    setSaving(true);
    setActionError(null);
    try {
      await rerunAlon(proposal.document_version_id);
      onReviewed("Alon pipeline re-queued; review will update in ~1 minute.", "info");
    } catch (err) {
      handleActionError(err);
    } finally {
      setSaving(false);
    }
  };

  const changedCount = Object.keys(buildAcceptBody()).filter((k) => k !== "review_note").length;
  const canReject = note.trim().length >= 3;
  const alon = proposal?.proposal ?? null;
  const editable = proposal?.status === "pending";

  const rows: { label: string; field: keyof FinalValues; current: unknown; alon: unknown }[] =
    proposal
      ? [
          { label: "Title", field: "title", current: proposal.current.title, alon: alon?.title },
          {
            label: "Doc Type",
            field: "document_type",
            current: proposal.current.document_type,
            alon: alon?.document_type,
          },
          {
            label: "Series Year",
            field: "series_year",
            current: proposal.current.series_year,
            alon: alon?.series_year,
          },
          {
            label: "Order No.",
            field: "department_order",
            current: proposal.current.department_order,
            alon: alon?.department_order,
          },
          {
            label: "Shelf Coords",
            field: "physical_shelf_location",
            current: proposal.current.physical_shelf_location,
            alon: alon?.suggested_shelf_location,
          },
        ]
      : [];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") return <TableChartRoundedIcon sx={{ fontSize: 18, color: "#10B981" }} />;
    if (ext === "docx" || ext === "doc") return <ArticleRoundedIcon sx={{ fontSize: 18, color: "#3B82F6" }} />;
    if (ext === "pdf") return <PictureAsPdfRoundedIcon sx={{ fontSize: 18, color: "#EF4444" }} />;
    return <InsertDriveFileRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />;
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
              md: showDocViewer ? 860 : 600,
              lg: showDocViewer ? 1120 : 640,
              xl: showDocViewer ? 1280 : 700,
            },
            maxWidth: "98vw",
            boxShadow: "0 0 40px rgba(0,0,0,0.25)",
            transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Top Accent Bar */}
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #06B6D4, #3B82F6, #10B981)",
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            p: 2,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.8)
                : alpha("#06B6D4", 0.03),
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, flex: 1, mr: 2 }}>
            <Box sx={{ flexShrink: 0 }}>
              {proposal ? getFileIcon(proposal.file_name) : <InsertDriveFileRoundedIcon />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>
                {proposal?.file_name ?? "Archive Review Studio"}
              </Typography>
              {proposal && (
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, alignItems: "center", flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    color={STATUS_COLOR[proposal.status] ?? "default"}
                    label={proposal.status.toUpperCase()}
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 800 }}
                  />
                  {proposal.needs_human_review && (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      icon={<WarningAmberRoundedIcon sx={{ fontSize: "12px !important" }} />}
                      label="Needs Review"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                    />
                  )}
                  {proposal.model_name && (
                    <Chip
                      size="small"
                      icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "12px !important", color: "#06B6D4" }} />}
                      label={`Alon (${proposal.model_name})`}
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: alpha("#06B6D4", 0.08) }}
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {/* Toggle Split Document Preview */}
            <Tooltip title={showDocViewer ? "Hide document scan viewer" : "Show document scan viewer"}>
              <Button
                size="small"
                variant={showDocViewer ? "contained" : "outlined"}
                color="inherit"
                onClick={() => setShowDocViewer((prev) => !prev)}
                startIcon={showDocViewer ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  borderRadius: 1.75,
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                {showDocViewer ? "Hide Scan" : "View Scan"}
              </Button>
            </Tooltip>

            <Tooltip title="Close (Esc)">
              <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Dual-Pane Workspace */}
        <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          {/* Left Pane: Document Viewer (if enabled) */}
          {showDocViewer && proposal && (
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                display: { xs: "none", md: "block" },
                height: "100%",
                flexShrink: 0,
              }}
            >
              <ProposalDocumentViewer
                versionId={proposal.document_version_id}
                fileName={proposal.file_name}
                pageHint={activePageHint}
              />
            </Box>
          )}

          {/* Right Pane: Alon Metadata & Verification Desk */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              overflowY: "auto",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={36} />
              </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {proposal && final && (
              <Stack spacing={2.5}>
                {/* Alon Extraction Header & Executive Summary */}
                {alon ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alpha("#06B6D4", 0.3),
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? alpha("#06B6D4", 0.06)
                          : alpha("#06B6D4", 0.03),
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <AutoAwesomeOutlinedIcon sx={{ fontSize: 17, color: "#06B6D4" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.84rem" }}>
                        Alon&apos;s Archival Extraction
                      </Typography>
                      <Chip
                        size="small"
                        label={`${Math.round((alon.document_type_confidence || 0) * 100)}% Confidence`}
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          bgcolor: alpha("#10B981", 0.12),
                          color: "#059669",
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.5 }}>
                      {alon.summary || "Metadata extracted via high-resolution OCR pipeline."}
                    </Typography>
                  </Paper>
                ) : (
                  <Alert severity="error">
                    Alon could not review this document{proposal.error_message ? `: ${proposal.error_message}` : "."}
                  </Alert>
                )}

                {/* Flagged Issues */}
                {alon && alon.issues.length > 0 && (
                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "warning.main" }}>
                      Issues Flagged ({alon.issues.length})
                    </Typography>
                    {alon.issues.map((issue, i) => (
                      <Alert key={i} severity="warning" sx={{ py: 0.25, fontSize: "0.78rem" }}>
                        {issue}
                      </Alert>
                    ))}
                  </Stack>
                )}

                {/* Possible Duplicates Warning */}
                {alon && alon.duplicates.length > 0 && (
                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "error.main" }}>
                      Duplicate Records Detected ({alon.duplicates.length})
                    </Typography>
                    {alon.duplicates.map((d) => (
                      <Alert key={d.document_id} severity="error" variant="outlined" sx={{ py: 0.5, fontSize: "0.78rem" }}>
                        Matches <strong>Document #{d.document_id}</strong> &quot;{d.title}&quot; — {d.match_type} ({Math.round(d.similarity * 100)}% similarity)
                      </Alert>
                    ))}
                  </Stack>
                )}

                {/* Key Field Evidence (Clickable to jump page) */}
                {alon && alon.key_fields.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "text.secondary",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Extracted Evidence Snippets
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      {alon.key_fields.map((k, i) => (
                        <Chip
                          key={`${k.name}-${i}`}
                          size="small"
                          label={`${k.name}: ${k.value}${k.page ? ` (p. ${k.page})` : ""}`}
                          onClick={() => {
                            if (k.page) {
                              setActivePageHint(k.page);
                              setShowDocViewer(true);
                            }
                          }}
                          sx={{
                            height: 24,
                            fontSize: "0.72rem",
                            cursor: k.page ? "pointer" : "default",
                            bgcolor: (theme) => alpha(theme.palette.divider, 0.08),
                            "&:hover": k.page ? { bgcolor: alpha("#06B6D4", 0.14), borderColor: "primary.main" } : {},
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Field Comparison Grid */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Field Verification & Overrides
                  </Typography>

                  <Table
                    size="small"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      "& th, & td": { verticalAlign: "middle", py: 0.75, px: 1 },
                    }}
                  >
                    <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02) }}>
                      <TableRow>
                        <TableCell sx={{ width: 85, fontWeight: 700, fontSize: "0.72rem" }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "text.secondary" }}>Upload Value</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "primary.main" }}>Alon Proposed</TableCell>
                        <TableCell sx={{ width: 180, fontWeight: 700, fontSize: "0.72rem" }}>Approved Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r) => {
                        const isDiffer = String(r.current || "").trim() !== String(r.alon || "").trim();
                        return (
                          <TableRow key={r.field} sx={{ bgcolor: isDiffer ? alpha("#06B6D4", 0.02) : "inherit" }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: "0.74rem" }}>{r.label}</TableCell>
                            <TableCell sx={{ color: "text.secondary", fontSize: "0.74rem", wordBreak: "break-word" }}>
                              {show(r.current)}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.74rem", wordBreak: "break-word", fontWeight: isDiffer ? 700 : 400 }}>
                              {show(r.alon)}
                            </TableCell>
                            <TableCell>
                              {r.field === "document_type" ? (
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={final.document_type}
                                  onChange={setField("document_type")}
                                  disabled={!editable}
                                  sx={{ "& .MuiInputBase-input": { fontSize: "0.74rem", py: 0.5 } }}
                                >
                                  {docTypes.map((t) => (
                                    <MenuItem key={t} value={t} sx={{ fontSize: "0.76rem" }}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              ) : (
                                <TextField
                                  size="small"
                                  fullWidth
                                  multiline={r.field === "title"}
                                  type={r.field === "series_year" ? "number" : "text"}
                                  value={final[r.field]}
                                  onChange={setField(r.field)}
                                  disabled={!editable}
                                  slotProps={
                                    r.field === "series_year"
                                      ? { htmlInput: { min: 1900, max: 2100 } }
                                      : undefined
                                  }
                                  sx={{ "& .MuiInputBase-input": { fontSize: "0.74rem", py: 0.5 } }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>

                {/* Outcome note if already reviewed */}
                {!editable && proposal.reviewed_at && (
                  <Alert severity="info" sx={{ fontSize: "0.78rem" }}>
                    Verified on {new Date(proposal.reviewed_at).toLocaleString()}
                    {proposal.review_note ? ` — Note: “${proposal.review_note}”` : ""}
                  </Alert>
                )}
              </Stack>
            )}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Divider />
        <Box
          sx={{
            p: 2,
            px: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.95)
                : alpha(theme.palette.background.default, 0.6),
            flexShrink: 0,
          }}
        >
          {actionError && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.78rem" }}>{actionError}</Alert>}

          {proposal && editable && (
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Reviewer Audit Note (optional for accept, required for reject)"
                placeholder="e.g. Verified against physical voucher record #402"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={saving}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.78rem" } }}
              />

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleReject}
                  disabled={saving || !canReject}
                  startIcon={<CancelRoundedIcon />}
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8rem" }}
                >
                  Reject Proposal
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleAccept}
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <CheckCircleRoundedIcon />
                    )
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    px: 2.5,
                    boxShadow: "0 2px 8px rgba(6, 182, 212, 0.25)",
                  }}
                >
                  {changedCount > 0
                    ? `Accept with ${changedCount} edit${changedCount > 1 ? "s" : ""}`
                    : "Accept as Proposed"}
                </Button>
              </Stack>
            </Stack>
          )}

          {proposal && proposal.status === "failed" && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Extraction pipeline did not complete. Re-run Alon to parse high-res OCR again.
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleRerun}
                disabled={saving}
                startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Re-run Alon
              </Button>
            </Stack>
          )}

          {proposal && !editable && proposal.status !== "failed" && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
              This proposal has already been committed to the archive registry.
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
