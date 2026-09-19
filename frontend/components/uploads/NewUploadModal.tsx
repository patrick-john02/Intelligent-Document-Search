"use client";

import React, { useState, useEffect } from "react";
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
import { StaffUploadItem } from "./types";

interface NewUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: (item: StaffUploadItem) => void;
  versionTargetDoc?: StaffUploadItem | null;
}

export default function NewUploadModal({
  open,
  onClose,
  onUploadSuccess,
  versionTargetDoc = null,
}: NewUploadModalProps) {
  const isVersioning = Boolean(versionTargetDoc);

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("3.4 MB");
  const [clearance, setClearance] = useState<"Public" | "Internal" | "Restricted" | "Confidential">("Public");
  const [cabinet, setCabinet] = useState("Cabinet A");
  const [shelf, setShelf] = useState("Shelf 2");
  const [binder, setBinder] = useState("Binder 05");
  const [versionNotes, setVersionNotes] = useState("");

  // Sync state if versioning an existing document
  useEffect(() => {
    if (versionTargetDoc) {
      setClearance(versionTargetDoc.clearance);
      setCabinet(versionTargetDoc.shelfLocation.cabinet);
      setShelf(versionTargetDoc.shelfLocation.shelf);
      setBinder(versionTargetDoc.shelfLocation.binder);
      setVersionNotes("Updated high-contrast scanned copy with official stamp");
    } else {
      setClearance("Public");
      setCabinet("Cabinet A");
      setShelf("Shelf 2");
      setBinder("Binder 05");
      setVersionNotes("");
    }
    setFileName("");
  }, [versionTargetDoc, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${mb === "0.0" ? "2.1" : mb} MB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const barcode = `R2-${cabinet.replace(" ", "").toUpperCase()}-${shelf.replace(" ", "").toUpperCase()}-${binder.replace(" ", "").toUpperCase()}`;
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    if (isVersioning && versionTargetDoc) {
      // Calculate next version
      const currentVerNumber = parseFloat(versionTargetDoc.version.replace("v", "")) || 1.0;
      const nextVer = `v${(currentVerNumber + 0.1).toFixed(1)}`;

      const updatedDoc: StaffUploadItem = {
        ...versionTargetDoc,
        fileName,
        fileSize,
        version: nextVer,
        uploadedAt: timestamp,
        status: "Processing",
        versionHistory: [
          {
            version: nextVer,
            date: timestamp,
            fileName,
            uploadedBy: "Staff Officer",
            notes: versionNotes || "Revised version upload",
          },
          ...(versionTargetDoc.versionHistory || []),
        ],
        shelfLocation: {
          cabinet,
          shelf,
          binder,
          barcode,
          tagged: true,
        },
      };

      onUploadSuccess(updatedDoc);
    } else {
      // New Document Upload
      const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      let autoCategory = "Assessment Regulations";
      let autoTitle = "Local Government Directive on Municipal Revenue Assessment & Guidelines";
      let autoOrderNo = `BLGF-DO-2024-${Math.floor(100 + Math.random() * 900)}`;

      const lowerName = fileName.toLowerCase();
      if (lowerName.includes("treasury") || lowerName.includes("tax") || lowerName.includes("revenue")) {
        autoCategory = "Treasury Advisories";
        autoTitle = "Treasury Circular on Local Revenue Collections and Automation Protocols";
        autoOrderNo = `TC-2024-0${Math.floor(10 + Math.random() * 89)}`;
      } else if (lowerName.includes("legal") || lowerName.includes("opinion") || lowerName.includes("ruling")) {
        autoCategory = "Legal Opinions";
        autoTitle = "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities";
        autoOrderNo = `LO-R2-2024-${Math.floor(10 + Math.random() * 89)}`;
      } else if (lowerName.includes("memo") || lowerName.includes("audit")) {
        autoCategory = "Memorandums & Audits";
        autoTitle = "Regional Memorandum on Q3 Financial Audits and Inter-Agency Ingestion";
        autoOrderNo = `RM-2024-0${Math.floor(10 + Math.random() * 89)}`;
      } else if (lowerName.includes("sop") || lowerName.includes("procedure") || lowerName.includes("manual")) {
        autoCategory = "Standard Procedures";
        autoTitle = "Standard Operating Procedure for Physical Document Ingestion and OCR Scanning";
        autoOrderNo = `SOP-DOC-2024-00${Math.floor(1 + Math.random() * 9)}`;
      } else if (cleanName.length > 5) {
        autoTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }

      const newItem: StaffUploadItem = {
        id: `up-${Date.now()}`,
        title: autoTitle,
        orderNo: autoOrderNo,
        seriesYear: 2024,
        category: autoCategory,
        clearance,
        fileName,
        fileSize,
        pageCount: 16,
        uploadedAt: timestamp,
        status: "Processing",
        version: "v1.0",
        versionHistory: [
          {
            version: "v1.0",
            date: timestamp,
            fileName,
            uploadedBy: "Staff Officer",
            notes: "Initial upload",
          },
        ],
        shelfLocation: {
          cabinet,
          shelf,
          binder,
          barcode,
          tagged: true,
        },
        stages: {
          upload: { status: "completed", timestamp, detail: "File received and verified." },
          textExtraction: { status: "processing", detail: "Reading document content..." },
          indexing: { status: "pending", detail: "Queued for catalog indexing." },
          physicalTag: { status: "completed", detail: `Assigned shelf location ${barcode}.` },
          status: { status: "pending", detail: "Awaiting final clearance." },
        },
        extractedSummary: `Official issuance regarding ${autoCategory.toLowerCase()}. Document filed in ${cabinet}, ${shelf}.`,
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
      maxWidth="sm"
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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isVersioning
            ? `Upload New Version: ${versionTargetDoc?.orderNo}`
            : "Upload Document"}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {isVersioning
            ? "Upload an updated scan or revision. The document will advance to the next version."
            : "Upload a document file, set clearance, and select its physical storage coordinates."}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 2 }}>
          <Stack spacing={2.5}>
            {/* File Upload Drop Area */}
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}
              >
                Document File
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 1,
                  borderStyle: "dashed",
                  borderColor: fileName ? "primary.main" : "divider",
                  bgcolor: fileName ? "action.selected" : "action.hover",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
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
                  {fileName ? fileName : "Click or drag document file here"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Supported formats: PDF, TIFF, JPG, PNG, DOCX
                </Typography>
              </Paper>
            </Box>

            {/* Versioning Notes if applicable */}
            {isVersioning && (
              <TextField
                label="Version Revision Notes"
                size="small"
                fullWidth
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g. Scanned official stamp copy, updated appendix..."
                slotProps={{ input: { sx: { borderRadius: 1 } } }}
              />
            )}

            <Divider />

            {/* Clearance Level */}
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}
              >
                Clearance Level
              </Typography>
              <FormControl size="small" fullWidth>
                <InputLabel id="upload-clearance-label">Clearance</InputLabel>
                <Select
                  labelId="upload-clearance-label"
                  value={clearance}
                  label="Clearance"
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

            <Divider />

            {/* Physical Storage Coordinates */}
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}
              >
                Physical Storage Coordinates
              </Typography>
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
                  label="Binder / Folder"
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
            disabled={!fileName.trim()}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              px: 3,
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
