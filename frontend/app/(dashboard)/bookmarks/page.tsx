"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
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

export default function BookmarksPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(SEED_BOOKMARKS);
  const [collections, setCollections] = useState<string[]>(INITIAL_COLLECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "year" | "order" | "title">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Modals
  const [activeItem, setActiveItem] = useState<BookmarkItem | null>(null);
  const [editingItem, setEditingItem] = useState<BookmarkItem | null>(null);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Computed Metrics
  const metrics: BookmarkMetrics = useMemo(() => {
    return {
      totalSaved: bookmarks.length,
      collectionsCount: collections.filter((c) => c !== "All").length,
      pinnedCount: bookmarks.filter((b) => b.isPinned).length,
      physicalOnShelfCount: bookmarks.filter((b) => !!b.shelfLocation?.barcode).length,
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
  }, [bookmarks, selectedCollection, onlyPinned, searchQuery, sortBy]);

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

    // Update activeItem if it's currently open in drawer
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCollection("All");
    setOnlyPinned(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Persistent Staff Sidebar */}
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
          {/* Reusable 1-File Navbar */}
          <DashboardNavbar currentRole={effectiveRole} />

          {/* Unified Title Bar */}
          <Box sx={{ mt: 1, mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              Saved Directives
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              Personal bookmarked records, annotated guidelines, and rapid physical shelf coordinates.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {/* 1. Top KPI Summary */}
            <BookmarkMetricsSummary
              metrics={metrics}
              activeFilter={onlyPinned ? "PINNED" : selectedCollection}
              onFilterClick={(filterKey) => {
                if (filterKey === "PINNED") {
                  setOnlyPinned(true);
                  setSelectedCollection("All");
                } else if (filterKey === "All") {
                  setOnlyPinned(false);
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
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenNewCollection={() => setNewCollectionOpen(true)}
            />

            {/* 3. Bookmarks Display Area */}
            {filteredBookmarks.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <BookmarkBorderRoundedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  No saved directives match your filter
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.82rem", maxWidth: 420, mx: "auto", mb: 2 }}
                >
                  Try adjusting your search keywords, switching collections, or toggling the pinned filter.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
                >
                  Reset Filters
                </Button>
              </Paper>
            ) : viewMode === "grid" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {filteredBookmarks.map((item) => (
                  <BookmarkCard
                    key={item.id}
                    item={item}
                    isSelected={activeItem?.id === item.id}
                    onSelect={setActiveItem}
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
                onSelect={setActiveItem}
                onTogglePin={handleTogglePin}
                onEditNote={handleEditNote}
                onRemove={handleRemoveBookmark}
              />
            )}
          </Stack>

          {/* Details Slide-Over Drawer */}
          <BookmarkDetailsDrawer
            item={activeItem}
            open={Boolean(activeItem)}
            onClose={() => setActiveItem(null)}
            onTogglePin={handleTogglePin}
            onEditNote={(item) => setEditingItem(item)}
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

          {/* New Collection Modal */}
          <NewCollectionModal
            open={newCollectionOpen}
            onClose={() => setNewCollectionOpen(false)}
            onCreate={handleCreateCollection}
          />

          {/* Notification Toast */}
          <Snackbar
            open={Boolean(snackbarMessage)}
            autoHideDuration={3000}
            onClose={() => setSnackbarMessage(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbarMessage(null)}
              severity="info"
              sx={{ width: "100%", borderRadius: 1, fontWeight: 600, fontSize: "0.82rem" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
}
