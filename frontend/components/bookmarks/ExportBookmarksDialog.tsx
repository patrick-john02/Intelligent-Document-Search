"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import GoogleIcon from "@mui/icons-material/Google";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { BookmarkItem } from "./types";

interface ExportBookmarksDialogProps {
  open: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onConfirmExport: (format: string, includeNotes: boolean) => void;
  userEmail?: string;
}

export default function ExportBookmarksDialog({
  open,
  onClose,
  bookmarks,
  onConfirmExport,
  userEmail,
}: ExportBookmarksDialogProps) {
  const [exportFormat, setExportFormat] = useState("gdocs");
  const [includeNotes, setIncludeNotes] = useState(true);

  const handleExport = () => {
    onConfirmExport(exportFormat, includeNotes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
        <GoogleIcon sx={{ color: "#4285F4" }} />
        Export Saved Directives & Annotations
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            Exporting <strong>{bookmarks.length} bookmarked directives</strong> to your workspace.
          </Alert>

          {/* Export Destination Format */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 1 }}>
              SELECT EXPORT DESTINATION
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                {/* Google Docs Option */}
                <Box
                  sx={(theme) => ({
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: exportFormat === "gdocs" ? "#4285F4" : "divider",
                    bgcolor: exportFormat === "gdocs" ? "rgba(66, 133, 244, 0.04)" : "background.paper",
                    mb: 1.5,
                  })}
                >
                  <FormControlLabel
                    value="gdocs"
                    control={<Radio sx={{ "&.Mui-checked": { color: "#4285F4" } }} />}
                    label={
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DescriptionRoundedIcon sx={{ color: "#4285F4", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Google Docs Research Digest
                          </Typography>
                          <Chip size="small" label="Recommended" color="primary" sx={{ height: 20, fontSize: "0.68rem" }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                          Creates a Google Document in <code>My Drive / Intelligent Document Search / Bookmarks</code> with clickable links and personal study notes.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* PDF Option */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: exportFormat === "pdf" ? "primary.main" : "divider",
                    bgcolor: exportFormat === "pdf" ? "action.selected" : "background.paper",
                    mb: 1.5,
                  }}
                >
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label={
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PictureAsPdfRoundedIcon sx={{ color: "#EF4444", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Printable Research Summary (PDF)
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                          Formatted for official submission, physical archiving, or print briefing.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* CSV / Sheets Option */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: exportFormat === "csv" ? "primary.main" : "divider",
                    bgcolor: exportFormat === "csv" ? "action.selected" : "background.paper",
                  }}
                >
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TableChartRoundedIcon sx={{ color: "#10B981", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Spreadsheet Export (Google Sheets / CSV)
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                          Tabular data with order numbers, publication years, barcodes, and collections.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Options */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Include my personal annotations & study notes in the export
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: exportFormat === "gdocs" ? "#4285F4" : "primary.main",
            "&:hover": { bgcolor: exportFormat === "gdocs" ? "#3367D6" : "primary.dark" },
          }}
        >
          {exportFormat === "gdocs" ? "Export to Google Docs" : "Generate Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
