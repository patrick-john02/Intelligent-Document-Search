"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";

// Layout & Dashboard Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Bookmarks Subcomponents
import { BookmarkItem, BookmarkMetrics } from "@/components/bookmarks/types";
import { SEED_BOOKMARKS, INITIAL_COLLECTIONS } from "@/components/bookmarks/seedData";
import BookmarkMetricsSummary from "@/components/bookmarks/BookmarkMetricsSummary";
import BookmarkFilterBar from "@/components/bookmarks/BookmarkFilterBar";
import BookmarkCard from "@/components/bookmarks/BookmarkCard";
import BookmarkListView from "@/components/bookmarks/BookmarkListView";
import BookmarkDetailsDrawer from "@/components/bookmarks/BookmarkDetailsDrawer";
import EditNoteModal from "@/components/bookmarks/EditNoteModal";
import NewCollectionModal from "@/components/bookmarks/NewCollectionModal";
import ExportBookmarksDialog from "@/components/bookmarks/ExportBookmarksDialog";

export default function BookmarksPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(SEED_BOOKMARKS);
  const [collections, setCollections] = useState<string[]>(INITIAL_COLLECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [onlyPhysical, setOnlyPhysical] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "year" | "order" | "title">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Modals
  const [activeItem, setActiveItem] = useState<BookmarkItem | null>(null);
  const [editingItem, setEditingItem] = useState<BookmarkItem | null>(null);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Computed Metrics
  const metrics: BookmarkMetrics = useMemo(() => {
    return {
      totalSaved: bookmarks.length,
      collectionsCount: collections.filter((c) => c !== "All").length,
      pinnedCount: bookmarks.filter((b) => b.isPinned).length,
      physicalOnShelfCount: bookmarks.filter((b) => !!b.shelfLocation?.barcode).length,
      withNotesCount: bookmarks.filter((b) => !!b.personalNotes?.trim()).length,
    };
  }, [bookmarks, collections]);

  // Filter & Sort Pipeline
  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((item) => {
        // Collection filter
        if (selectedCollection !== "All" && item.collection !== selectedCollection) {
          return false;
        }

        // Pinned filter
        if (onlyPinned && !item.isPinned) {
          return false;
        }

        // Physical records filter
        if (onlyPhysical && !item.shelfLocation?.barcode) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchOrder = item.orderNo.toLowerCase().includes(q);
          const matchNotes = item.personalNotes?.toLowerCase().includes(q) || false;
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          const matchShelf = `${item.shelfLocation.cabinet} ${item.shelfLocation.shelf} ${item.shelfLocation.binder}`
            .toLowerCase()
            .includes(q);

          if (!matchTitle && !matchOrder && !matchNotes && !matchTags && !matchShelf) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned always come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === "date") {
          return b.dateBookmarked.localeCompare(a.dateBookmarked);
        }
        if (sortBy === "year") {
          return Number(b.seriesYear) - Number(a.seriesYear);
        }
        if (sortBy === "order") {
          return a.orderNo.localeCompare(b.orderNo);
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [bookmarks, selectedCollection, onlyPinned, onlyPhysical, searchQuery, sortBy]);

  // Handlers
  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextPinned = !b.isPinned;
          setSnackbarMessage(
            nextPinned
              ? `Pinned "${b.orderNo}" for quick reference.`
              : `Unpinned "${b.orderNo}".`
          );
          return { ...b, isPinned: nextPinned };
        }
        return b;
      })
    );

    if (activeItem && activeItem.id === id) {
      setActiveItem((prev) => (prev ? { ...prev, isPinned: !prev.isPinned } : null));
    }
  };

  const handleEditNote = (item: BookmarkItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
  };

  const handleSaveNote = (id: string, notes: string, collection: string) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, personalNotes: notes, collection };
        }
        return b;
      })
    );

    if (activeItem && activeItem.id === id) {
      setActiveItem((prev) => (prev ? { ...prev, personalNotes: notes, collection } : null));
    }

    setSnackbarMessage("Personal notes and collection updated successfully.");
  };

  const handleSaveInlineNote = (id: string, note: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, personalNotes: note } : b))
    );
    if (activeItem && activeItem.id === id) {
      setActiveItem((prev) => (prev ? { ...prev, personalNotes: note } : null));
    }
    setSnackbarMessage("Personal notes updated.");
  };

  const handleRemoveBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = bookmarks.find((b) => b.id === id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (activeItem && activeItem.id === id) {
      setActiveItem(null);
    }
    setSnackbarMessage(`Removed "${target?.orderNo || "directive"}" from bookmarks.`);
  };

  const handleCreateCollection = (name: string) => {
    if (!collections.includes(name)) {
      setCollections((prev) => [...prev, name]);
      setSelectedCollection(name);
      setSnackbarMessage(`Created collection "${name}".`);
    }
  };

  const handleConfirmExport = (format: string, includeNotes: boolean) => {
    if (format === "gdocs") {
      setSnackbarMessage(
        "Exported bookmarks to Google Docs: 'My Drive / Intelligent Document Search / Bookmarks / Research Digest.gdoc'"
      );
    } else if (format === "pdf") {
      setSnackbarMessage("Generated research summary PDF ready for print.");
    } else {
      setSnackbarMessage("Spreadsheet data exported successfully.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCollection("All");
    setOnlyPinned(false);
    setOnlyPhysical(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Persistent Sidebar */}
        <SideMenu currentRole={effectiveRole} />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            pt: { xs: 8, md: 1.5 },
            px: { xs: 2, sm: 3 },
            pb: { xs: 8, sm: 6 },
          }}
        >
          {/* Top Navbar */}
          <DashboardNavbar currentRole={effectiveRole} />

          {/* Title Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              mt: 1,
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                  Saved Directives & Personal Collections
                </Typography>
                <Chip
                  label="Research Library"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Personal bookmarked records, study annotations, physical archive shelf coordinates, and Google Docs export.
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2.5}>
            {/* 1. Top KPI Summary */}
            <BookmarkMetricsSummary
              metrics={metrics}
              activeFilter={
                onlyPinned
                  ? "PINNED"
                  : onlyPhysical
                    ? "SHELF"
                    : selectedCollection !== "All"
                      ? selectedCollection
                      : "All"
              }
              onFilterClick={(filterKey) => {
                if (filterKey === "PINNED") {
                  setOnlyPinned(true);
                  setOnlyPhysical(false);
                  setSelectedCollection("All");
                } else if (filterKey === "SHELF") {
                  setOnlyPhysical(true);
                  setOnlyPinned(false);
                  setSelectedCollection("All");
                } else if (filterKey === "All") {
                  setOnlyPinned(false);
                  setOnlyPhysical(false);
                  setSelectedCollection("All");
                }
              }}
            />

            {/* 2. Filter & View Controls */}
            <BookmarkFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              collections={collections}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
              onlyPinned={onlyPinned}
              onTogglePinned={() => setOnlyPinned((prev) => !prev)}
              onlyPhysical={onlyPhysical}
              onTogglePhysical={() => setOnlyPhysical((prev) => !prev)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenNewCollection={() => setNewCollectionOpen(true)}
              onOpenExportDialog={() => setExportDialogOpen(true)}
            />

            {/* 3. Bookmarks Display Area */}
            {filteredBookmarks.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 2.5,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <BookmarkBorderRoundedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  No saved directives match your filters
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", mb: 2 }}>
                  {searchQuery || selectedCollection !== "All" || onlyPinned || onlyPhysical
                    ? "Try adjusting your search criteria, collection filter, or toggles."
                    : "Bookmark directives from Smart Search or Document Archive to review them here."}
                </Typography>
                {(searchQuery || selectedCollection !== "All" || onlyPinned || onlyPhysical) && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FilterAltOffRoundedIcon />}
                    onClick={handleResetFilters}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    Reset All Filters
                  </Button>
                )}
              </Paper>
            ) : viewMode === "grid" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {filteredBookmarks.map((item) => (
                  <BookmarkCard
                    key={item.id}
                    item={item}
                    isSelected={activeItem?.id === item.id}
                    onSelect={(selected) => setActiveItem(selected)}
                    onTogglePin={handleTogglePin}
                    onEditNote={handleEditNote}
                    onRemove={handleRemoveBookmark}
                  />
                ))}
              </Box>
            ) : (
              <BookmarkListView
                items={filteredBookmarks}
                selectedId={activeItem?.id}
                onSelect={(selected) => setActiveItem(selected)}
                onTogglePin={handleTogglePin}
                onEditNote={handleEditNote}
                onRemove={handleRemoveBookmark}
              />
            )}
          </Stack>

          {/* Slide-out Directive Intelligence Drawer */}
          <BookmarkDetailsDrawer
            item={activeItem}
            open={Boolean(activeItem)}
            onClose={() => setActiveItem(null)}
            onTogglePin={handleTogglePin}
            onEditNote={(item) => setEditingItem(item)}
            onSaveInlineNote={handleSaveInlineNote}
            onRemove={handleRemoveBookmark}
          />

          {/* Edit Note Modal */}
          <EditNoteModal
            open={Boolean(editingItem)}
            item={editingItem}
            collections={collections}
            onClose={() => setEditingItem(null)}
            onSave={handleSaveNote}
          />

          {/* Create New Collection Modal */}
          <NewCollectionModal
            open={newCollectionOpen}
            onClose={() => setNewCollectionOpen(false)}
            onCreate={handleCreateCollection}
          />

          {/* Export Bookmarks Dialog */}
          <ExportBookmarksDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            bookmarks={filteredBookmarks}
            onConfirmExport={handleConfirmExport}
            userEmail={user?.email}
          />

          {/* Toast Notification */}
          <Snackbar
            open={Boolean(snackbarMessage)}
            autoHideDuration={3500}
            onClose={() => setSnackbarMessage(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbarMessage(null)}
              severity="success"
              variant="filled"
              sx={{ width: "100%", borderRadius: 2 }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
}
