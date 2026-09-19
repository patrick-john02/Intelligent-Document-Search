"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "next/link";
import PageViewsBarChart from "@/components/PageViewsBarChart";
import ChartUserByCountry from "@/components/ChartUserByCountry";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";


// Office Document Records for Head of Office Overview
const OFFICE_DOCUMENTS = [
  {
    id: 1,
    title: "Annual Operational Plan and Strategic Budget Allocation",
    docNo: "AOP-2024-018",
    category: "Administrative Orders",
    clearance: "Internal",
    status: "Approved",
    uploadedBy: "Planning & Finance",
    date: "Sep 14, 2024",
  },
  {
    id: 2,
    title: "Quarterly Performance Audit & Department Evaluation",
    docNo: "QAR-2024-003",
    category: "Reports & Audits",
    clearance: "Confidential",
    status: "Approved",
    uploadedBy: "Quality Assurance",
    date: "Sep 10, 2024",
  },
  {
    id: 3,
    title: "Office Memorandum on Information Management & Data Security",
    docNo: "OM-2024-042",
    category: "Memorandums",
    clearance: "Public",
    status: "Approved",
    uploadedBy: "IT & Systems Admin",
    date: "Sep 05, 2024",
  },
  {
    id: 4,
    title: "Standard Operating Procedure for Archival and Document Ingestion",
    docNo: "SOP-DOC-2024",
    category: "Circulars & Advisories",
    clearance: "Restricted",
    status: "Pending Review",
    uploadedBy: "Records Unit",
    date: "Aug 29, 2024",
  },
  {
    id: 5,
    title: "Inter-Agency Project Milestones and Executive Directives",
    docNo: "PRJ-2024-009",
    category: "Administrative Orders",
    clearance: "Internal",
    status: "Under Review",
    uploadedBy: "Operations Division",
    date: "Aug 22, 2024",
  },
];

const getClearanceChipColor = (clearance: string) => {
  switch (clearance) {
    case "Restricted":
      return "error";
    case "Confidential":
      return "warning";
    case "Internal":
      return "info";
    default:
      return "default";
  }
};

const getStatusChipColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "success";
    case "Pending Review":
      return "warning";
    case "Under Review":
      return "info";
    default:
      return "default";
  }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDigitalized: 1248,
    activePersonnel: 38,
    monthlyAiQueries: 3890,
    mlAccuracy: "96.8%",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        const data = await api.get<{
          total_digitalized: number;
          active_personnel: number;
          monthly_ai_queries: number;
        }>("/admin/dashboard");

        if (data) {
          setStats((prev) => ({
            ...prev,
            totalDigitalized: data.total_digitalized ?? prev.totalDigitalized,
            activePersonnel: data.active_personnel ?? prev.activePersonnel,
            monthlyAiQueries: data.monthly_ai_queries ?? prev.monthlyAiQueries,
          }));
        }
      } catch (err) {
        console.error("Failed to load admin dashboard analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Executive Office KPI Metric Cards */}
      <Grid container spacing={2}>
        {/* Card 1: Total Archived Documents */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  TOTAL ARCHIVED
                </Typography>
                <FolderSharedOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={80} /> : stats.totalDigitalized.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                +14.2% this quarter
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Digitized & Indexed in AI Archive
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Office Personnel */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  ACTIVE PERSONNEL
                </Typography>
                <PeopleAltOutlinedIcon fontSize="small" sx={{ color: "info.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={50} /> : stats.activePersonnel.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "info.main", fontWeight: 700 }}>
                Across Office Units
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Active researchers & staff
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Monthly AI Queries */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  MONTHLY AI QUERIES
                </Typography>
                <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "warning.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={60} /> : stats.monthlyAiQueries.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                +28.4% staff utilization
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Semantic searches & citations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: ML Classification Accuracy */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  ML ACCURACY RATE
                </Typography>
                <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ color: "success.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={60} /> : stats.mlAccuracy}
              </Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                High confidence score
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Automated classification & tagging
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. System Charts: Ingestion & Retrieval Volume + ML Category Distribution */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <PageViewsBarChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartUserByCountry />
        </Grid>
      </Grid>

      {/* 3. ML Thematic Trend Insight Alert */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          bgcolor: "action.hover",
          borderLeft: "4px solid",
          borderLeftColor: "primary.main",
        }}
      >
        <CardContent sx={{ p: 2.5, display: "flex", alignItems: "flex-start", gap: 2 }}>
          <InsightsOutlinedIcon sx={{ color: "primary.main", mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                AI Semantic Retrieval Insight
              </Typography>
              <Chip
                size="small"
                label="High Inquiry Trend"
                color="primary"
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              A <strong>42% surge in staff inquiries</strong> regarding <em>Quarterly Audit & Operational Guidelines</em> was detected by the retrieval system this month. Recommended action: publish an updated circular or verify that recent directives are fully indexed.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Document Ingestion & Clearance Approval Repository */}
      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Document Ingestion & Clearance Repository
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Review incoming office documents, classifications, and access permissions
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/admin/approvals"
              size="small"
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
            >
              Approval Queue
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Document Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reference No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ML Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Clearance Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Uploaded By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {OFFICE_DOCUMENTS.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600, maxWidth: 320 }}>
                      {row.title}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {row.docNo}
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.clearance}
                        color={getClearanceChipColor(row.clearance)}
                        sx={{ fontSize: "0.7rem", height: 20, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={row.status}
                        color={getStatusChipColor(row.status)}
                        sx={{ fontSize: "0.7rem", height: 20, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                      {row.uploadedBy}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {row.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
