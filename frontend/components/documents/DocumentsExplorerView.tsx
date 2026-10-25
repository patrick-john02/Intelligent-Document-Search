"use client";

import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";

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
  onOpenDossier?: (doc: ArchiveDocument) => void;
  onOpenPreview: (doc: ArchiveDocument) => void;
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
  onOpenPreview,
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
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

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {currentSubfolders.length === 0 && !isDeletedMode && (
                <Button
                  size="small"
                  onClick={onNewSubfolder}
                  startIcon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  New Subfolder
                </Button>
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Tip: Double-click any document to open preview
              </Typography>
            </Stack>
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
                    onOpenPreview(doc);
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
                onOpenPreview(doc);
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
