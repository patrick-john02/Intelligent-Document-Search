"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

// Layout & Dashboard Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";
import { useBookmarks } from "@/context/BookmarkContext";

// Bookmarks Subcomponents
import { BookmarkItem } from "@/components/bookmarks/types";
import BookmarkMetricsSummary from "@/components/bookmarks/BookmarkMetricsSummary";
import BookmarkFilterBar from "@/components/bookmarks/BookmarkFilterBar";
import BookmarkCard from "@/components/bookmarks/BookmarkCard";
import BookmarkListView from "@/components/bookmarks/BookmarkListView";
import BookmarkDetailsDrawer from "@/components/bookmarks/BookmarkDetailsDrawer";
import BookmarkCollectionsSidebar, { SmartFilterType } from "@/components/bookmarks/BookmarkCollectionsSidebar";
import BookmarkBatchActionBar from "@/components/bookmarks/BookmarkBatchActionBar";
import EditNoteModal from "@/components/bookmarks/EditNoteModal";
import NewCollectionModal from "@/components/bookmarks/NewCollectionModal";
import ExportBookmarksDialog from "@/components/bookmarks/ExportBookmarksDialog";
import DocumentPreviewModal from "@/components/documents/preview/DocumentPreviewModal";
import { ArchiveDocument } from "@/components/documents/types";

function bookmarkToArchiveDocument(bm: BookmarkItem): ArchiveDocument {
  return {
    id: bm.id,
    title: bm.title,
    orderNo: bm.orderNo,
    seriesYear: bm.seriesYear,
    category: bm.category,
    clearance: bm.clearance,
    cabinet: bm.shelfLocation.cabinet,
    shelf: bm.shelfLocation.shelf,
    folder: bm.shelfLocation.binder,
    shelfLocation: bm.shelfLocation.barcode,
    ocrAccuracy: 99.2,
    fileSize: bm.fileSize,
    pageCount: bm.pageCount,
    fileType: "pdf",
    fileName: `${bm.orderNo}.pdf`,
    version: "v1.0",
    ingestedDate: bm.officialDate || bm.dateBookmarked,
    status: "Archived",
    tags: bm.tags.map((t) => ({ name: t, score: 0.95 })),
    summary: bm.extractedSummary || bm.personalNotes || bm.title,
  };
}

export default function BookmarksPage(props: { disableCustomTheme?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Global Context State
  const {
    bookmarks,
    collections,
    metrics,
    togglePin,
    removeBookmark,
    updateNote,
    createCollection,
    deleteCollection,
    renameCollection,
    batchMoveToCollection,
    batchRemoveBookmarks,
    batchTogglePin,
  } = useBookmarks();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [smartFilter, setSmartFilter] = useState<SmartFilterType>("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [onlyPhysical, setOnlyPhysical] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "year" | "order" | "title">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<BookmarkItem | null>(null);
  const [previewItem, setPreviewItem] = useState<BookmarkItem | null>(null);
  const [editingItem, setEditingItem] = useState<BookmarkItem | null>(null);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Tag extraction across all bookmarks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach((b) => {
      b.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [bookmarks]);

  // Collection count map
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    collections.forEach((c) => {
      counts[c] = bookmarks.filter((b) => b.collection === c).length;
    });
    return counts;
  }, [bookmarks, collections]);

  // Filter & Sort Pipeline
  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((item) => {
        // Smart Filter
        if (smartFilter === "PINNED" && !item.isPinned) return false;
        if (smartFilter === "PHYSICAL" && !item.shelfLocation?.barcode) return false;
        if (smartFilter === "NOTES" && !item.personalNotes?.trim()) return false;

        // Legacy toggle buttons
        if (onlyPinned && !item.isPinned) return false;
        if (onlyPhysical && !item.shelfLocation?.barcode) return false;

        // Collection filter
        if (selectedCollection !== "All" && item.collection !== selectedCollection) {
          return false;
        }

        // Tag filter
        if (selectedTag && !item.tags.includes(selectedTag)) {
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
        // Pinned always come first unless custom sorting
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
  }, [bookmarks, smartFilter, onlyPinned, onlyPhysical, selectedCollection, selectedTag, searchQuery, sortBy]);

  // Selection handlers
  const handleToggleCheckId = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredBookmarks.map((b) => b.id)));
  }, [filteredBookmarks]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Batch actions
  const handleBatchMoveToCollection = (colName: string) => {
    batchMoveToCollection(Array.from(selectedIds), colName);
    setSnackbarMessage(`Moved ${selectedIds.size} directive(s) to "${colName}".`);
    handleClearSelection();
  };

  const handleBatchTogglePin = () => {
    const anyUnpinned = bookmarks.some((b) => selectedIds.has(b.id) && !b.isPinned);
    batchTogglePin(Array.from(selectedIds), anyUnpinned);
    setSnackbarMessage(
      anyUnpinned
        ? `Pinned ${selectedIds.size} directives for quick reference.`
        : `Unpinned ${selectedIds.size} directives.`
    );
  };

  const handleBatchSynthesizeAi = () => {
    const selectedDirectives = bookmarks
      .filter((b) => selectedIds.has(b.id))
      .map((b) => b.orderNo)
      .join(", ");
    router.push(`/chat?directive=${encodeURIComponent(selectedDirectives)}&mode=synthesize`);
  };

  const handleBatchExport = () => {
    setExportDialogOpen(true);
  };

  const handleBatchRemove = () => {
    const count = selectedIds.size;
    batchRemoveBookmarks(Array.from(selectedIds));
    handleClearSelection();
    setSnackbarMessage(`Removed ${count} directive(s) from bookmarks.`);
  };

  // Card / Single Item Handlers
  const handleTogglePinSingle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextPinned = togglePin(id);
    const target = bookmarks.find((b) => b.id === id);
    setSnackbarMessage(
      nextPinned
        ? `Pinned "${target?.orderNo || "directive"}" for quick reference.`
        : `Unpinned "${target?.orderNo || "directive"}".`
    );
  };

  const handleRemoveSingle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = bookmarks.find((b) => b.id === id);
    removeBookmark(id);
    if (activeItem?.id === id) setActiveItem(null);
    if (previewItem?.id === id) setPreviewItem(null);
    setSnackbarMessage(`Removed "${target?.orderNo || "directive"}" from bookmarks.`);
  };

  const handleSaveNoteModal = (id: string, notes: string, collection: string) => {
    updateNote(id, notes, collection);
    setSnackbarMessage("Personal notes and collection updated successfully.");
  };

  const handleSaveInlineNote = (id: string, note: string) => {
    updateNote(id, note);
    setSnackbarMessage("Personal notes updated.");
  };

  const handleCreateCollection = (name: string) => {
    const created = createCollection(name);
    if (created) {
      setSelectedCollection(name);
      setSmartFilter(null);
      setSnackbarMessage(`Created collection "${name}".`);
    } else {
      setSnackbarMessage(`Collection "${name}" already exists.`);
    }
  };

  const handleDeleteCollection = (name: string) => {
    deleteCollection(name);
    if (selectedCollection === name) setSelectedCollection("All");
    setSnackbarMessage(`Deleted collection "${name}". Items moved to General Operations.`);
  };

  const handleRenameCollection = (oldName: string, newName: string) => {
    renameCollection(oldName, newName);
    if (selectedCollection === oldName) setSelectedCollection(newName);
    setSnackbarMessage(`Renamed collection to "${newName}".`);
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
    setSmartFilter("ALL");
    setSelectedTag(null);
    setOnlyPinned(false);
    setOnlyPhysical(false);
    setSelectedIds(new Set());
  };

  // Preview Document Modal conversion
  const previewDoc: ArchiveDocument | null = useMemo(() => {
    return previewItem ? bookmarkToArchiveDocument(previewItem) : null;
  }, [previewItem]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Persistent Left Nav */}
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
                Personal bookmarked records, study annotations, physical archive shelf coordinates, and Google Workspace sync.
              </Typography>
            </Box>

            {/* Quick Multi-Directive AI Synthesize Shortcut */}
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  const allSaved = bookmarks.map((b) => b.orderNo).slice(0, 5).join(", ");
                  router.push(`/chat?directive=${encodeURIComponent(allSaved)}&mode=synthesize`);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                }}
              >
                Synthesize Saved Directives
              </Button>
            </Stack>
          </Box>

          <Stack spacing={2.5}>
            {/* 1. Top KPI Summary Cards */}
            <BookmarkMetricsSummary
              metrics={metrics}
              activeFilter={
                smartFilter === "PINNED" || onlyPinned
                  ? "PINNED"
                  : smartFilter === "PHYSICAL" || onlyPhysical
                    ? "SHELF"
                    : selectedCollection !== "All"
                      ? selectedCollection
                      : "All"
              }
              onFilterClick={(filterKey) => {
                if (filterKey === "PINNED") {
                  setSmartFilter("PINNED");
                  setSelectedCollection("All");
                  setSelectedTag(null);
                } else if (filterKey === "SHELF") {
                  setSmartFilter("PHYSICAL");
                  setSelectedCollection("All");
                  setSelectedTag(null);
                } else if (filterKey === "All") {
                  setSmartFilter("ALL");
                  setSelectedCollection("All");
                  setSelectedTag(null);
                  setOnlyPinned(false);
                  setOnlyPhysical(false);
                }
              }}
            />

            {/* 2. Main Two-Column Split Layout */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2.5,
                alignItems: "flex-start",
              }}
            >
              {/* Left Collections & Tags Sidebar */}
              <BookmarkCollectionsSidebar
                collections={collections}
                selectedCollection={selectedCollection}
                onSelectCollection={(col) => {
                  setSelectedCollection(col);
                  setSmartFilter(null);
                  setSelectedTag(null);
                }}
                smartFilter={smartFilter}
                onSelectSmartFilter={(filter) => {
                  setSmartFilter(filter);
                  setSelectedCollection("All");
                  setSelectedTag(null);
                }}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                allTags={allTags}
                metrics={metrics}
                collectionCounts={collectionCounts}
                onOpenNewCollection={() => setNewCollectionOpen(true)}
                onDeleteCollection={handleDeleteCollection}
                onRenameCollection={handleRenameCollection}
              />

              {/* Right Main Stage: Filter Controls + Items View */}
              <Box sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
                <Stack spacing={2}>
                  {/* Filter & View Toolbar */}
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

                  {/* Active Filter Indicators */}
                  {(selectedTag || smartFilter !== "ALL" || selectedCollection !== "All" || searchQuery) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Active criteria:
                      </Typography>
                      {smartFilter && smartFilter !== "ALL" && (
                        <Chip
                          size="small"
                          label={`View: ${smartFilter}`}
                          onDelete={() => setSmartFilter("ALL")}
                          sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      )}
                      {selectedCollection !== "All" && (
                        <Chip
                          size="small"
                          label={`Collection: ${selectedCollection}`}
                          onDelete={() => setSelectedCollection("All")}
                          sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      )}
                      {selectedTag && (
                        <Chip
                          size="small"
                          label={`#${selectedTag}`}
                          onDelete={() => setSelectedTag(null)}
                          sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      )}
                      {searchQuery && (
                        <Chip
                          size="small"
                          label={`"${searchQuery}"`}
                          onDelete={() => setSearchQuery("")}
                          sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      )}
                      <Button
                        size="small"
                        onClick={handleResetFilters}
                        sx={{ fontSize: "0.72rem", textTransform: "none", py: 0 }}
                      >
                        Reset all
                      </Button>
                    </Box>
                  )}

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
                        {searchQuery || selectedCollection !== "All" || smartFilter !== "ALL" || selectedTag
                          ? "Try clearing tags, switching collections, or resetting your search query."
                          : "Bookmark directives from Smart Search or Document Archive to review them here."}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FilterAltOffRoundedIcon />}
                        onClick={handleResetFilters}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                      >
                        Reset All Filters
                      </Button>
                    </Paper>
                  ) : viewMode === "grid" ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          lg: "repeat(2, 1fr)",
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
                          isChecked={selectedIds.has(item.id)}
                          onToggleCheck={handleToggleCheckId}
                          onSelect={(selected) => setActiveItem(selected)}
                          onPreview={(itemToPreview) => setPreviewItem(itemToPreview)}
                          onTogglePin={handleTogglePinSingle}
                          onEditNote={(itemToEdit) => setEditingItem(itemToEdit)}
                          onRemove={handleRemoveSingle}
                        />
                      ))}
                    </Box>
                  ) : (
                    <BookmarkListView
                      items={filteredBookmarks}
                      selectedId={activeItem?.id}
                      selectedIds={selectedIds}
                      onToggleCheck={handleToggleCheckId}
                      onSelectAll={handleSelectAll}
                      onClearSelection={handleClearSelection}
                      onSelect={(selected) => setActiveItem(selected)}
                      onPreview={(itemToPreview) => setPreviewItem(itemToPreview)}
                      onTogglePin={handleTogglePinSingle}
                      onEditNote={(itemToEdit) => setEditingItem(itemToEdit)}
                      onRemove={handleRemoveSingle}
                    />
                  )}
                </Stack>
              </Box>
            </Box>
          </Stack>

          {/* Floating Batch Action Toolbar */}
          <BookmarkBatchActionBar
            selectedCount={selectedIds.size}
            totalFilteredCount={filteredBookmarks.length}
            collections={collections}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onMoveToCollection={handleBatchMoveToCollection}
            onTogglePinSelected={handleBatchTogglePin}
            onExportSelected={handleBatchExport}
            onSynthesizeAi={handleBatchSynthesizeAi}
            onRemoveSelected={handleBatchRemove}
          />

          {/* Slide-out Directive Intelligence Drawer */}
          <BookmarkDetailsDrawer
            item={activeItem}
            open={Boolean(activeItem)}
            onClose={() => setActiveItem(null)}
            onPreview={(itemToPreview) => setPreviewItem(itemToPreview)}
            onTogglePin={handleTogglePinSingle}
            onEditNote={(itemToEdit) => setEditingItem(itemToEdit)}
            onSaveInlineNote={handleSaveInlineNote}
            onRemove={handleRemoveSingle}
          />

          {/* Full In-App Document Preview Modal */}
          <DocumentPreviewModal
            document={previewDoc}
            open={Boolean(previewDoc)}
            onClose={() => setPreviewItem(null)}
            onAskMayumi={(doc) => router.push(`/chat?directive=${encodeURIComponent(doc.orderNo)}`)}
          />

          {/* Edit Note Modal */}
          <EditNoteModal
            open={Boolean(editingItem)}
            item={editingItem}
            collections={collections}
            onClose={() => setEditingItem(null)}
            onSave={handleSaveNoteModal}
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
            bookmarks={
              selectedIds.size > 0
                ? filteredBookmarks.filter((b) => selectedIds.has(b.id))
                : filteredBookmarks
            }
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
