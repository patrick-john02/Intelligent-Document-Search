"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api";


// Mock Recent Documents for Staff View
const RECENT_STAFF_DOCS = [
  {
    id: 1,
    title: "LGU Real Property Assessment Advisory Guidelines",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: "2024",
    category: "Assessment Regulations",
    shelfLocation: "Cabinet A • Shelf 2",
    date: "Aug 28, 2024",
    status: "Indexed",
  },
  {
    id: 2,
    title: "Treasury Circular on Local Revenue Collections",
    orderNo: "TC-2024-009",
    seriesYear: "2024",
    category: "Treasury Advisories",
    shelfLocation: "Cabinet B • Shelf 1",
    date: "Aug 24, 2024",
    status: "Indexed",
  },
  {
    id: 3,
    title: "Legal Opinion on Municipal Franchise Tax Exemption",
    orderNo: "LO-R2-2023-042",
    seriesYear: "2023",
    category: "Legal Opinions",
    shelfLocation: "Cabinet C • Shelf 4",
    date: "Aug 19, 2024",
    status: "Indexed",
  },
  {
    id: 4,
    title: "Regional Memorandum on Q3 Financial Audits",
    orderNo: "RM-2024-011",
    seriesYear: "2024",
    category: "Memorandums",
    shelfLocation: "Cabinet A • Shelf 3",
    date: "Aug 15, 2024",
    status: "Indexed",
  },
];

// Mock Live Citations from AI Assistant
const RECENT_AI_CITATIONS = [
  {
    id: 1,
    question: "What is the penalty rate for delinquent real property tax in Region II?",
    citedDoc: "BLGF-DO-2024-018 (Page 4, Section 2.1)",
    confidence: "98.4% Match",
    time: "10 mins ago",
  },
  {
    id: 2,
    question: "Which office approves municipal loan allocations for infrastructure?",
    citedDoc: "TC-2024-009 (Page 12, Annex B)",
    confidence: "95.1% Match",
    time: "1 hour ago",
  },
];

interface ArchivedDirective {
  id?: number;
  title?: string;
  department_order?: string;
  series_years?: string;
  physical_shelf_location?: string;
  category?: { name: string };
}

export default function StaffDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    archivedDocuments: 1248,
    aiInquiries: 24,
    recentUploads: 6,
    bookmarks: 12,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentDocs, setRecentDocs] = useState<ArchivedDirective[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(true);

  useEffect(() => {
    async function loadStaffData() {
      try {
        setIsLoading(true);
        setIsDocsLoading(true);

        const [analyticsRes, docsRes] = await Promise.allSettled([
          api.get<{
            archived_documents: number;
            ai_inquiries_resolved: number;
            recent_uploads: number;
          }>("/dashboard/analytics"),
          api.get<ArchivedDirective[]>("/dashboard/list_archived_dir"),
        ]);

        if (analyticsRes.status === "fulfilled" && analyticsRes.value) {
          setStats((prev) => ({
            ...prev,
            archivedDocuments: analyticsRes.value.archived_documents,
            aiInquiries: analyticsRes.value.ai_inquiries_resolved,
            recentUploads: analyticsRes.value.recent_uploads,
          }));
        }

        if (docsRes.status === "fulfilled" && Array.isArray(docsRes.value)) {
          setRecentDocs(docsRes.value);
        }
      } catch (err) {
        console.error("Failed to load staff dashboard data", err);
      } finally {
        setIsLoading(false);
        setIsDocsLoading(false);
      }
    }
    loadStaffData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to chat with the query pre-filled
      router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>

      <Box sx={{mb:1}}>
        <Typography variant="h5" sx={{fontWeight: 800}}>
          Welcome, {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || "Staff"}
        </Typography>

        {/* <Typography variant="body2" sx={{color: "text.secondary"}}>
          {user?.position || "Office Staff"} - {user?.division || "Records Unit"} ({user?.office || "General Office"})
        </Typography> */}
        

      </Box>

      {/* 2. Staff KPI Metric Cards (4 Cards) */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  ARCHIVED DOCUMENTS
                </Typography>
                <FolderOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={80} /> : stats.archivedDocuments.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Official records digitized in Region II
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  AI INQUIRIES RESOLVED
                </Typography>
                <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={50} /> : stats.aiInquiries.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Questions asked with verified citations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  RECENT UPLOADS
                </Typography>
                <DescriptionOutlinedIcon fontSize="small" sx={{ color: "info.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={40} /> : stats.recentUploads.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                New circulars indexed this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                  BOOKMARKED DIRECTIVES
                </Typography>
                <BookmarkBorderRoundedIcon fontSize="small" sx={{ color: "warning.main" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {isLoading ? <Skeleton width={40} /> : stats.bookmarks.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Pinned for quick reference
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Main Body: Recent Documents with Shelf Locations & Live Citations */}
      <Grid container spacing={3}>
        {/* Left (8 Cols): Recent Documents Table with Physical Shelf Locations */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Recent Archived Directives
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Quickly locate physical documents or download digital copies
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/documents"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  View All
                </Button>
              </Box>

              {isDocsLoading ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={18} />
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  {(recentDocs.length > 0
                    ? recentDocs.map((doc, idx) => ({
                        id: doc.id || idx,
                        title: doc.title || "Untitled Directive",
                        orderNo: doc.department_order || "Unspecified",
                        seriesYear: doc.series_years
                          ? String(new Date(doc.series_years).getFullYear())
                          : "—",
                        category: doc.category?.name || "General Archival",
                        shelfLocation: doc.physical_shelf_location || "Shelf Unassigned",
                      }))
                    : RECENT_STAFF_DOCS
                  ).map((doc) => (
                    <Paper
                      key={doc.id}
                      variant="outlined"
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 1.5,
                        "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {doc.title}
                          </Typography>
                          <Chip size="small" label={doc.category} variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {doc.orderNo} {doc.seriesYear !== "—" && `(${doc.seriesYear})`}
                          </Typography>
                          {/* Physical Shelf Location Tag */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main" }}>
                            <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {doc.shelfLocation}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Button component={Link} href="/documents" size="small" variant="outlined" sx={{ borderRadius: 1.5, textTransform: "none", fontSize: "0.78rem" }}>
                        Open PDF
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right (4 Cols): Live AI Citations & Quick Actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Live AI Citations Feed */}
            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Verified AI Citations
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {RECENT_AI_CITATIONS.map((cit) => (
                    <Box
                      key={cit.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                        "{cit.question}"
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                          📄 {cit.citedDoc}
                        </Typography>
                        <Chip label={cit.confidence} size="small" color="success" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Action Shortcuts */}
            <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "background.paper" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Action Shortcuts
                </Typography>
                <Stack spacing={1}>
                  <Button
                    component={Link}
                    href="/chat"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<AutoAwesomeOutlinedIcon />}
                    sx={{ justifyContent: "flex-start", borderRadius: 2, textTransform: "none", py: 1 }}
                  >
                    Open AI Research Assistant
                  </Button>
                  <Button
                    component={Link}
                    href="/documents"
                    variant="outlined"
                    fullWidth
                    startIcon={<FileUploadOutlinedIcon />}
                    sx={{ justifyContent: "flex-start", borderRadius: 2, textTransform: "none", py: 1 }}
                  >
                    Digitize & Upload Document
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}