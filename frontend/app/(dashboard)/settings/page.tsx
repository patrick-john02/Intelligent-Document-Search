"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";

// MUI Icons
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

// Layout & Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

export default function OfficeSettingsPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Active Tab
  const [activeTab, setActiveTab] = useState<number>(0);

  // Snackbar Toast
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Tab 0: General Organization State
  const [orgName, setOrgName] = useState("Central Operations & Municipal Archive");
  const [departmentCode, setDepartmentCode] = useState("OPS-REC-2025");
  const [brandTitle, setBrandTitle] = useState("OmniArchive Intelligent Records");
  const [timezone, setTimezone] = useState("Asia/Manila (GMT+8)");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [fiscalYearStart, setFiscalYearStart] = useState("January");
  const [defaultClearance, setDefaultClearance] = useState("internal");

  // Tab 1: AI Engine & Ingestion (Alon & Mayumi)
  const [alonModel, setAlonModel] = useState("gemini-2.5-flash");
  const [autonomousExtraction, setAutonomousExtraction] = useState(true);
  const [duplicateThreshold, setDuplicateThreshold] = useState<number>(80);
  const [minOcrConfidence, setMinOcrConfidence] = useState<number>(75);
  const [strictGrounding, setStrictGrounding] = useState(true);
  const [autoEntityTagging, setAutoEntityTagging] = useState(true);
  const [mayumiTemperature, setMayumiTemperature] = useState<number>(0.2);

  // Tab 2: Storage & Archive Architecture
  const [cabinetFormat, setCabinetFormat] = useState("alphanumeric");
  const [maxUploadSizeMB, setMaxUploadSizeMB] = useState(100);
  const [vaultQuarantineDays, setVaultQuarantineDays] = useState(60);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(false);
  const [retentionPeriodYears, setRetentionPeriodYears] = useState("10");

  // Tab 3: Security & Clearance Policy
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(30);
  const [watermarkConfidentialDocs, setWatermarkConfidentialDocs] = useState(true);
  const [auditLogRetentionYears, setAuditLogRetentionYears] = useState("7");
  const [ipWhitelist, setIpWhitelist] = useState("10.0.0.0/16, 192.168.1.0/24");

  // Tab 4: Webhooks & Automated Integrations
  const [webhookUrl, setWebhookUrl] = useState("https://api.internal-agency.gov/v1/archive-events");
  const [notifyOnDuplicates, setNotifyOnDuplicates] = useState(true);
  const [notifyOnReviewProposal, setNotifyOnReviewProposal] = useState(true);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState("");
  const [nightlyBackupEnabled, setNightlyBackupEnabled] = useState(true);

  const handleSaveSettings = () => {
    setSnackbarMessage("Office configuration and AI ingestion policies saved successfully ✓");
  };

  const handleResetDefaults = () => {
    setDuplicateThreshold(80);
    setMinOcrConfidence(75);
    setStrictGrounding(true);
    setAutonomousExtraction(true);
    setSnackbarMessage("Settings restored to commercial system baseline values.");
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
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

          {/* Header Bar */}
          <Box
            sx={{
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              flexShrink: 0,
              borderBottom: "1px solid",
              borderColor: "divider",
              mb: 2,
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>
                  Office & Enterprise Settings
                </Typography>
                <Chip
                  icon={<TuneRoundedIcon sx={{ fontSize: "13px !important", color: "#06B6D4" }} />}
                  label="Target Office Admin"
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
                Global administration parameters for organizational identity, AI ingestion pipelines, retention lifecycles, and security clearance.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleResetDefaults}
                startIcon={<RestartAltRoundedIcon />}
                sx={{ borderRadius: 1.75, textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
              >
                Reset Baselines
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSaveSettings}
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  borderRadius: 1.75,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  px: 2.25,
                  boxShadow: "0 2px 8px rgba(6, 182, 212, 0.25)",
                }}
              >
                Save Settings
              </Button>
            </Stack>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0, mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 42,
                "& .MuiTab-root": {
                  minHeight: 42,
                  py: 1,
                  px: 2,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textTransform: "none",
                },
              }}
            >
              <Tab icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="General Organization" />
              <Tab icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: "#06B6D4" }} />} iconPosition="start" label="AI Ingestion & Models" />
              <Tab icon={<StorageOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Storage & Retention" />
              <Tab icon={<SecurityOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security & Clearance" />
              <Tab icon={<NotificationsOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Webhooks & Events" />
            </Tabs>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0, pr: 0.5, pb: 4 }}>
            {/* TAB 0: General Organization */}
            {activeTab === 0 && (
              <Stack spacing={2.5}>
                {/* Org Identity Paper */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Organization & Department Profile
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2.5 }}>
                    Identify your agency, municipal branch, corporate division, or professional firm.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: { sm: "center" }, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: alpha("#06B6D4", 0.12),
                        color: "primary.main",
                        fontWeight: 800,
                        fontSize: "1.5rem",
                        border: "2px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      {orgName.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUploadOutlinedIcon />}
                        sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 700, borderRadius: 1.5, mb: 0.5 }}
                      >
                        Upload Official Crest / Logo
                      </Button>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        PNG, SVG, or JPG (512x512 recommended). Appears on printable dossiers and review exports.
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Organization / Agency Name"
                      size="small"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                    <TextField
                      label="Department / Office Unit Code"
                      size="small"
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                    />
                    <TextField
                      label="System Brand Title"
                      size="small"
                      value={brandTitle}
                      onChange={(e) => setBrandTitle(e.target.value)}
                      helperText="Displayed across navigation bars and portal banners"
                    />
                    <TextField
                      select
                      label="Default Intake Clearance"
                      size="small"
                      value={defaultClearance}
                      onChange={(e) => setDefaultClearance(e.target.value)}
                      helperText="Assigned to uploads when not explicitly marked"
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="internal">Internal (Default)</MenuItem>
                      <MenuItem value="confidential">Confidential</MenuItem>
                      <MenuItem value="restricted">Restricted</MenuItem>
                    </TextField>
                  </Box>
                </Paper>

                {/* Regional & Calendar Localization */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Regional & Localization Parameters
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Coordinate timezones and calendar cycles for document series years and audit timestamps.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Operational Timezone"
                      size="small"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <MenuItem value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</MenuItem>
                      <MenuItem value="UTC (GMT+0)">UTC (GMT+0)</MenuItem>
                      <MenuItem value="America/New_York (EST)">America/New_York (EST)</MenuItem>
                      <MenuItem value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</MenuItem>
                      <MenuItem value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</MenuItem>
                      <MenuItem value="Europe/London (BST)">Europe/London (BST)</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Date Format"
                      size="small"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US Format)</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Standard)</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Fiscal / Series Cycle Start"
                      size="small"
                      value={fiscalYearStart}
                      onChange={(e) => setFiscalYearStart(e.target.value)}
                    >
                      <MenuItem value="January">January (Calendar Year)</MenuItem>
                      <MenuItem value="April">April (Q2 Cycle)</MenuItem>
                      <MenuItem value="July">July (Mid-Year Cycle)</MenuItem>
                      <MenuItem value="October">October (Federal Q1)</MenuItem>
                    </TextField>
                  </Box>
                </Paper>
              </Stack>
            )}

            {/* TAB 1: AI Ingestion & Models */}
            {activeTab === 1 && (
              <Stack spacing={2.5}>
                {/* Alon Archiving Agent Parameters */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
                    <Avatar src="/alon.png" alt="Alon" sx={{ width: 28, height: 28, border: "1px solid #06B6D4" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      Agent Alon: Archival OCR & Ingestion Pipeline
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2.5 }}>
                    Alon autonomously transcribes scans, extracts circular codes, detects duplicates, and drafts archive proposals.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mb: 2.5,
                    }}
                  >
                    <TextField
                      select
                      label="Primary Vision & OCR Agent Model"
                      size="small"
                      value={alonModel}
                      onChange={(e) => setAlonModel(e.target.value)}
                      helperText="Underlying LLM powering high-resolution document parsing"
                    >
                      <MenuItem value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended for Sub-second OCR)</MenuItem>
                      <MenuItem value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Document Reasoning)</MenuItem>
                      <MenuItem value="claude-3.5-sonnet">Claude 3.5 Sonnet (Advanced Formatting)</MenuItem>
                    </TextField>

                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.divider, 0.05) }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={autonomousExtraction}
                            onChange={(e) => setAutonomousExtraction(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Autonomous Code Extraction</Typography>}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Allows staff to drop scans without typing titles; Alon extracts them and queues proposals.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sliders for Confidence & Duplicates */}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, pt: 1 }}>
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Duplicate Detection Sensitivity Threshold
                        </Typography>
                        <Chip size="small" label={`${duplicateThreshold}%`} sx={{ height: 18, fontSize: "0.68rem", fontWeight: 800 }} />
                      </Stack>
                      <Slider
                        value={duplicateThreshold}
                        min={60}
                        max={95}
                        step={1}
                        onChange={(_, v) => setDuplicateThreshold(v as number)}
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                        Scans with semantic similarity above {duplicateThreshold}% are flagged as potential duplicates in Archive Review.
                      </Typography>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          OCR Confidence Floor for Auto-Approval
                        </Typography>
                        <Chip size="small" label={`${minOcrConfidence}%`} sx={{ height: 18, fontSize: "0.68rem", fontWeight: 800 }} />
                      </Stack>
                      <Slider
                        value={minOcrConfidence}
                        min={50}
                        max={95}
                        step={1}
                        onChange={(_, v) => setMinOcrConfidence(v as number)}
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                        Transcriptions below {minOcrConfidence}% confidence are forced into &quot;Needs Human Review&quot;.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Mayumi Query Assistant Parameters */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Agent Mayumi: Retrieval & Synthesis Policy
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Rules governing search responses, legal citations, and document grounding.
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Strict Factual Grounding (Anti-Hallucination)
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Mayumi will strictly decline answering unless verifiable in the indexed document repository.
                        </Typography>
                      </Box>
                      <Switch checked={strictGrounding} onChange={(e) => setStrictGrounding(e.target.checked)} />
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Automatic Entity & Tag Extraction
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Extract key people, offices, locations, and monetary amounts into vector index tags.
                        </Typography>
                      </Box>
                      <Switch checked={autoEntityTagging} onChange={(e) => setAutoEntityTagging(e.target.checked)} />
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            )}

            {/* TAB 2: Storage & Archive Architecture */}
            {activeTab === 2 && (
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Physical & Digital Repository Schema
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2.5 }}>
                    Set rules for shelf coordinate binding and upload volume restrictions.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Physical Coordinates Naming Convention"
                      size="small"
                      value={cabinetFormat}
                      onChange={(e) => setCabinetFormat(e.target.value)}
                    >
                      <MenuItem value="alphanumeric">Cabinet A • Shelf 1 • Folder 01 (Standard)</MenuItem>
                      <MenuItem value="room_aisle">Room 101 • Aisle 4 • Bay 2</MenuItem>
                      <MenuItem value="numeric_vault">Vault 01 • Rack 08 • Box 12</MenuItem>
                      <MenuItem value="custom">Custom Physical Notation</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Max File Ingestion Ceiling"
                      size="small"
                      value={maxUploadSizeMB}
                      onChange={(e) => setMaxUploadSizeMB(Number(e.target.value))}
                    >
                      <MenuItem value={50}>50 MB per file</MenuItem>
                      <MenuItem value={100}>100 MB per file (Default)</MenuItem>
                      <MenuItem value={250}>250 MB per file (High-Res Scans)</MenuItem>
                      <MenuItem value={500}>500 MB per file (Enterprise CAD/GIS)</MenuItem>
                    </TextField>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Retention Schedules & Quarantine Vault
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Manage compliance retention lifecycles and soft-deleted record holding periods.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mb: 2.5,
                    }}
                  >
                    <TextField
                      select
                      label="Statutory Archive Retention Period"
                      size="small"
                      value={retentionPeriodYears}
                      onChange={(e) => setRetentionPeriodYears(e.target.value)}
                      helperText="Default lifecycle before records trigger scheduled disposition reviews"
                    >
                      <MenuItem value="3">3 Years (Operational Vouchers)</MenuItem>
                      <MenuItem value="5">5 Years (Administrative Directives)</MenuItem>
                      <MenuItem value="10">10 Years (Statutory / Financial)</MenuItem>
                      <MenuItem value="permanent">Permanent / Indefinite (Ordinances & Charters)</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Deleted Vault Quarantine Period"
                      size="small"
                      value={vaultQuarantineDays}
                      onChange={(e) => setVaultQuarantineDays(Number(e.target.value))}
                      helperText="Soft-deleted records remain recoverable in the vault before purge"
                    >
                      <MenuItem value={30}>30 Days</MenuItem>
                      <MenuItem value={60}>60 Days (Default)</MenuItem>
                      <MenuItem value={90}>90 Days</MenuItem>
                      <MenuItem value={180}>180 Days (Strict Compliance)</MenuItem>
                    </TextField>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoPurgeEnabled}
                        onChange={(e) => setAutoPurgeEnabled(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                        Enable Automatic Daily Purge of Expired Quarantined Records
                      </Typography>
                    }
                  />
                </Paper>
              </Stack>
            )}

            {/* TAB 3: Security & Clearance Policy */}
            {activeTab === 3 && (
              <Stack spacing={2.5}>
                {/* Visual Security Clearance Ladder */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Security Clearance Tier Ladder
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Active clearance tiers enforced across search index queries and document downloads.
                  </Typography>

                  <Stack spacing={1.25}>
                    {[
                      { level: "Public", color: "#10B981", desc: "Open access to all staff, citizens, and portal queries." },
                      { level: "Internal", color: "#3B82F6", desc: "Default operational tier; visible to all authenticated office users." },
                      { level: "Confidential", color: "#F59E0B", desc: "Sensitive office memos, HR records, and executive deliberations." },
                      { level: "Restricted", color: "#EA580C", desc: "Restricted clearance; requires specific office division credential." },
                      { level: "Top Secret / Vault", color: "#DC2626", desc: "Highest clearance tier; accessible only to administrators & authorized signers." },
                    ].map((tier) => (
                      <Paper
                        key={tier.level}
                        elevation={0}
                        sx={{
                          p: 1.25,
                          px: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: alpha(tier.color, 0.3),
                          bgcolor: alpha(tier.color, 0.04),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tier.color }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.84rem" }}>
                            {tier.level}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
                          {tier.desc}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>

                {/* Authentication & Session Policy */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Authentication & Session Hardening
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2.5 }}>
                    Enforce zero-trust session policies and audit trail durability.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Inactivity Session Auto-Lock"
                      size="small"
                      value={sessionTimeoutMin}
                      onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                    >
                      <MenuItem value={15}>15 Minutes</MenuItem>
                      <MenuItem value={30}>30 Minutes (Recommended)</MenuItem>
                      <MenuItem value={60}>60 Minutes</MenuItem>
                      <MenuItem value={240}>4 Hours</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Audit Log Durability Retention"
                      size="small"
                      value={auditLogRetentionYears}
                      onChange={(e) => setAuditLogRetentionYears(e.target.value)}
                    >
                      <MenuItem value="1">1 Year</MenuItem>
                      <MenuItem value="3">3 Years</MenuItem>
                      <MenuItem value="7">7 Years (Legal Standard)</MenuItem>
                      <MenuItem value="indefinite">Indefinite (WORM Compliant)</MenuItem>
                    </TextField>
                  </Box>

                  <Stack spacing={1.5}>
                    <FormControlLabel
                      control={<Switch checked={enforce2FA} onChange={(e) => setEnforce2FA(e.target.checked)} />}
                      label={<Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Enforce Two-Factor Authentication (TOTP) for all Archivists & Admins</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch checked={watermarkConfidentialDocs} onChange={(e) => setWatermarkConfidentialDocs(e.target.checked)} />}
                      label={<Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Apply Dynamic User Watermarks to Confidential Document Downloads</Typography>}
                    />
                  </Stack>
                </Paper>
              </Stack>
            )}

            {/* TAB 4: Webhooks & Automated Integrations */}
            {activeTab === 4 && (
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Outgoing Event Webhooks (REST Integration)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Dispatch cryptographically signed JSON payloads to your ERP, DMS, or central governmental data lake.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Primary Webhook Endpoint URL"
                    size="small"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", display: "block", mb: 1, color: "text.secondary" }}>
                    Subscribed Archive Lifecycle Events
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch checked={notifyOnReviewProposal} onChange={(e) => setNotifyOnReviewProposal(e.target.checked)} />}
                      label={<Typography variant="body2" sx={{ fontSize: "0.82rem" }}>Emit on Proposal Ready for Review (<code>archive.proposal.created</code>)</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch checked={notifyOnDuplicates} onChange={(e) => setNotifyOnDuplicates(e.target.checked)} />}
                      label={<Typography variant="body2" sx={{ fontSize: "0.82rem" }}>Emit on Duplicate Record Conflict (<code>archive.duplicate.detected</code>)</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={<Typography variant="body2" sx={{ fontSize: "0.82rem" }}>Emit on Record Verification & Committal (<code>archive.document.indexed</code>)</Typography>}
                    />
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5 }}>
                    Automated Archive Snapshot & Cloud Backups
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                    Schedules automated nightly cold-storage snapshots of both vectors and source documents.
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Nightly Encrypted Archive Snapshot
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Runs at 02:00 AM server time. Generates full SHA-256 verified cold archive tarballs.
                      </Typography>
                    </Box>
                    <Switch checked={nightlyBackupEnabled} onChange={(e) => setNightlyBackupEnabled(e.target.checked)} />
                  </Box>
                </Paper>
              </Stack>
            )}
          </Box>

          {/* Feedback Snackbar */}
          <Snackbar
            open={Boolean(snackbarMessage)}
            autoHideDuration={4000}
            onClose={() => setSnackbarMessage(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbarMessage(null)}
              severity="success"
              variant="filled"
              sx={{ width: "100%", borderRadius: 1.5, fontSize: "0.82rem" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
}
