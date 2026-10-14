"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

import { ArchiveDocument, ArchiveFolder } from "./types";
import CabinetMapView from "./CabinetMapView";
import FolderGrid from "./FolderGrid";
import DocumentCard from "./DocumentCard";
import DocumentListView from "./DocumentListView";
import DocumentsEmptyFolderState from "./DocumentsEmptyFolderState";

export interface DocumentsExplorerViewProps {
  viewMode: "grid" | "list" | "cabinet";
  filteredDocuments: ArchiveDocument[];
  currentSubfolders: ArchiveFolder[];
  currentFiles: ArchiveDocument[];
  selectedDoc: ArchiveDocument | null;
  isDeletedMode: boolean;
  onOpenFolder: (folderId: string) => void;
  onFolderContextMenu: (event: React.MouseEvent<HTMLElement>, folder: ArchiveFolder) => void;
  getFolderItemCount: (folderId: string) => number;
  onNewSubfolder: () => void;
  onSelectDoc: (doc: ArchiveDocument) => void;
  onOpenDossier: (doc: ArchiveDocument) => void;
  onDocContextMenu: (event: React.MouseEvent<HTMLElement>, doc: ArchiveDocument) => void;
  onAskMayumi: (doc: ArchiveDocument) => void;
  onOpenUpload: () => void;
}

export default function DocumentsExplorerView({
  viewMode,
  filteredDocuments,
  currentSubfolders,
  currentFiles,
  selectedDoc,
  isDeletedMode,
  onOpenFolder,
  onFolderContextMenu,
  getFolderItemCount,
  onNewSubfolder,
  onSelectDoc,
  onOpenDossier,
  onDocContextMenu,
  onAskMayumi,
  onOpenUpload,
}: DocumentsExplorerViewProps) {
  if (viewMode === "cabinet") {
    return (
      <CabinetMapView
        documents={filteredDocuments}
        selectedDocId={selectedDoc?.id}
        onSelectDoc={(doc) => {
          onSelectDoc(doc);
          onOpenDossier(doc);
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        pr: 0.75,
        pb: 4,
      }}
    >
      {/* FOLDERS SECTION */}
      <FolderGrid
        folders={currentSubfolders}
        onOpenFolder={onOpenFolder}
        onFolderContextMenu={onFolderContextMenu}
        getFolderItemCount={getFolderItemCount}
        onNewSubfolder={onNewSubfolder}
        isDeletedMode={isDeletedMode}
      />

      {/* FILES SECTION */}
      {currentFiles.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <InsertDriveFileRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              Files ({currentFiles.length})
            </Typography>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Tip: Double-click any document to open dossier inspector
            </Typography>
          </Box>

          {viewMode === "grid" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(auto-fill, minmax(280px, 1fr))",
                },
                gap: 2,
              }}
            >
              {currentFiles.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isSelected={selectedDoc?.id === doc.id}
                  onSelect={() => onSelectDoc(doc)}
                  onDoubleClick={() => {
                    onSelectDoc(doc);
                    onOpenDossier(doc);
                  }}
                  onContextMenu={onDocContextMenu}
                />
              ))}
            </Box>
          ) : (
            <DocumentListView
              documents={currentFiles}
              selectedDocId={selectedDoc?.id}
              onSelect={onSelectDoc}
              onDoubleClick={(doc) => {
                onSelectDoc(doc);
                onOpenDossier(doc);
              }}
              onAskAi={onAskMayumi}
              onContextMenu={onDocContextMenu}
            />
          )}
        </Box>
      )}

      {/* EMPTY FOLDER STATE */}
      {currentSubfolders.length === 0 && currentFiles.length === 0 && (
        <DocumentsEmptyFolderState
          isDeletedMode={isDeletedMode}
          onOpenCreateFolder={onNewSubfolder}
          onOpenUpload={onOpenUpload}
        />
      )}
    </Box>
  );
}
