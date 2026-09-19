"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";

// Layout & Components
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Locator Subcomponents
import { PhysicalDocumentItem, CabinetUnit } from "@/components/locator/types";
import CabinetRackView from "@/components/locator/CabinetRackView";
import ShelfContentsTable from "@/components/locator/ShelfContentsTable";

const CABINET_UNITS: CabinetUnit[] = [
  {
    id: "cab-a",
    name: "Cabinet A",
    room: "Records Room 102 • Bay 1",
    totalCapacity: 400,
    currentCount: 312,
    primaryCategory: "Assessment Regulations",
    shelvesCount: 4,
  },
  {
    id: "cab-b",
    name: "Cabinet B",
    room: "Records Room 102 • Bay 1",
    totalCapacity: 400,
    currentCount: 268,
    primaryCategory: "Treasury Advisories",
    shelvesCount: 4,
  },
  {
    id: "cab-c",
    name: "Cabinet C",
    room: "Records Room 102 • Bay 2",
    totalCapacity: 400,
    currentCount: 194,
    primaryCategory: "Legal Opinions",
    shelvesCount: 4,
  },
  {
    id: "cab-d",
    name: "Cabinet D",
    room: "Records Room 102 • Bay 2",
    totalCapacity: 400,
    currentCount: 345,
    primaryCategory: "Memorandums & Audits",
    shelvesCount: 4,
  },
];

const INITIAL_PHYSICAL_DOCS: PhysicalDocumentItem[] = [
  {
    id: "pdoc-1",
    title: "LGU Real Property Assessment Advisory Guidelines and Valuation Standards",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: 2024,
    category: "Assessment Regulations",
    cabinet: "Cabinet A",
    shelf: "Shelf 2",
    shelfLevel: 2,
    binder: "Binder 04",
    barcode: "R2-CAB-A-S2-B04",
    clearance: "Public",
    status: "On Shelf",
  },
  {
    id: "pdoc-2",
    title: "Real Property Assessment Appeals Board Manual of Procedure",
    orderNo: "BLGF-DO-2024-004",
    seriesYear: 2024,
    category: "Assessment Regulations",
    cabinet: "Cabinet A",
    shelf: "Shelf 2",
    shelfLevel: 2,
    binder: "Binder 04",
    barcode: "R2-CAB-A-S2-B05",
    clearance: "Public",
    status: "Checked Out",
    custodyOfficer: "Atty. M. Santos (Legal)",
  },
  {
    id: "pdoc-3",
    title: "Standard Operating Procedure for Physical Document Ingestion and OCR Scanning",
    orderNo: "SOP-DOC-2024-001",
    seriesYear: 2024,
    category: "Standard Procedures",
    cabinet: "Cabinet A",
    shelf: "Shelf 1",
    shelfLevel: 1,
    binder: "Binder 01",
    barcode: "R2-CAB-A-S1-B01",
    clearance: "Internal",
    status: "On Shelf",
  },
  {
    id: "pdoc-4",
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    cabinet: "Cabinet B",
    shelf: "Shelf 1",
    shelfLevel: 1,
    binder: "Binder 12",
    barcode: "R2-CAB-B-S1-B12",
    clearance: "Public",
    status: "On Shelf",
  },
  {
    id: "pdoc-5",
    title: "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities",
    orderNo: "LO-R2-2023-042",
    seriesYear: 2023,
    category: "Legal Opinions",
    cabinet: "Cabinet C",
    shelf: "Shelf 4",
    shelfLevel: 4,
    binder: "Binder 08",
    barcode: "R2-CAB-C-S4-B08",
    clearance: "Internal",
    status: "On Shelf",
  },
  {
    id: "pdoc-6",
    title: "Regional Memorandum on Q3 Financial Audits and Inter-Agency Ingestion",
    orderNo: "RM-2024-011",
    seriesYear: 2024,
    category: "Memorandums",
    cabinet: "Cabinet D",
    shelf: "Shelf 3",
    shelfLevel: 3,
    binder: "Binder 19",
    barcode: "R2-CAB-D-S3-B19",
    clearance: "Confidential",
    status: "Under Audit",
  },
];

export default function DocumentLocatorPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // States
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>("cab-a");
  const [selectedShelfLevel, setSelectedShelfLevel] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [docsList, setDocsList] = useState<PhysicalDocumentItem[]>(INITIAL_PHYSICAL_DOCS);
  const [searchResultNotice, setSearchResultNotice] = useState<string | null>(null);

  const activeCabinet = CABINET_UNITS.find((c) => c.id === selectedCabinetId) || CABINET_UNITS[0];

  // Mock Shelf Tier Stats for the selected cabinet
  const shelfStats = [
    { level: 4, name: "Shelf 4", filesCount: 78, capacity: 100, binderRange: "Binders 16 – 20" },
    { level: 3, name: "Shelf 3", filesCount: 64, capacity: 100, binderRange: "Binders 11 – 15" },
    { level: 2, name: "Shelf 2", filesCount: 96, capacity: 100, binderRange: "Binders 06 – 10" },
    { level: 1, name: "Shelf 1", filesCount: 74, capacity: 100, binderRange: "Binders 01 – 05" },
  ];

  // Filter documents matching active cabinet and active shelf level
  const activeShelfDocs = docsList.filter(
    (d) => d.cabinet === activeCabinet.name && d.shelfLevel === selectedShelfLevel
  );

  // Handle Quick Search or Barcode Scan
  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = docsList.find(
      (d) =>
        d.barcode.toLowerCase().includes(query) ||
        d.orderNo.toLowerCase().includes(query) ||
        d.title.toLowerCase().includes(query)
    );

    if (found) {
      const targetCab = CABINET_UNITS.find((c) => c.name === found.cabinet);
      if (targetCab) setSelectedCabinetId(targetCab.id);
      setSelectedShelfLevel(found.shelfLevel);
      setSearchResultNotice(`Located: ${found.orderNo} is in ${found.cabinet} • ${found.shelf} (${found.binder})`);
    } else {
      setSearchResultNotice(`No physical records found matching "${searchQuery}".`);
    }
  };

  const handleToggleCustody = (docId: string) => {
    setDocsList((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const nextStatus = doc.status === "On Shelf" ? "Checked Out" : "On Shelf";
          return {
            ...doc,
            status: nextStatus,
            custodyOfficer: nextStatus === "Checked Out" ? `${user?.username || "Staff Officer"} (Records)` : undefined,
          };
        }
        return doc;
      })
    );
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Locator Workspace */}
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
          {/* Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Title & System Breadcrumb */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Physical Document Locator
                </Typography>
                <Chip
                  label="Physical Archive Coordinates"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Locate hardcopy binders, inspect shelf elevation racks, and monitor physical custody.
              </Typography>
            </Box>

            {/* Quick Barcode / Directive Search */}
            <form onSubmit={handleBarcodeSearch} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Barcode ID or Directive No..."
                sx={{
                  width: { xs: "200px", sm: "280px" },
                  "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: "0.85rem" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  px: 2,
                  height: 36,
                }}
              >
                Locate
              </Button>
            </form>
          </Box>

          {/* Barcode Search Alert / Notice */}
          {searchResultNotice && (
            <Paper
              variant="outlined"
              sx={{
                mt: 1.5,
                p: 1.25,
                px: 2,
                borderRadius: 1,
                bgcolor: "action.selected",
                borderColor: "primary.main",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.85rem" }}>
                {searchResultNotice}
              </Typography>
              <Button
                size="small"
                onClick={() => setSearchResultNotice(null)}
                sx={{ fontSize: "0.72rem", textTransform: "none", p: 0, minWidth: "auto" }}
              >
                Dismiss
              </Button>
            </Paper>
          )}

          {/* Cabinet Selection Row (Horizontal Overview) */}
          <Box sx={{ my: 1.5, flexShrink: 0 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
              {CABINET_UNITS.map((cab) => {
                const isSelected = cab.id === selectedCabinetId;
                const percentFull = Math.round((cab.currentCount / cab.totalCapacity) * 100);

                return (
                  <Paper
                    key={cab.id}
                    component="button"
                    onClick={() => {
                      setSelectedCabinetId(cab.id);
                      setSearchResultNotice(null);
                    }}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      textAlign: "left",
                      borderRadius: 1,
                      bgcolor: isSelected ? "action.selected" : "background.paper",
                      borderColor: isSelected ? "primary.main" : "divider",
                      borderLeft: isSelected ? "4px solid" : "1px solid",
                      borderLeftColor: isSelected ? "primary.main" : "divider",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? "primary.main" : "text.primary" }}>
                        {cab.name}
                      </Typography>
                      <Chip
                        label={`${percentFull}%`}
                        size="small"
                        color={percentFull > 80 ? "warning" : "default"}
                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", mb: 1 }}>
                      {cab.room}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={percentFull}
                      sx={{
                        height: 5,
                        borderRadius: 1,
                        mb: 0.75,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"),
                      }}
                    />

                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 600 }}>
                      {cab.currentCount} / {cab.totalCapacity} Files Stored
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* Main Interactive Rack & Contents Workspace (Split-Pane) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Left Column: Visual Cabinet Tier Elevation (40% width) */}
            <Box sx={{ width: { xs: "100%", md: "380px", lg: "420px" }, flexShrink: 0, height: "100%", overflowY: "auto" }}>
              <CabinetRackView
                cabinetName={activeCabinet.name}
                selectedShelfLevel={selectedShelfLevel}
                onSelectShelfLevel={setSelectedShelfLevel}
                shelfStats={shelfStats}
              />
            </Box>

            {/* Right Column: Active Shelf Contents & Check-out Custody (60% width) */}
            <Box sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
              <ShelfContentsTable
                shelfName={`Shelf ${selectedShelfLevel}`}
                cabinetName={activeCabinet.name}
                items={activeShelfDocs}
                onToggleCustody={handleToggleCustody}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
