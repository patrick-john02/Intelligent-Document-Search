"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Link from "next/link";
import PageViewsBarChart from "@/components/PageViewsBarChart";
import ChartUserByCountry from "@/components/ChartUserByCountry";
import CustomizedDataGrid from "@/components/CustomizedDataGrid";

export default function AdminDashboard() {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Admin Executive KPI Metric Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  TOTAL DIGITIZED
                </Typography>
                <FolderSharedOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>1,248</Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                +14.2% this quarter
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  ACTIVE PERSONNEL
                </Typography>
                <PeopleAltOutlinedIcon fontSize="small" sx={{ color: "info.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>38</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Across 4 Regional Divisions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  MONTHLY AI QUERIES
                </Typography>
                <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "warning.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>3,890</Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                +28.4% user adoption
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  CLEARANCE AUDIT
                </Typography>
                <SecurityOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>100%</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Zero unauthorized breaches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Visualizations: Ingestion Volume & Category Distribution */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <PageViewsBarChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartUserByCountry />
        </Grid>
      </Grid>

      {/* 3. ML Thematic Insights Alert */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "action.hover", borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
        <CardContent sx={{ p: 2.5, display: "flex", alignItems: "flex-start", gap: 2 }}>
          <InsightsOutlinedIcon sx={{ color: "warning.main", mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Regional ML Thematic Insight
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              A 42% surge in inquiries regarding <strong>Real Property Tax Exemptions (RPAED)</strong> was detected this month. Consider publishing an updated FAQ circular for Local Government Units.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Master Documents & Clearance Control Table */}
      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Document Clearance & Ingestion Repository
            </Typography>
            <Button component={Link} href="/admin/users" size="small" variant="outlined" sx={{ borderRadius: 1.5, textTransform: "none" }}>
              Manage Users
            </Button>
          </Box>
          <CustomizedDataGrid />
        </CardContent>
      </Card>
    </Box>
  );
}
