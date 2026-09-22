"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { useAuth } from "@/context/AuthContext";
import { StaffUploadItem } from "./types";

interface NewUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: (item: StaffUploadItem) => void;
  versionTargetDoc?: StaffUploadItem | null;
  existingUploads?: StaffUploadItem[];
}

const CATEGORY_OPTIONS = [
  "Assessment Regulations",
  "Treasury Advisories",
  "Legal Opinions",
  "Memorandums & Audits",
  "Standard Procedures",
];

export default function NewUploadModal({
  open,
  onClose,
  onUploadSuccess,
  versionTargetDoc = null,
  existingUploads = [],
}: NewUploadModalProps) {
  const { user } = useAuth();
  const isVersioning = Boolean(versionTargetDoc);

  // Form Fields
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("3.4 MB");
  const [title, setTitle] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [seriesYear, setSeriesYear] = useState("2024");
  const [category, setCategory] = useState("Assessment Regulations");
  const [clearance, setClearance] = useState<"Public" | "Internal" | "Restricted" | "Confidential">("Public");
  const [summary, setSummary] = useState("");
  const [cabinet, setCabinet] = useState("Cabinet A");
  const [shelf, setShelf] = useState("Shelf 2");
  const [binder, setBinder] = useState("Binder 05");
  const [versionNotes, setVersionNotes] = useState("");

  // Sync state if versioning an existing document or resetting
  useEffect(() => {
    if (versionTargetDoc) {
      setTitle(versionTargetDoc.title);
      setOrderNo(versionTargetDoc.orderNo);
      setSeriesYear(String(versionTargetDoc.seriesYear || "2024"));
      setCategory(versionTargetDoc.category);
      setClearance(versionTargetDoc.clearance);
      setCabinet(versionTargetDoc.shelfLocation.cabinet);
      setShelf(versionTargetDoc.shelfLocation.shelf);
      setBinder(versionTargetDoc.shelfLocation.binder);
      setSummary(versionTargetDoc.extractedSummary || "");
      setVersionNotes("Updated scanned copy with official dry seal and signatures");
    } else {
      setTitle("");
      setOrderNo("");
      setSeriesYear("2024");
      setCategory("Assessment Regulations");
      setClearance("Public");
      setCabinet("Cabinet A");
      setShelf("Shelf 2");
      setBinder("Binder 05");
      setSummary("");
      setVersionNotes("");
    }
    setFileName("");
  }, [versionTargetDoc, open]);

  // Handle file selection and auto-generate readable title
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${mb === "0.0" ? "2.1" : mb} MB`);

      if (!isVersioning && !title) {
        const clean = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ")
          .trim();
        if (clean.length > 3) {
          setTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
        }
      }
    }
  };

  // Live Barcode Tag calculation
  const computedBarcode = `R2-${cabinet.replace(" ", "").toUpperCase()}-${shelf.replace(" ", "").toUpperCase()}-${binder.replace(" ", "").toUpperCase()}`;

  // Duplicate Check against existing uploads
  const duplicateConflict = useMemo(() => {
    if (isVersioning || !existingUploads || existingUploads.length === 0) return null;
    const cleanOrder = orderNo.trim().toLowerCase();
    if (cleanOrder) {
      const match = existingUploads.find((d) => d.orderNo.toLowerCase() === cleanOrder);
      if (match) return match;
    }
    return null;
  }, [orderNo, existingUploads, isVersioning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const uploaderName = user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Maria Santos"
      : "Maria Santos";
    const uploaderDivision = user?.division || "Administrative Records";

    if (isVersioning && versionTargetDoc) {
      // Advance version number (e.g., v1.0 -> v1.1)
      const currentVerNumber = parseFloat(versionTargetDoc.version.replace("v", "")) || 1.0;
      const nextVer = `v${(currentVerNumber + 0.1).toFixed(1)}`;

      const updatedDoc: StaffUploadItem = {
        ...versionTargetDoc,
        fileName,
        fileSize,
        version: nextVer,
        uploadedAt: timestamp,
        status: "Processing",
        uploadedBy: {
          name: uploaderName,
          division: uploaderDivision,
          position: user?.office || "Senior Records Officer",
        },
        versionHistory: [
          {
            version: nextVer,
            date: timestamp,
            fileName,
            uploadedBy: uploaderName,
            notes: versionNotes || "Revised version upload",
          },
          ...(versionTargetDoc.versionHistory || []),
        ],
        shelfLocation: {
          cabinet,
          shelf,
          binder,
          barcode: computedBarcode,
          tagged: true,
        },
        stages: {
          upload: { status: "completed", timestamp, detail: "Revision received & verified." },
          textExtraction: { status: "processing", detail: "Extracting updated text..." },
          indexing: { status: "pending", detail: "Queued for vector re-indexing." },
          physicalTag: { status: "completed", detail: `Cabinet ${cabinet} • ${shelf} (${binder})` },
          status: { status: "pending", detail: "Pending review." },
        },
      };

      onUploadSuccess(updatedDoc);
    } else {
      // New Document Upload
      const finalTitle = title.trim() || "Regional Policy Directive on Administrative Operational Standards";
      const finalOrderNo = orderNo.trim() || `BLGF-DO-2024-${Math.floor(100 + Math.random() * 900)}`;

      const newItem: StaffUploadItem = {
        id: `up-${Date.now()}`,
        title: finalTitle,
        orderNo: finalOrderNo,
        seriesYear: parseInt(seriesYear) || 2024,
        category,
        clearance,
        fileName,
        fileSize,
        pageCount: 16,
        uploadedAt: timestamp,
        status: "Processing",
        version: "v1.0",
        uploadedBy: {
          name: uploaderName,
          division: uploaderDivision,
          position: user?.office || "Senior Records Officer",
        },
        versionHistory: [
          {
            version: "v1.0",
            date: timestamp,
            fileName,
            uploadedBy: uploaderName,
            notes: versionNotes || "Initial document upload",
          },
        ],
        shelfLocation: {
          cabinet,
          shelf,
          binder,
          barcode: computedBarcode,
          tagged: true,
        },
        stages: {
          upload: { status: "completed", timestamp, detail: "File received and verified." },
          textExtraction: { status: "processing", detail: "Reading document content..." },
          indexing: { status: "pending", detail: "Queued for catalog indexing." },
          physicalTag: { status: "completed", detail: `Assigned shelf location ${computedBarcode}.` },
          status: { status: "pending", detail: "Awaiting final clearance." },
        },
        extractedSummary:
          summary.trim() ||
          `Official regional directive regarding ${category.toLowerCase()}. Filed under ${finalOrderNo} in ${cabinet}, ${shelf}.`,
      };

      onUploadSuccess(newItem);
    }

    onClose();
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {isVersioning ? `Upload New Revision Version` : "Upload & Digitize Document"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isVersioning
                ? `Upload an updated scan or amended copy for ${versionTargetDoc?.orderNo}. It will advance to the next version.`
                : "Submit a raw scanned directive to initiate multi-stage text extraction, barcode tagging, and catalog indexing."}
            </Typography>
          </Box>

          {isVersioning && (
            <Chip
              label={`Target: ${versionTargetDoc?.version} ➔ Next Version`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, borderRadius: 1 }}
            />
          )}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 2 }}>
          <Stack spacing={2.5}>
            {/* File Upload Drop Area */}
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 0.75 }}
              >
                Document Scan File
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 1,
                  borderStyle: "dashed",
                  borderWidth: 1.5,
                  borderColor: fileName ? "primary.main" : "divider",
                  bgcolor: fileName ? "action.selected" : "action.hover",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.tiff,.jpg,.png"
                  onChange={handleFileChange}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  {fileName ? `Selected: ${fileName} (${fileSize})` : "Click or drag document scan file here"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Supported formats: PDF, TIFF, JPG, PNG, DOCX (Max 25 MB)
                </Typography>
              </Paper>
            </Box>

            {/* Version Revision Notes (if versioning) */}
            {isVersioning && (
              <TextField
                label="Version Revision Notes"
                size="small"
                fullWidth
                required
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g. Scanned official stamp copy, updated appendix with dry seal..."
                slotProps={{ input: { sx: { borderRadius: 1 } } }}
              />
            )}

            {/* Duplicate Conflict Warning */}
            {duplicateConflict && (
              <Alert severity="warning" sx={{ borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                  Duplicate Order Number Detected
                </Typography>
                A directive with Order No <strong>{duplicateConflict.orderNo}</strong> is already filed in{" "}
                <strong>{duplicateConflict.shelfLocation.cabinet} • {duplicateConflict.shelfLocation.shelf}</strong>. If you are uploading an update, consider using &quot;Upload New Version&quot; instead.
              </Alert>
            )}

            <Divider />

            {/* Document Title */}
            <TextField
              label="Document Title"
              size="small"
              fullWidth
              required
              disabled={isVersioning}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Revised Guidelines on Real Property Assessment and Valuation Standards"
              slotProps={{ input: { sx: { borderRadius: 1 } } }}
            />

            {/* Order No & Series Year Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
              <TextField
                label="Department Order / Circular No."
                size="small"
                required
                disabled={isVersioning}
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="e.g. BLGF-DO-2024-025"
                slotProps={{ input: { sx: { borderRadius: 1 } } }}
              />

              <TextField
                label="Series Year"
                size="small"
                disabled={isVersioning}
                value={seriesYear}
                onChange={(e) => setSeriesYear(e.target.value)}
                placeholder="e.g. 2024"
                slotProps={{ input: { sx: { borderRadius: 1 } } }}
              />
            </Box>

            {/* Category & Clearance Level Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl size="small" fullWidth disabled={isVersioning}>
                <InputLabel id="upload-category-label">Category Division</InputLabel>
                <Select
                  labelId="upload-category-label"
                  value={category}
                  label="Category Division"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="upload-clearance-label">Clearance Level</InputLabel>
                <Select
                  labelId="upload-clearance-label"
                  value={clearance}
                  label="Clearance Level"
                  onChange={(e) => setClearance(e.target.value as any)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="Public">Public (Staff & Public Access)</MenuItem>
                  <MenuItem value="Internal">Internal (Office Use Only)</MenuItem>
                  <MenuItem value="Restricted">Restricted (Division Heads)</MenuItem>
                  <MenuItem value="Confidential">Confidential (Executive Only)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Document Summary / Administrative Scope */}
            {!isVersioning && (
              <TextField
                label="Executive Summary / Scope of Directive"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of statutory rules or instructions for regional assessment and treasury personnel..."
                slotProps={{ input: { sx: { borderRadius: 1 } } }}
              />
            )}

            <Divider />

            {/* Physical Storage Coordinates with Barcode Tag */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}
                >
                  Physical Storage Assignment & Barcode Tag
                </Typography>
                <Chip
                  label={`Generated Tag: ${computedBarcode}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, fontFamily: "monospace" }}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="upload-cabinet-label">Cabinet</InputLabel>
                  <Select
                    labelId="upload-cabinet-label"
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

                <FormControl size="small" fullWidth>
                  <InputLabel id="upload-shelf-label">Shelf</InputLabel>
                  <Select
                    labelId="upload-shelf-label"
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
                  label="Binder / Folder Ref"
                  size="small"
                  value={binder}
                  onChange={(e) => setBinder(e.target.value)}
                  placeholder="e.g. Binder 05"
                  slotProps={{ input: { sx: { borderRadius: 1 } } }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={!fileName.trim() || (!isVersioning && !title.trim())}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              px: 3,
            }}
          >
            {isVersioning ? "Upload New Version" : "Confirm & Start Ingestion"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
