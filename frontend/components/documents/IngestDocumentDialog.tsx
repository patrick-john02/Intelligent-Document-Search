"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

interface IngestDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onIngestSuccess: (newDoc: any) => void;
}

export default function IngestDocumentDialog({
  open,
  onClose,
  onIngestSuccess,
}: IngestDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [seriesYear, setSeriesYear] = useState("2024");
  const [category, setCategory] = useState("Assessment Regulations");
  const [clearance, setClearance] = useState("Public");
  const [cabinet, setCabinet] = useState("Cabinet A");
  const [shelf, setShelf] = useState("Shelf 1");
  const [folder, setFolder] = useState("Folder 01");
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !orderNo.trim()) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      title,
      orderNo,
      seriesYear,
      category,
      clearance,
      cabinet,
      shelf,
      folder,
      shelfLocation: `${cabinet} • ${shelf} • ${folder}`,
      ocrAccuracy: 98.8,
      fileSize: "3.4 MB",
      pageCount: 14,
      version: "v1.0",
      ingestedDate: new Date().toISOString().split("T")[0],
      status: "Indexed",
      tags: [
        { name: category, score: 0.96 },
        { name: "Official Issuance", score: 0.92 },
      ],
      summary: `Digitized and cataloged official directive: ${title}. Physical original archived in ${cabinet}, ${shelf}.`,
    };

    onIngestSuccess(newDoc);
    onClose();
    // Reset fields
    setTitle("");
    setOrderNo("");
    setFileName("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Ingest & Archive New Document
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Upload physical document scan, assign official metadata, and record storage cabinet coordinates.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 2 }}>
          <Stack spacing={2.5}>
            {/* File Upload Simulation Paper */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                border: "1px dashed",
                borderColor: "primary.main",
                bgcolor: "action.hover",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {fileName ? `Selected: ${fileName}` : "Select Document File (PDF, DOCX, TIFF)"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                Automated multi-page OCR and PGVector embedding will process upon submission.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                component="label"
                sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.tiff"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFileName(e.target.files[0].name);
                      if (!title) {
                        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                      }
                    }
                  }}
                />
              </Button>
            </Paper>

            {/* Title & Order No */}
            <TextField
              fullWidth
              size="small"
              label="Document Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Revised Guidelines on Real Property Valuation"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                size="small"
                label="Department Order / Circular No."
                required
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="e.g. BLGF-DO-2024-022"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />

              <TextField
                size="small"
                label="Series Year"
                value={seriesYear}
                onChange={(e) => setSeriesYear(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
            </Box>

            {/* Category & Clearance Level */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Assessment Regulations">Assessment Regulations</MenuItem>
                  <MenuItem value="Treasury Advisories">Treasury Advisories</MenuItem>
                  <MenuItem value="Legal Opinions">Legal Opinions</MenuItem>
                  <MenuItem value="Standard Procedures">Standard Procedures</MenuItem>
                  <MenuItem value="Memorandums">Memorandums</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Clearance Level</InputLabel>
                <Select
                  value={clearance}
                  label="Clearance Level"
                  onChange={(e) => setClearance(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Public">Public Access</MenuItem>
                  <MenuItem value="Internal">Internal Office Only</MenuItem>
                  <MenuItem value="Confidential">Confidential</MenuItem>
                  <MenuItem value="Restricted">Restricted Clearance</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Physical Storage Coordinates */}
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
              Physical Storage Cabinet Assignment
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Cabinet</InputLabel>
                <Select
                  value={cabinet}
                  label="Cabinet"
                  onChange={(e) => setCabinet(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Cabinet A">Cabinet A</MenuItem>
                  <MenuItem value="Cabinet B">Cabinet B</MenuItem>
                  <MenuItem value="Cabinet C">Cabinet C</MenuItem>
                  <MenuItem value="Cabinet D">Cabinet D</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Shelf</InputLabel>
                <Select
                  value={shelf}
                  label="Shelf"
                  onChange={(e) => setShelf(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Shelf 1">Shelf 1</MenuItem>
                  <MenuItem value="Shelf 2">Shelf 2</MenuItem>
                  <MenuItem value="Shelf 3">Shelf 3</MenuItem>
                  <MenuItem value="Shelf 4">Shelf 4</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Folder / Binder Ref"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            sx={{ borderRadius: 1, textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              px: 3,
            }}
          >
            Confirm & Ingest
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
