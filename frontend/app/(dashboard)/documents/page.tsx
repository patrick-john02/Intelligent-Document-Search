"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { alpha } from "@mui/material/styles";
import { getDocument } from "@/lib/documentsApi";
import { apiDocumentToArchive } from "@/components/documents/documentMapper";

// Layout & Context
import SideMenu from "@/components/SideMenu";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTheme from "@/shared-theme/AppTheme";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRole } from "@/components/dashboard/types";

// Types
import { ArchiveDocument, ArchiveFolder } from "@/components/documents/types";

// Modular Document Page Components
import DocumentsHeaderBar from "@/components/documents/DocumentsHeaderBar";
import DocumentsDeletedVaultBanner from "@/components/documents/DocumentsDeletedVaultBanner";

import DocumentsToolbar from "@/components/documents/DocumentsToolbar";
import DocumentSelectionBanner from "@/components/documents/DocumentSelectionBanner";
import FileExplorerSidebar from "@/components/documents/FileExplorerSidebar";
import DocumentsExplorerView from "@/components/documents/DocumentsExplorerView";
import DocumentIntelligencePane, { IntelligenceTab } from "@/components/documents/DocumentIntelligencePane";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import ArchivingAgentModal from "@/components/documents/ArchivingAgentModal";
import BackgroundArchivingWidget from "@/components/documents/BackgroundArchivingWidget";
import {
  CreateFolderDialog,
  RenameFolderDialog,
  DeleteFolderDialog,
} from "@/components/documents/FolderActionDialogs";
import {
  DocumentContextMenu,
  FolderContextMenu,
} from "@/components/documents/DocumentsContextMenus";
import DocumentPreviewModal from "@/components/documents/preview/DocumentPreviewModal";

// Custom Hooks
import { useDocumentsManager } from "@/components/documents/useDocumentsManager";
import { useArchivingTask } from "@/components/documents/useArchivingTask";

export default function DocumentArchivePage(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();
  const effectiveRole = getDefaultRole(user);

  // Document Archive Domain State & Operations
  const {
    documents,
    isLoadingDocuments,
    documentsError,
    refreshDocuments,
    folders,
    currentFolderId,
    currentFolder,
    breadcrumbTrail,
    selectedDoc,
    setSelectedDoc,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCabinet,
    setSelectedCabinet,
    selectedFileType,
    setSelectedFileType,
    selectedClearance,
    setSelectedClearance,
    sortBy,
    setSortBy,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    isDeletedMode,
    setIsDeletedMode,
    totalDeletedCount,
    clearanceCounts,
    filteredDocuments,
    currentSubfolders,
    currentFiles,
    getFolderItemCount,
    isFilterActive,
    snackbarMessage,
    setSnackbarMessage,
    navigateToFolder,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleRestoreFolder,
    handleRestoreDocument,
    handleDeleteDocument,
    handleResetFilters,
    handleArchivingComplete,
  } = useDocumentsManager();

  // Layout Panels & Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [isWorkspaceDragOver, setIsWorkspaceDragOver] = useState<boolean>(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState<boolean>(false);
  const [intelligenceTab, setIntelligenceTab] = useState<IntelligenceTab>("dossier");
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);

  // Dialog States
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<ArchiveFolder | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<ArchiveFolder | null>(null);

  // Context Menu States
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDoc, setMenuDoc] = useState<ArchiveDocument | null>(null);
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [folderMenuTarget, setFolderMenuTarget] = useState<ArchiveFolder | null>(null);

  // Context Menu Helpers
  const handleOpenDocContextMenu = (event: React.MouseEvent<HTMLElement>, doc: ArchiveDocument) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuDoc(doc);
  };

  const handleOpenFolderContextMenu = (event: React.MouseEvent<HTMLElement>, folder: ArchiveFolder) => {
    event.stopPropagation();
    setFolderMenuAnchorEl(event.currentTarget);
    setFolderMenuTarget(folder);
  };

  const handleCopyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSnackbarMessage(`Copied ${label}: "${text}"`);
    }
    setMenuAnchorEl(null);
  };

  const handleToggleInspector = () => {
    if (!isIntelligenceOpen) {
      setIsIntelligenceOpen(true);
      setIntelligenceTab("dossier");
    } else if (intelligenceTab === "dossier") {
      setIsIntelligenceOpen(false);
    } else {
      setIntelligenceTab("dossier");
    }
  };

  const handleOpenMayumi = (doc?: ArchiveDocument | null) => {
    if (doc) setSelectedDoc(doc);
    setIsIntelligenceOpen(true);
    setIntelligenceTab("mayumi");
  };

  // Open the viewer right away with list data, then refresh it from GET /api/documents/{id}
  const openPreview = (doc: ArchiveDocument) => {
    setPreviewDoc(doc);
    if (typeof doc.id !== "number") return;
    getDocument(doc.id)
      .then((fresh) => {
        const mapped = { ...apiDocumentToArchive(fresh), folderId: doc.folderId };
        setPreviewDoc((current) => (current && current.id === doc.id ? mapped : current));
      })
      .catch(() => {
        /* keep the list data if the detail call fails */
      });
  };

  const handleOpenDossier = (doc?: ArchiveDocument | null) => {
    if (doc) {
      setSelectedDoc(doc);
      setIsIntelligenceOpen(true);
      setIntelligenceTab("dossier");
    }
  };

  // Background Archiving Agent Hook
  const {
    isActive: isAgentActive,
    isMinimized: isAgentMinimized,
    progress: agentProgress,
    stepIndex: agentStepIndex,
    currentStep: agentCurrentStep,
    steps: agentSteps,
    queuedFiles: agentQueuedFiles,
    isFinished: isAgentFinished,
    isReviewing: isAgentReviewing,
    startArchiving,
    minimize: minimizeAgent,
    maximize: maximizeAgent,
    dismiss: dismissAgent,
  } = useArchivingTask(
    (newDocs) => {
      handleArchivingComplete(newDocs);
      if (newDocs.length > 0) {
        setIsIntelligenceOpen(true);
        setIntelligenceTab("dossier");
      }
    },
    (message) => setSnackbarMessage(message)
  );

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
        <SideMenu currentRole={effectiveRole} />

        {/* Main Document Archive Workspace */}
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
          {/* Top Unified Navbar */}
          <Box sx={{ flexShrink: 0, mb: 0.5 }}>
            <DashboardNavbar currentRole={effectiveRole} />
          </Box>

          {/* Drive-Style Top Header & Controls */}
          <DocumentsHeaderBar
            breadcrumbTrail={breadcrumbTrail}
            currentFolderId={currentFolderId}
            onNavigateFolder={(fId) => navigateToFolder(fId)}
            onNavigateBack={() => navigateToFolder(currentFolder?.parentId || null)}
            folderCount={currentSubfolders.length}
            fileCount={currentFiles.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isIntelligenceOpen={isIntelligenceOpen}
            intelligenceTab={intelligenceTab}
            onToggleInspector={handleToggleInspector}
            isDeletedMode={isDeletedMode}
            totalDeletedCount={totalDeletedCount}
            onToggleDeletedMode={() => setIsDeletedMode((prev) => !prev)}
            onOpenUpload={() => setIsUploadOpen(true)}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />

          {/* Ambient Banner when in Soft-Deleted Records Vault Mode */}
          {isDeletedMode && (
            <DocumentsDeletedVaultBanner
              totalDeletedCount={totalDeletedCount}
              onExitDeletedMode={() => setIsDeletedMode(false)}
            />
          )}

          {/* Drive-Style Search & Quick Filters Toolbar */}
          <DocumentsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFileType={selectedFileType}
            onFileTypeChange={setSelectedFileType}
            selectedClearance={selectedClearance}
            onClearanceChange={setSelectedClearance}
            clearanceCounts={clearanceCounts}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isFilterActive={isFilterActive}
            onResetFilters={handleResetFilters}
          />

          {/* Contextual Selection Banner */}
          {selectedDoc && (
            <DocumentSelectionBanner
              selectedDoc={selectedDoc}
              showInspector={isIntelligenceOpen && intelligenceTab === "dossier"}
              onToggleInspector={handleToggleInspector}
              onAskAi={(doc) => handleOpenMayumi(doc)}
              onDeselect={() => setSelectedDoc(null)}
            />
          )}

          {/* 3-Pane Workspace Container */}
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
            {/* 1. Left Collapsible File Explorer Sidebar */}
            <FileExplorerSidebar
              documents={documents.filter((d) => (isDeletedMode ? Boolean(d.isDeleted) : !d.isDeleted))}
              folders={folders.filter((f) => (isDeletedMode ? Boolean(f.isDeleted) : !f.isDeleted))}
              currentFolderId={currentFolderId}
              onSelectFolder={(folderId) => navigateToFolder(folderId)}
              selectedCategory={currentFolder ? currentFolder.name : "All"}
              selectedCabinet={selectedCabinet}
              selectedFileType={selectedFileType}
              onSelectCategory={(cat) => {
                const target = folders.find((f) => f.name === cat);
                navigateToFolder(target ? target.id : null);
              }}
              onSelectCabinet={(cab) => setSelectedCabinet(cab)}
              onSelectFileType={(type) => setSelectedFileType(type)}
              isOpen={isSidebarOpen}
              onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
            />

            {/* 2. Center Document Workspace */}
            <Box
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                  e.preventDefault();
                  setIsWorkspaceDragOver(true);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsWorkspaceDragOver(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsWorkspaceDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setDroppedFiles(Array.from(e.dataTransfer.files));
                  setIsUploadOpen(true);
                }
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Workspace Drag-and-Drop Active Overlay */}
              {isWorkspaceDragOver && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 200,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
                    backdropFilter: "blur(6px)",
                    border: "2.5px dashed",
                    borderColor: "primary.main",
                    borderRadius: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    pointerEvents: "none",
                    boxShadow: "0 8px 32px rgba(6, 182, 212, 0.2)",
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: alpha("#06B6D4", 0.12),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Drop records to stage for archiving
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Target location: {currentFolder ? currentFolder.name : "Archive Root"}
                  </Typography>
                </Box>
              )}

              {isLoadingDocuments && <LinearProgress sx={{ flexShrink: 0 }} />}
              {documentsError && (
                <Alert
                  severity="error"
                  sx={{ m: 1.5, flexShrink: 0 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => void refreshDocuments()}>
                      Retry
                    </Button>
                  }
                >
                  Could not load documents: {documentsError}
                </Alert>
              )}
              <DocumentsExplorerView
                viewMode={viewMode}
                filteredDocuments={filteredDocuments}
                currentSubfolders={currentSubfolders}
                currentFiles={currentFiles}
                selectedDoc={selectedDoc}
                isDeletedMode={isDeletedMode}
                onOpenFolder={(fId) => navigateToFolder(fId)}
                onFolderContextMenu={handleOpenFolderContextMenu}
                getFolderItemCount={getFolderItemCount}
                onNewSubfolder={() => setIsCreateFolderOpen(true)}
                onSelectDoc={(doc) => setSelectedDoc(doc)}
                onOpenDossier={handleOpenDossier}
                onOpenPreview={openPreview}
                onDocContextMenu={handleOpenDocContextMenu}
                onAskMayumi={(doc) => handleOpenMayumi(doc)}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            </Box>

            {/* 3. Right Intelligence Pane (Dossier + Mayumi + Audit) */}
            <DocumentIntelligencePane
              open={isIntelligenceOpen}
              onClose={() => setIsIntelligenceOpen(false)}
              document={selectedDoc}
              currentFolder={currentFolder}
              activeTab={intelligenceTab}
              onTabChange={(tab) => setIntelligenceTab(tab)}
              onOpenDocument={(doc) => openPreview(doc)}
            />
          </Box>
        </Box>

        {/* 3-Dots Context Menus */}
        <DocumentContextMenu
          anchorEl={menuAnchorEl}
          document={menuDoc}
          onClose={() => setMenuAnchorEl(null)}
          onViewDetails={(doc) => {
            setSelectedDoc(doc);
            handleOpenDossier(doc);
          }}
          onAskAi={(doc) => handleOpenMayumi(doc)}
          onCopyText={handleCopyText}
          isDeletedMode={isDeletedMode}
          onRestoreDocument={handleRestoreDocument}
          onDeleteDocument={handleDeleteDocument}
        />

        <FolderContextMenu
          anchorEl={folderMenuAnchorEl}
          folder={folderMenuTarget}
          onClose={() => setFolderMenuAnchorEl(null)}
          onOpenFolder={(f) => navigateToFolder(f.id)}
          onRenameFolder={(f) => setRenameFolderTarget(f)}
          onDeleteFolder={(f) => setDeleteFolderTarget(f)}
          isDeletedMode={isDeletedMode}
          onRestoreFolder={handleRestoreFolder}
        />

        {/* Folder Action Dialogs */}
        <CreateFolderDialog
          open={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={(name, color) => {
            handleCreateFolder(name, color);
            setIsCreateFolderOpen(false);
          }}
          currentFolderName={currentFolder ? currentFolder.name : "Home"}
        />

        <RenameFolderDialog
          folder={renameFolderTarget}
          onClose={() => setRenameFolderTarget(null)}
          onRename={(folder, newName) => {
            handleRenameFolder(folder, newName);
            setRenameFolderTarget(null);
          }}
        />

        <DeleteFolderDialog
          folder={deleteFolderTarget}
          onClose={() => setDeleteFolderTarget(null)}
          onDelete={(folder) => {
            handleDeleteFolder(folder);
            setDeleteFolderTarget(null);
          }}
        />

        {/* Action Feedback Snackbar */}
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={snackbarMessage?.startsWith("Upload failed") ? 8000 : 3000}
          onClose={() => setSnackbarMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarMessage(null)}
            severity={snackbarMessage?.startsWith("Upload failed") ? "error" : "success"}
            variant="filled"
            sx={{ width: "100%", borderRadius: 1.5, fontSize: "0.82rem" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Upload Document Dialog */}
        <UploadDocumentDialog
          open={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            setDroppedFiles([]);
          }}
          onStartArchiving={(files, config) => {
            startArchiving(files, config);
            setSnackbarMessage(
              `Ingestion started: ${files.length} record(s) queued for Alon's archiving pipeline.`
            );
          }}
          currentFolder={currentFolder}
          breadcrumbTrail={breadcrumbTrail}
          initialFiles={droppedFiles}
          existingDocuments={documents}
        />

        {/* Archiving Agent Pipeline Modal */}
        <ArchivingAgentModal
          open={isAgentActive && !isAgentMinimized}
          progress={agentProgress}
          stepIndex={agentStepIndex}
          currentStep={agentCurrentStep}
          steps={agentSteps}
          queuedFiles={agentQueuedFiles}
          isFinished={isAgentFinished}
          isReviewing={isAgentReviewing}
          onMinimize={minimizeAgent}
          onDismiss={dismissAgent}
        />

        {/* Minimized Background Agent Floating Pill */}
        {isAgentActive && isAgentMinimized && (
          <BackgroundArchivingWidget
            progress={agentProgress}
            currentStep={agentCurrentStep}
            queuedFiles={agentQueuedFiles}
            isFinished={isAgentFinished}
            onMaximize={maximizeAgent}
            onDismiss={dismissAgent}
          />
        )}

        {/* High-Resolution Document Reader Preview Modal (Option 1) */}
        <DocumentPreviewModal
          document={previewDoc}
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          onAskMayumi={(doc) => {
            setPreviewDoc(null);
            handleOpenMayumi(doc);
          }}
        />
      </Box>
    </AppTheme>
  );
}
