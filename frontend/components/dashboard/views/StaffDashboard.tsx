"use client";

    import React, { useState } from "react";
    import Box from "@mui/material/Box";
    import Grid from "@mui/material/Grid";
    import Paper from "@mui/material/Paper";
    import Typography from "@mui/material/Typography";
    import TextField from "@mui/material/TextField";
    import InputAdornment from "@mui/material/InputAdornment";
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
    import Link from "next/link";
    import { useRouter } from "next/navigation";

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

    export default function StaffDashboard() {
      const [searchQuery, setSearchQuery] = useState("");
      const router = useRouter();

      const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
          // Redirect to chat with the query pre-filled
          router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
        }
      };

      return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
          {/* 1. Hero Search & AI Query Bar */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage:
                "radial-gradient(ellipse at 100% 0%, rgba(15, 23, 42, 0.04) 0%, transparent 70%)",
            }}
          >
            <Stack spacing={2} sx={{ maxWidth: 800, mx: "auto", textAlign: "center" }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <AutoAwesomeOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 1.2 }}>
                  BLGF Semantic Search & Retrieval
                </Typography>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                Find Official Documents & Ask AI in Plain English
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Search across archived circulars, department orders, and legal rulings with verifiable page citations.
              </Typography>

              {/* Search Form */}
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. What is the latest assessment regulation for commercial land in Isabela?"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: "action.hover",
                              px: 1,
                              py: 0.3,
                              borderRadius: 1,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "text.secondary",
                              display: { xs: "none", sm: "block" },
                            }}
                          >
                            ⌘K
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2.5,
                        bgcolor: "background.default",
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ px: 3, borderRadius: 2.5, whiteSpace: "nowrap" }}
                  startIcon={<AutoAwesomeOutlinedIcon />}
                >
                  Ask AI
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* 2. Staff KPI Metric Cards (3 Cards) */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      TOTAL ARCHIVED
                    </Typography>
                    <FolderOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    1,248
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Official records digitized in Region II
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      AI INQUIRIES RESOLVED
                    </Typography>
                    <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    24
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Questions asked with verified citations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      RECENT UPLOADS
                    </Typography>
                    <DescriptionOutlinedIcon fontSize="small" sx={{ color: "info.main" }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    6
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    New circulars indexed this week
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

                  <Stack spacing={1.5}>
                    {RECENT_STAFF_DOCS.map((doc) => (
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
                              {doc.orderNo} ({doc.seriesYear})
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