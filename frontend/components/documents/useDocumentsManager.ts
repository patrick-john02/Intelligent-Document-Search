"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { alpha } from "@mui/material/styles";

import {
  ArchiveDocument,
  ArchiveFolder,
  DocumentSortOption,
  DocumentClearanceFilterOption,
} from "./types";
import { INITIAL_FOLDERS } from "./mockData";
import { parseSizeInBytes } from "./documentsUtils";
import { getAllDocuments } from "@/lib/documentsApi";
import { apiDocumentToArchive } from "./documentMapper";

const STATUS_POLL_MS = 10000; // refresh while any document is still being ingested

export function useDocumentsManager() {
  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [folders, setFolders] = useState<ArchiveFolder[]>(INITIAL_FOLDERS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(null);

  // Load documents from GET /api/documents/all.
  // Folders and soft-delete flags are frontend-only, so keep them from the current state.
  const refreshDocuments = useCallback(
    () =>
      getAllDocuments()
        .then((apiDocs) => {
          const fresh = apiDocs.map(apiDocumentToArchive);
          const keepLocal = (doc: ArchiveDocument, old?: ArchiveDocument) =>
            old ? { ...doc, folderId: old.folderId, isDeleted: old.isDeleted } : doc;

          setDocuments((prev) => {
            const local = new Map(prev.map((d) => [d.id, d]));
            return fresh.map((d) => keepLocal(d, local.get(d.id)));
          });
          // keep the selected document in sync; select the first one initially
          setSelectedDoc((prev) => {
            if (!prev) return fresh[0] ?? null;
            const match = fresh.find((d) => d.id === prev.id);
            return match ? keepLocal(match, prev) : prev;
          });
          setDocumentsError(null);
        })
        .catch((err) => {
          setDocumentsError(err instanceof Error ? err.message : "Could not load documents");
        })
        .finally(() => setIsLoadingDocuments(false)),
    []
  );

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  // Poll while uploads are still going through OCR / chunking / embedding
  const hasProcessing = documents.some((d) => d.status === "Processing");
  useEffect(() => {
    if (!hasProcessing) return;
    const timer = setInterval(() => void refreshDocuments(), STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [hasProcessing, refreshDocuments]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "cabinet">("grid");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCabinet, setSelectedCabinet] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState<string>("All");
  const [selectedClearance, setSelectedClearance] = useState<DocumentClearanceFilterOption>("All");
  const [sortBy, setSortBy] = useState<DocumentSortOption>("date-desc");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  // Soft-delete toggle mode
  const [isDeletedMode, setIsDeletedMode] = useState<boolean>(false);

  // Snackbar feedback
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Soft-deleted counts
  const deletedDocCount = useMemo(
    () => documents.filter((d) => Boolean(d.isDeleted)).length,
    [documents]
  );
  const deletedFolderCount = useMemo(
    () => folders.filter((f) => Boolean(f.isDeleted)).length,
    [folders]
  );
  const totalDeletedCount = deletedDocCount + deletedFolderCount;

  // Clearance counts
  const clearanceCounts = useMemo(() => {
    const pool = documents.filter((d) =>
      isDeletedMode ? Boolean(d.isDeleted) : !d.isDeleted
    );
    return {
      All: pool.length,
      Public: pool.filter((d) => d.clearance === "Public").length,
      Internal: pool.filter((d) => d.clearance === "Internal").length,
      Restricted: pool.filter((d) => d.clearance === "Restricted").length,
      Confidential: pool.filter((d) => d.clearance === "Confidential").length,
    };
  }, [documents, isDeletedMode]);

  // Folder navigation helper with URL query sync
  const navigateToFolder = useCallback((folderId: string | null, pushToHistory = true) => {
    setCurrentFolderId(folderId);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (folderId) {
        params.set("folder", folderId);
      } else {
        params.delete("folder");
      }
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const newUrl = `${window.location.pathname}${queryString}`;

      if (pushToHistory) {
        window.history.pushState({ folderId }, "", newUrl);
      } else {
        window.history.replaceState({ folderId }, "", newUrl);
      }
    }
  }, []);

  // Sync folder navigation with browser Back/Forward buttons & URL on load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const initialFolder = params.get("folder");
    if (initialFolder) {
      setCurrentFolderId(initialFolder);
    }

    const handlePopState = (event: PopStateEvent) => {
      const currentParams = new URLSearchParams(window.location.search);
      const folderFromUrl =
        currentParams.get("folder") || (event.state && event.state.folderId) || null;
      setCurrentFolderId(folderFromUrl);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Current Active Folder Object
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  // Breadcrumbs Trail
  const breadcrumbTrail = useMemo(() => {
    const trail: { id: string | null; name: string }[] = [{ id: null, name: "Home" }];
    if (!currentFolderId) return trail;

    const path: { id: string; name: string }[] = [];
    let curr = folders.find((f) => f.id === currentFolderId);

    while (curr) {
      path.unshift({ id: curr.id, name: curr.name });
      curr = curr.parentId ? folders.find((f) => f.id === curr?.parentId) : undefined;
    }

    return [...trail, ...path];
  }, [currentFolderId, folders]);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = documents.filter((doc) => {
      const matchesDeleted = isDeletedMode ? Boolean(doc.isDeleted) : !doc.isDeleted;
      if (!matchesDeleted) return false;

      const matchesSearch =
        !query ||
        doc.title.toLowerCase().includes(query) ||
        doc.orderNo.toLowerCase().includes(query) ||
        doc.shelfLocation.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query);

      const matchesCabinet = selectedCabinet === "All" || doc.cabinet === selectedCabinet;
      const matchesFileType = selectedFileType === "All" || doc.fileType === selectedFileType;
      const matchesClearance =
        selectedClearance === "All" || doc.clearance === selectedClearance;

      const docDate = dayjs(doc.ingestedDate);
      const matchesFromDate =
        !fromDate || docDate.isAfter(fromDate.startOf("day").subtract(1, "second"));
      const matchesToDate = !toDate || docDate.isBefore(toDate.endOf("day").add(1, "second"));

      return (
        matchesSearch &&
        matchesCabinet &&
        matchesFileType &&
        matchesClearance &&
        matchesFromDate &&
        matchesToDate
      );
    });

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.ingestedDate).getTime() - new Date(a.ingestedDate).getTime();
        case "date-asc":
          return new Date(a.ingestedDate).getTime() - new Date(b.ingestedDate).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "order-asc":
          return a.orderNo.localeCompare(b.orderNo);
        case "size-desc":
          return parseSizeInBytes(b.fileSize) - parseSizeInBytes(a.fileSize);
        case "type":
          return a.fileType.localeCompare(b.fileType);
        default:
          return new Date(b.ingestedDate).getTime() - new Date(a.ingestedDate).getTime();
      }
    });
  }, [
    documents,
    searchQuery,
    selectedCabinet,
    selectedFileType,
    selectedClearance,
    fromDate,
    toDate,
    sortBy,
    isDeletedMode,
  ]);

  const isSearchActive = searchQuery.trim().length > 0;

  // Subfolders of the active folder
  const currentSubfolders = useMemo(() => {
    const activeFolderPool = folders.filter((f) =>
      isDeletedMode ? Boolean(f.isDeleted) : !f.isDeleted
    );
    if (isSearchActive) {
      const q = searchQuery.toLowerCase();
      return activeFolderPool.filter((f) => f.name.toLowerCase().includes(q));
    }
    return activeFolderPool.filter((f) => f.parentId === currentFolderId);
  }, [folders, currentFolderId, isSearchActive, searchQuery, isDeletedMode]);

  // Files of the active folder
  const currentFiles = useMemo(() => {
    if (
      isSearchActive ||
      selectedCabinet !== "All" ||
      selectedFileType !== "All" ||
      selectedClearance !== "All" ||
      fromDate ||
      toDate
    ) {
      return filteredDocuments;
    }
    return filteredDocuments.filter((d) => (d.folderId ?? null) === currentFolderId);
  }, [
    filteredDocuments,
    currentFolderId,
    isSearchActive,
    selectedCabinet,
    selectedFileType,
    selectedClearance,
    fromDate,
    toDate,
  ]);

  // Item Count in a folder
  const getFolderItemCount = useCallback(
    (folderId: string) => {
      const childF = folders.filter(
        (f) => f.parentId === folderId && (isDeletedMode ? Boolean(f.isDeleted) : !f.isDeleted)
      ).length;
      const childDocs = documents.filter(
        (d) => d.folderId === folderId && (isDeletedMode ? Boolean(d.isDeleted) : !d.isDeleted)
      ).length;
      return childF + childDocs;
    },
    [folders, documents, isDeletedMode]
  );

  // Folder Actions
  const handleCreateFolder = useCallback(
    (name: string, color: string) => {
      const newFolder: ArchiveFolder = {
        id: `folder-${Date.now()}`,
        name,
        parentId: currentFolderId,
        color,
        iconBg: alpha(color, 0.12),
        createdAt: dayjs().format("YYYY-MM-DD"),
      };
      setFolders((prev) => [...prev, newFolder]);
      setSnackbarMessage(`Created folder "${name}"`);
    },
    [currentFolderId]
  );

  const handleRenameFolder = useCallback((folder: ArchiveFolder, newName: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folder.id ? { ...f, name: newName } : f)));
    setSnackbarMessage(`Renamed folder to "${newName}"`);
  }, []);

  const handleDeleteFolder = useCallback(
    (folder: ArchiveFolder) => {
      const timestamp = dayjs().format("YYYY-MM-DD");
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folder.id ? { ...f, isDeleted: true, deletedAt: timestamp, deletedBy: "User" } : f
        )
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.folderId === folder.id
            ? {
                ...doc,
                isDeleted: true,
                deletedAt: timestamp,
                deletedBy: "User",
                deletionReason: `Folder "${folder.name}" soft-deleted`,
              }
            : doc
        )
      );
      if (currentFolderId === folder.id) {
        navigateToFolder(folder.parentId, false);
      }
      setSnackbarMessage(`Soft-deleted folder "${folder.name}" to Retention Vault`);
    },
    [currentFolderId, navigateToFolder]
  );

  const handleRestoreFolder = useCallback((folder: ArchiveFolder) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folder.id
          ? { ...f, isDeleted: false, deletedAt: undefined, deletedBy: undefined }
          : f
      )
    );
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.folderId === folder.id
          ? {
              ...doc,
              isDeleted: false,
              deletedAt: undefined,
              deletedBy: undefined,
              deletionReason: undefined,
            }
          : doc
      )
    );
    setSnackbarMessage(`Restored folder "${folder.name}" to active archive`);
  }, []);

  const handleRestoreDocument = useCallback((doc: ArchiveDocument) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              isDeleted: false,
              deletedAt: undefined,
              deletedBy: undefined,
              deletionReason: undefined,
            }
          : d
      )
    );
    setSnackbarMessage(`Restored "${doc.title}" to active archive`);
  }, []);

  const handleDeleteDocument = useCallback((doc: ArchiveDocument) => {
    const timestamp = dayjs().format("YYYY-MM-DD");
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              isDeleted: true,
              deletedAt: timestamp,
              deletedBy: "User",
              deletionReason: "Manual soft-deletion by archivist",
            }
          : d
      )
    );
    setSelectedDoc((prev) => (prev?.id === doc.id ? null : prev));
    setSnackbarMessage(`Soft-deleted "${doc.title}" to Retention Vault`);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCabinet("All");
    setSelectedFileType("All");
    setSelectedClearance("All");
    setFromDate(null);
    setToDate(null);
  }, []);

  const isFilterActive = useMemo(
    () =>
      Boolean(
        isSearchActive ||
          selectedCabinet !== "All" ||
          selectedFileType !== "All" ||
          selectedClearance !== "All" ||
          fromDate ||
          toDate
      ),
    [isSearchActive, selectedCabinet, selectedFileType, selectedClearance, fromDate, toDate]
  );

  // Background Archiving Ingestion Callback
  const handleArchivingComplete = useCallback(
    (newDocs: ArchiveDocument[]) => {
      const docsWithFolder = newDocs.map((d) => ({
        ...d,
        folderId: currentFolderId || undefined,
      }));
      setDocuments((prev) => [...docsWithFolder, ...prev]);
      if (docsWithFolder.length > 0) {
        setSelectedDoc(docsWithFolder[0]);
      }
      // replace the optimistic entries with real data from the backend
      void refreshDocuments();
    },
    [currentFolderId, refreshDocuments]
  );

  return {
    documents,
    setDocuments,
    isLoadingDocuments,
    documentsError,
    refreshDocuments,
    folders,
    setFolders,
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
    deletedDocCount,
    deletedFolderCount,
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
  };
}
