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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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

interface ProposalReviewDrawerProps {
  proposalId: number | null;
  open: boolean;
  onClose: () => void;
  // called after an action: the page closes the drawer, refreshes the queue and shows a Snackbar
  onReviewed: (message: string, severity?: "success" | "info" | "warning") => void;
}

// The editable "Final" column. Year is a string while typing; converted to a number on accept.
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

// Same rule as the backend: Alon's value if he has one, otherwise the current value
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

export default function ProposalReviewDrawer({ proposalId, open, onClose, onReviewed }: ProposalReviewDrawerProps) {
  const [proposal, setProposal] = useState<ArchiveProposal | null>(null);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // the page remounts the drawer per proposal (key)
  const [error, setError] = useState<string | null>(null);

  // `initial` = the prefilled values; `final` = what the reviewer is editing.
  // Step 5 compares them so we only send the fields the reviewer actually changed.
  const [initial, setInitial] = useState<FinalValues | null>(null);
  const [final, setFinal] = useState<FinalValues | null>(null);

  // Step 5: action state
  const [note, setNote] = useState<string>("");                 // optional for accept, required for reject
  const [saving, setSaving] = useState<boolean>(false);          // disables buttons (no double clicks)
  const [actionError, setActionError] = useState<string | null>(null);

  // Load the proposal when the drawer opens. The page gives the drawer key={proposalId},
  // so each proposal starts with fresh state: no resets here (state only set in async callbacks).
  useEffect(() => {
    if (!open || proposalId === null) return;
    let cancelled = false; // ignore a slow response if the drawer was closed meanwhile

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

  // The type list rarely changes: load it once
  useEffect(() => {
    listDocumentTypes().then(setDocTypes).catch(() => setDocTypes([]));
  }, []);

  const setField = (field: keyof FinalValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFinal((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  // Only the fields the reviewer CHANGED from the prefilled value.
  // Sending unchanged prefilled values (e.g. the user's "test" when Alon had none) would make the
  // backend think the reviewer overrode Alon -> wrongly 'edited' -> wrong edit-rate metric.
  const buildAcceptBody = (): AcceptBody => {
    const body: AcceptBody = {};
    if (!initial || !final) return body;
    const changed = (f: keyof FinalValues) => final[f].trim() !== initial[f].trim() && final[f].trim() !== "";

    if (changed("title")) body.title = final.title.trim();
    if (changed("document_type")) body.document_type = final.document_type;
    if (changed("series_year")) body.series_year = Number(final.series_year);
    if (changed("department_order")) body.department_order = final.department_order.trim();
    if (changed("physical_shelf_location")) body.physical_shelf_location = final.physical_shelf_location.trim();
    if (note.trim()) body.review_note = note.trim();
    return body;
  };

  // Shared error handling for all actions
  const handleActionError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 409) {
      // someone else reviewed it first: close + refresh so the list is correct
      onReviewed("This proposal was already reviewed", "warning");
      return;
    }
    setActionError(errorText(err)); // 400 (invalid type), 404, 422... show the backend's message
  };

  const handleAccept = async () => {
    if (!proposal) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await acceptProposal(proposal.id, buildAcceptBody());
      onReviewed(res.status === "edited" ? "Accepted with your changes ✓" : "Accepted ✓", "success");
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
      onReviewed("Rejected ✓", "info");
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
      onReviewed("Alon is re-reviewing; check back in about a minute.", "info");
    } catch (err) {
      handleActionError(err);
    } finally {
      setSaving(false);
    }
  };

  const changedCount = Object.keys(buildAcceptBody()).filter((k) => k !== "review_note").length;
  const canReject = note.trim().length >= 3; // same rule as the backend (min_length=3)

  const alon = proposal?.proposal ?? null;
  const editable = proposal?.status === "pending"; // only pending proposals can be changed

  // Rows of the comparison table: label, what the user typed, what Alon proposed, final field
  const rows: { label: string; field: keyof FinalValues; current: unknown; alon: unknown }[] = proposal
    ? [
        { label: "Title", field: "title", current: proposal.current.title, alon: alon?.title },
        { label: "Type", field: "document_type", current: proposal.current.document_type, alon: alon?.document_type },
        { label: "Year", field: "series_year", current: proposal.current.series_year, alon: alon?.series_year },
        { label: "Department", field: "department_order", current: proposal.current.department_order, alon: alon?.department_order },
        { label: "Shelf", field: "physical_shelf_location", current: proposal.current.physical_shelf_location, alon: alon?.suggested_shelf_location },
      ]
    : [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 560 } } } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* ---- Header ---- */}
        <Box sx={{ p: 2, display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
              {proposal?.file_name ?? "Archive proposal"}
            </Typography>
            {proposal && (
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap" }}>
                <Chip size="small" color={STATUS_COLOR[proposal.status] ?? "default"} label={proposal.status} />
                {proposal.needs_human_review && <Chip size="small" color="warning" variant="outlined" label="Needs review" />}
                {proposal.model_name && <Chip size="small" variant="outlined" label={proposal.model_name} />}
              </Stack>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* ---- Body (scrolls) ---- */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {proposal && final && (
            <Stack spacing={2.5}>
              {/* Alon failed: there is no proposal to compare */}
              {!alon && (
                <Alert severity="error">
                  Alon could not review this document{proposal.error_message ? `: ${proposal.error_message}` : "."}
                </Alert>
              )}

              {/* Summary */}
              {alon?.summary && (
                <Box>
                  <Typography variant="overline" color="text.secondary">Alon&apos;s summary</Typography>
                  <Typography variant="body2">{alon.summary}</Typography>
                </Box>
              )}

              {/* Issues: most important for the reviewer, so near the top */}
              {alon && alon.issues.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">Issues ({alon.issues.length})</Typography>
                  {alon.issues.map((issue, i) => (
                    <Alert key={i} severity="warning" sx={{ py: 0 }}>{issue}</Alert>
                  ))}
                </Stack>
              )}

              {/* Possible duplicates */}
              {alon && alon.duplicates.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">Possible duplicates</Typography>
                  {alon.duplicates.map((d) => (
                    <Alert key={d.document_id} severity="error" variant="outlined" sx={{ py: 0 }}>
                      Document #{d.document_id} “{d.title}” — {d.match_type}, {Math.round(d.similarity * 100)}% similar
                    </Alert>
                  ))}
                </Stack>
              )}

              {/* Comparison table: the heart of the review */}
              <Box>
                <Typography variant="overline" color="text.secondary">Review the values</Typography>
                <Table size="small" sx={{ "& td, & th": { verticalAlign: "top", px: 1 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 90 }}>Field</TableCell>
                      <TableCell>Current</TableCell>
                      <TableCell>Alon</TableCell>
                      <TableCell sx={{ width: 190 }}>Final</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.field}>
                        <TableCell sx={{ fontWeight: 600 }}>{r.label}</TableCell>
                        <TableCell sx={{ color: "text.secondary", wordBreak: "break-word" }}>{show(r.current)}</TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>{show(r.alon)}</TableCell>
                        <TableCell>
                          {r.field === "document_type" ? (
                            <TextField
                              select
                              size="small"
                              fullWidth
                              value={final.document_type}
                              onChange={setField("document_type")}
                              disabled={!editable}
                            >
                              {docTypes.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
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
                              slotProps={r.field === "series_year" ? { htmlInput: { min: 1900, max: 2100 } } : undefined}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {alon?.suggested_new_type && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Alon suggests a new type: <b>{alon.suggested_new_type}</b> (not in the list yet, so choose the closest type, e.g. &quot;other&quot;).
                  </Typography>
                )}
              </Box>

              {/* Evidence: read-only, so the reviewer can check Alon's reasoning */}
              {alon && (
                <Box>
                  <Typography variant="overline" color="text.secondary">Evidence</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <b>Why this type</b> ({Math.round(alon.document_type_confidence * 100)}% confident
                    {alon.agrees_with_classifier ? ", agrees with the classifier" : ", disagrees with the classifier"}):{" "}
                    {alon.document_type_reason}
                  </Typography>
                  {alon.shelf_location_reason && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <b>Shelf location:</b> {alon.shelf_location_reason}
                    </Typography>
                  )}
                  {alon.key_fields.length > 0 && (
                    <Table size="small">
                      <TableBody>
                        {alon.key_fields.map((k, i) => (
                          <TableRow key={`${k.name}-${i}`}>
                            <TableCell sx={{ fontWeight: 600, width: 150 }}>{k.name}</TableCell>
                            <TableCell sx={{ wordBreak: "break-word" }}>{k.value}</TableCell>
                            <TableCell sx={{ color: "text.secondary", width: 60 }}>{k.page ? `p. ${k.page}` : ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>
              )}

              {/* Already reviewed: show the outcome */}
              {!editable && proposal.reviewed_at && (
                <Alert severity="info">
                  Reviewed {new Date(proposal.reviewed_at).toLocaleString()}
                  {proposal.review_note ? ` — “${proposal.review_note}”` : ""}
                </Alert>
              )}
            </Stack>
          )}
        </Box>

        {/* ---- Footer: actions ---- */}
        <Divider />
        <Box sx={{ p: 2 }}>
          {actionError && <Alert severity="error" sx={{ mb: 1.5 }}>{actionError}</Alert>}

          {proposal && editable && (
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Note (optional to accept, required to reject)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={1}
                maxRows={3}
                disabled={saving}
              />
              <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={saving || !canReject}
                  title={canReject ? "" : "Write a note (3+ characters) to reject"}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAccept}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {changedCount > 0 ? `Accept with ${changedCount} change${changedCount > 1 ? "s" : ""}` : "Accept"}
                </Button>
              </Stack>
            </Stack>
          )}

          {proposal && proposal.status === "failed" && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                Alon could not finish. You can ask him to try again.
              </Typography>
              <Button variant="contained" onClick={handleRerun} disabled={saving}>
                Re-run Alon
              </Button>
            </Stack>
          )}

          {proposal && !editable && proposal.status !== "failed" && (
            <Typography variant="caption" color="text.secondary">
              This proposal has already been handled.
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
