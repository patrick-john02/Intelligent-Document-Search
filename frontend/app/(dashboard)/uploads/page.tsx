"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";

// Layout & Dashboard Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Uploads & Personal Files Components
import {
  PersonalFileItem,
  GoogleDriveAccountMeta,
} from "@/components/uploads/types";
import { INITIAL_PERSONAL_FILES } from "@/components/uploads/seedPersonalFiles";
import GoogleDriveSyncBanner from "@/components/uploads/GoogleDriveSyncBanner";
import PersonalFilesToolbar, { FilterTab } from "@/components/uploads/PersonalFilesToolbar";
import PersonalFilesGridView from "@/components/uploads/PersonalFilesGridView";
import PersonalFilesListView from "@/components/uploads/PersonalFilesListView";
import PersonalFileInspectorDrawer from "@/components/uploads/PersonalFileInspectorDrawer";
import UploadPersonalFileDialog from "@/components/uploads/UploadPersonalFileDialog";
import GoogleDriveImportDialog from "@/components/uploads/GoogleDriveImportDialog";

export default function MyPersonalFilesPage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Files Data State
  const [files, setFiles] = useState<PersonalFileItem[]>(INITIAL_PERSONAL_FILES);

  // Google Drive Account & Sync State
  const isUserGoogle = user?.auth_provider === "google" || !!user?.google_id;
  const [driveMeta, setDriveMeta] = useState<GoogleDriveAccountMeta>({
    isConnected: isUserGoogle,
    email: user?.google_email || user?.email || "user@organization.gov",
    storageUsedFormatted: "4.2 GB",
    storageTotalFormatted: "15 GB",
    storagePercent: 28,
    lastFullSync: "5m ago",
    targetFolder: "My Drive / Intelligent Document Search / Personal Files",
  });

  // Sync state tracking if user auth changes
  React.useEffect(() => {
    if (isUserGoogle) {
      setDriveMeta((prev) => ({
        ...prev,
        isConnected: true,
        email: user?.google_email || user?.email || prev.email,
      }));
    }
  }, [isUserGoogle, user]);

  // View & Filter States
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Modal States
  const [selectedFile, setSelectedFile] = useState<PersonalFileItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDriveImportModalOpen, setIsDriveImportModalOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Computed Metrics
  const totalCount = files.length;
  const syncedCount = useMemo(() => files.filter((f) => f.isGoogleDriveSynced).length, [files]);
  const localCount = useMemo(() => files.filter((f) => !f.isGoogleDriveSynced).length, [files]);
  const starredCount = useMemo(() => files.filter((f) => f.isStarred).length, [files]);

  // Filtered Files Computation
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // 1. Filter Tab
      if (activeFilterTab === "gdrive" && !file.isGoogleDriveSynced) return false;
      if (activeFilterTab === "local" && file.isGoogleDriveSynced) return false;
      if (activeFilterTab === "starred" && !file.isStarred) return false;

      // 2. Category Filter
      if (selectedCategory !== "all" && file.category !== selectedCategory) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = file.title.toLowerCase().includes(query);
        const matchesFile = file.fileName.toLowerCase().includes(query);
        const matchesCategory = file.category.toLowerCase().includes(query);
        const matchesTags = file.tags.some((t) => t.toLowerCase().includes(query));
        const matchesSummary = file.extractedSummary?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesFile && !matchesCategory && !matchesTags && !matchesSummary) {
          return false;
        }
      }

      return true;
    });
  }, [files, activeFilterTab, selectedCategory, searchQuery]);

  // Handlers
  const handleToggleConnect = () => {
    setDriveMeta((prev) => {
      const nextConnected = !prev.isConnected;
      setNotification(
        nextConnected
          ? "Extended Google Drive connected! You can now sync personal files to the cloud."
          : "Google Drive link disconnected. Files remain saved in your local vault."
      );
      return {
        ...prev,
        isConnected: nextConnected,
      };
    });
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    // Simulate cloud sync handshake
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        isGoogleDriveSynced: true,
        googleSyncStatus: "synced",
        googleDriveWebViewLink:
          f.googleDriveWebViewLink || `https://drive.google.com/file/d/sync_bulk_${f.id}/view`,
        googleDriveFolder: "My Drive / Intelligent Document Search / Personal Files",
        lastSyncedAt: "Just now",
      }))
    );
    setIsSyncingAll(false);
    setNotification("All local personal files successfully synchronized to Google Drive!");
  };

  const handleSyncSingleFile = (file: PersonalFileItem) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id
          ? {
              ...f,
              isGoogleDriveSynced: true,
              googleSyncStatus: "synced",
              googleDriveFileId: `gdrive_${file.id}`,
              googleDriveWebViewLink: `https://drive.google.com/file/d/gdrive_${file.id}/view`,
              googleDriveFolder: "My Drive / Intelligent Document Search / Personal Files",
              lastSyncedAt: "Just now",
            }
          : f
      )
    );
    setNotification(`File "${file.title}" synced to your Google Drive folder.`);
  };

  const handleToggleStar = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f))
    );
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setIsInspectorOpen(false);
    }
    setNotification("Document removed from personal vault.");
  };

  const handleSelectFile = (file: PersonalFileItem) => {
    setSelectedFile(file);
    setIsInspectorOpen(true);
  };

  const handleUploadSuccess = (item: PersonalFileItem) => {
    setFiles((prev) => [item, ...prev]);
    setSelectedFile(item);
    setIsInspectorOpen(true);
    setNotification(
      item.isGoogleDriveSynced
        ? `Uploaded "${item.title}" and synced to Google Drive!`
        : `Uploaded "${item.title}" to your local personal vault.`
    );
  };

  const handleImportFiles = (newFiles: PersonalFileItem[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
    setNotification(`Imported ${newFiles.length} file(s) from your Google Drive.`);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Content Workspace */}
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
          <Box sx={{ flexShrink: 0, mb: 1 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Personal Files
                </Typography>
                <Chip
                  label="Extended Google Drive Workspace"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1.5 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Manage your personal directives, reports, notes, and cloud synchronization with your Google Drive.
              </Typography>
            </Box>
          </Box>

          {/* Scrollable Main Area */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              py: 2,
              pr: { xs: 0, md: 1 },
            }}
          >
            <Stack spacing={2.5}>
              {/* Google Drive Status & Sync Banner */}
              <GoogleDriveSyncBanner
                driveMeta={driveMeta}
                onToggleConnect={handleToggleConnect}
                onSyncAll={handleSyncAll}
                isSyncingAll={isSyncingAll}
                syncedCount={syncedCount}
                totalCount={totalCount}
              />

              {/* Personal Files Toolbar */}
              <PersonalFilesToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilterTab={activeFilterTab}
                onFilterTabChange={setActiveFilterTab}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenDriveImportModal={() => setIsDriveImportModalOpen(true)}
                isDriveConnected={driveMeta.isConnected}
                totalCount={totalCount}
                syncedCount={syncedCount}
                localCount={localCount}
                starredCount={starredCount}
              />

              {/* Files View: Grid or List */}
              {viewMode === "grid" ? (
                <PersonalFilesGridView
                  files={filteredFiles}
                  selectedFileId={selectedFile?.id || null}
                  onSelectFile={handleSelectFile}
                  onToggleStar={handleToggleStar}
                  onSyncToDrive={handleSyncSingleFile}
                  onDeleteFile={handleDeleteFile}
                  isDriveConnected={driveMeta.isConnected}
                />
              ) : (
                <PersonalFilesListView
                  files={filteredFiles}
                  selectedFileId={selectedFile?.id || null}
                  onSelectFile={handleSelectFile}
                  onToggleStar={handleToggleStar}
                  onSyncToDrive={handleSyncSingleFile}
                  onDeleteFile={handleDeleteFile}
                  isDriveConnected={driveMeta.isConnected}
                />
              )}
            </Stack>
          </Box>

          {/* Slide-out Inspector Drawer */}
          <PersonalFileInspectorDrawer
            open={isInspectorOpen}
            file={selectedFile}
            onClose={() => setIsInspectorOpen(false)}
            onToggleStar={handleToggleStar}
            onSyncToDrive={handleSyncSingleFile}
            onDeleteFile={handleDeleteFile}
            isDriveConnected={driveMeta.isConnected}
          />

          {/* Upload Dialog */}
          <UploadPersonalFileDialog
            open={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
            isDriveConnected={driveMeta.isConnected}
          />

          {/* Google Drive Import Dialog */}
          <GoogleDriveImportDialog
            open={isDriveImportModalOpen}
            onClose={() => setIsDriveImportModalOpen(false)}
            onImportFiles={handleImportFiles}
            userEmail={driveMeta.email}
          />

          {/* Notification Toast */}
          <Snackbar
            open={Boolean(notification)}
            autoHideDuration={3500}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setNotification(null)}
              severity="success"
              variant="filled"
              sx={{ width: "100%", borderRadius: 2 }}
            >
              {notification}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
}
