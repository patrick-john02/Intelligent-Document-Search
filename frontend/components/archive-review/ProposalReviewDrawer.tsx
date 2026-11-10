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

const STATUS_MAP: Record<string, { label: string; color: "default" | "warning" | "success" | "info" | "error" }> = {
  pending: { label: "Pending Review", color: "warning" },
  accepted: { label: "Approved", color: "success" },
  edited: { label: "Approved (Edited)", color: "info" },
  rejected: { label: "Rejected", color: "error" },
  failed: { label: "Failed", color: "error" },
  superseded: { label: "Superseded", color: "default" },
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
      onReviewed("This proposal was already reviewed.", "warning");
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
        res.status === "edited" ? "Document approved with edits." : "Document approved.",
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
      onReviewed("Proposal rejected.", "info");
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
      onReviewed("Document queued for re-processing.", "info");
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
            label: "Document Type",
            field: "document_type",
            current: proposal.current.document_type,
            alon: alon?.document_type,
          },
          {
            label: "Year",
            field: "series_year",
            current: proposal.current.series_year,
            alon: alon?.series_year,
          },
          {
            label: "Order / Ref No.",
            field: "department_order",
            current: proposal.current.department_order,
            alon: alon?.department_order,
          },
          {
            label: "Shelf Location",
            field: "physical_shelf_location",
            current: proposal.current.physical_shelf_location,
            alon: alon?.suggested_shelf_location,
          },
        ]
      : [];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") return <TableChartRoundedIcon sx={{ fontSize: 20, color: "#10B981" }} />;
    if (ext === "docx" || ext === "doc") return <ArticleRoundedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />;
    if (ext === "pdf") return <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: "#EF4444" }} />;
    return <InsertDriveFileRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />;
  };

  const statusConfig = proposal ? STATUS_MAP[proposal.status] || { label: proposal.status, color: "default" } : null;

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
              md: showDocViewer ? 860 : 580,
              lg: showDocViewer ? 1080 : 620,
              xl: showDocViewer ? 1200 : 680,
            },
            maxWidth: "98vw",
            boxShadow: 8,
            transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, flex: 1, mr: 2 }}>
            <Box sx={{ flexShrink: 0 }}>
              {proposal ? getFileIcon(proposal.file_name) : <InsertDriveFileRoundedIcon />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {proposal?.file_name ?? "Document Review"}
              </Typography>
              {proposal && statusConfig && (
                <Stack direction="row" spacing={1} sx={{ mt: 0.25, alignItems: "center" }}>
                  <Chip
                    size="small"
                    color={statusConfig.color}
                    label={statusConfig.label}
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                  {proposal.needs_human_review && proposal.status === "pending" && (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      icon={<WarningAmberRoundedIcon sx={{ fontSize: "13px !important" }} />}
                      label="Needs Attention"
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title={showDocViewer ? "Hide document preview" : "Show document preview"}>
              <Button
                size="small"
                variant={showDocViewer ? "contained" : "outlined"}
                color="inherit"
                onClick={() => setShowDocViewer((prev) => !prev)}
                startIcon={showDocViewer ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                {showDocViewer ? "Hide Preview" : "Show Preview"}
              </Button>
            </Tooltip>

            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Dual-Pane Workspace */}
        <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          {/* Left Pane: Document Viewer */}
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

          {/* Right Pane: Review Form & Information */}
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
                <CircularProgress size={32} />
              </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {proposal && final && (
              <Stack spacing={2.5}>
                {/* AI Extracted Summary */}
                {alon ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75, justifyContent: "space-between" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        Document Summary
                      </Typography>
                      {alon.document_type_confidence && (
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          Confidence: {Math.round(alon.document_type_confidence * 100)}%
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "text.secondary", lineHeight: 1.5 }}>
                      {alon.summary || "Metadata extracted automatically."}
                    </Typography>
                  </Paper>
                ) : (
                  <Alert severity="error">
                    Could not extract document metadata{proposal.error_message ? `: ${proposal.error_message}` : "."}
                  </Alert>
                )}

                {/* Flagged Issues */}
                {alon && alon.issues.length > 0 && (
                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.dark" }}>
                      Issues Flagged ({alon.issues.length})
                    </Typography>
                    {alon.issues.map((issue, i) => (
                      <Alert key={i} severity="warning" sx={{ py: 0.25, fontSize: "0.8rem" }}>
                        {issue}
                      </Alert>
                    ))}
                  </Stack>
                )}

                {/* Duplicates Warning */}
                {alon && alon.duplicates.length > 0 && (
                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>
                      Duplicate Warning ({alon.duplicates.length})
                    </Typography>
                    {alon.duplicates.map((d) => (
                      <Alert key={d.document_id} severity="error" variant="outlined" sx={{ py: 0.5, fontSize: "0.8rem" }}>
                        Matches <strong>Document #{d.document_id}</strong> &quot;{d.title}&quot; ({Math.round(d.similarity * 100)}% match)
                      </Alert>
                    ))}
                  </Stack>
                )}

                {/* Field Comparison Grid */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Document Metadata
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
                    <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03) }}>
                      <TableRow>
                        <TableCell sx={{ width: 110, fontWeight: 700, fontSize: "0.75rem" }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary" }}>Original</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "primary.main" }}>Proposed</TableCell>
                        <TableCell sx={{ width: 180, fontWeight: 700, fontSize: "0.75rem" }}>Approved Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r) => {
                        const isDiffer = String(r.current || "").trim() !== String(r.alon || "").trim();
                        return (
                          <TableRow key={r.field} sx={{ bgcolor: isDiffer ? alpha("#0284C7", 0.03) : "inherit" }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem" }}>{r.label}</TableCell>
                            <TableCell sx={{ color: "text.secondary", fontSize: "0.78rem", wordBreak: "break-word" }}>
                              {show(r.current)}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.78rem", wordBreak: "break-word", fontWeight: isDiffer ? 600 : 400 }}>
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
                                  sx={{ "& .MuiInputBase-input": { fontSize: "0.78rem", py: 0.5 } }}
                                >
                                  {docTypes.map((t) => (
                                    <MenuItem key={t} value={t} sx={{ fontSize: "0.8rem" }}>
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
                                  sx={{ "& .MuiInputBase-input": { fontSize: "0.78rem", py: 0.5 } }}
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
                  <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                    Reviewed on {new Date(proposal.reviewed_at).toLocaleString()}
                    {proposal.review_note ? ` — Note: "${proposal.review_note}"` : ""}
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
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          {actionError && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.8rem" }}>{actionError}</Alert>}

          {proposal && editable && (
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Reviewer Note (optional for approval, required for rejection)"
                placeholder="Add any verification comments..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={saving}
                sx={{ "& .MuiInputBase-input": { fontSize: "0.82rem" } }}
              />

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleReject}
                  disabled={saving || !canReject}
                  startIcon={<CancelRoundedIcon />}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.82rem" }}
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
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    px: 2.5,
                  }}
                >
                  {changedCount > 0
                    ? `Approve with ${changedCount} edit${changedCount > 1 ? "s" : ""}`
                    : "Approve Document"}
                </Button>
              </Stack>
            </Stack>
          )}

          {proposal && proposal.status === "failed" && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Processing could not be completed. You can re-run the extraction.
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleRerun}
                disabled={saving}
                startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Re-run Extraction
              </Button>
            </Stack>
          )}

          {proposal && !editable && proposal.status !== "failed" && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
              This document has already been saved to the archive.
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
