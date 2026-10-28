"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { BookmarkItem, BookmarkMetrics, ClearanceLevel } from "@/components/bookmarks/types";
import { SEED_BOOKMARKS, INITIAL_COLLECTIONS } from "@/components/bookmarks/seedData";

export interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  collections: string[];
  metrics: BookmarkMetrics;
  isHydrated: boolean;
  isBookmarked: (id: string | number) => boolean;
  toggleBookmark: (item: any) => boolean; // returns true if added, false if removed
  addBookmark: (item: BookmarkItem) => void;
  removeBookmark: (id: string | number) => void;
  togglePin: (id: string | number) => boolean;
  updateNote: (id: string | number, notes: string, collection?: string) => void;
  createCollection: (name: string) => boolean;
  deleteCollection: (name: string) => void;
  renameCollection: (oldName: string, newName: string) => void;
  batchMoveToCollection: (ids: (string | number)[], targetCollection: string) => void;
  batchRemoveBookmarks: (ids: (string | number)[]) => void;
  batchTogglePin: (ids: (string | number)[], pinState: boolean) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY_BOOKMARKS = "ids_saved_bookmarks_v1";
const STORAGE_KEY_COLLECTIONS = "ids_saved_collections_v1";

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(SEED_BOOKMARKS);
  const [collections, setCollections] = useState<string[]>(INITIAL_COLLECTIONS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on client mount
  useEffect(() => {
    try {
      const storedBms = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (storedBms) {
        const parsed = JSON.parse(storedBms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookmarks(parsed);
        }
      }
      const storedCols = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      if (storedCols) {
        const parsedCols = JSON.parse(storedCols);
        if (Array.isArray(parsedCols) && parsedCols.length > 0) {
          setCollections(parsedCols);
        }
      }
    } catch (err) {
      console.warn("Failed to read bookmarks from localStorage, using seed data:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist bookmarks whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    } catch (err) {
      console.error("Failed to persist bookmarks to localStorage:", err);
    }
  }, [bookmarks, isHydrated]);

  // Persist collections
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections));
    } catch (err) {
      console.error("Failed to persist collections to localStorage:", err);
    }
  }, [collections, isHydrated]);

  // Metrics computation
  const metrics: BookmarkMetrics = useMemo(() => {
    return {
      totalSaved: bookmarks.length,
      collectionsCount: collections.filter((c) => c !== "All").length,
      pinnedCount: bookmarks.filter((b) => Boolean(b.isPinned)).length,
      physicalOnShelfCount: bookmarks.filter((b) => Boolean(b.shelfLocation?.barcode)).length,
      withNotesCount: bookmarks.filter((b) => Boolean(b.personalNotes?.trim())).length,
    };
  }, [bookmarks, collections]);

  const isBookmarked = useCallback(
    (id: string | number) => {
      const strId = String(id);
      return bookmarks.some((b) => b.id === strId || b.orderNo === strId);
    },
    [bookmarks]
  );

  const addBookmark = useCallback((newItem: BookmarkItem) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === newItem.id || b.orderNo === newItem.orderNo)) {
        return prev;
      }
      return [newItem, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((id: string | number) => {
    const strId = String(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== strId && b.orderNo !== strId));
  }, []);

  const toggleBookmark = useCallback(
    (item: any): boolean => {
      const strId = String(item.id || item.orderNo);
      const exists = bookmarks.some((b) => b.id === strId || b.orderNo === item.orderNo);

      if (exists) {
        removeBookmark(strId);
        return false;
      } else {
        // Adapt generic item into BookmarkItem
        const formatted: BookmarkItem = {
          id: strId,
          title: item.title || "Untitled Directive",
          orderNo: item.orderNo || `DOC-${item.id}`,
          seriesYear: item.seriesYear || new Date().getFullYear(),
          category: item.category || "General Directives",
          clearance: (item.clearance as ClearanceLevel) || "Public",
          dateBookmarked: new Date().toISOString().split("T")[0],
          collection: item.collection || "General Operations",
          tags: Array.isArray(item.tags)
            ? item.tags.map((t: any) => (typeof t === "string" ? t : t.name || ""))
            : [],
          shelfLocation: item.shelfLocation?.cabinet
            ? item.shelfLocation
            : {
                cabinet: item.cabinet || "Cabinet A",
                shelf: item.shelf || "Shelf 1",
                binder: item.folder || "Binder 01",
                barcode: item.shelfLocation || `LOC-${item.id || "GEN"}`,
              },
          fileSize: item.fileSize || "2.1 MB",
          pageCount: item.pageCount || 1,
          isPinned: false,
          officialDate: item.ingestedDate || item.officialDate,
          googleSyncStatus: "local_only",
          extractedSummary: item.summary || item.snippet || item.extractedSummary || "",
        };

        addBookmark(formatted);
        return true;
      }
    },
    [bookmarks, addBookmark, removeBookmark]
  );

  const togglePin = useCallback((id: string | number): boolean => {
    const strId = String(id);
    let nextState = false;
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === strId || b.orderNo === strId) {
          nextState = !b.isPinned;
          return { ...b, isPinned: nextState };
        }
        return b;
      })
    );
    return nextState;
  }, []);

  const updateNote = useCallback((id: string | number, notes: string, collection?: string) => {
    const strId = String(id);
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === strId || b.orderNo === strId) {
          return {
            ...b,
            personalNotes: notes,
            ...(collection ? { collection } : {}),
          };
        }
        return b;
      })
    );
  }, []);

  const createCollection = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    let created = false;
    setCollections((prev) => {
      if (prev.includes(trimmed)) return prev;
      created = true;
      return [...prev, trimmed];
    });
    return created;
  }, []);

  const deleteCollection = useCallback((name: string) => {
    if (name === "All" || name === "General Operations") return;
    setCollections((prev) => prev.filter((c) => c !== name));
    // Move any bookmarks in this collection back to "General Operations"
    setBookmarks((prev) =>
      prev.map((b) => (b.collection === name ? { ...b, collection: "General Operations" } : b))
    );
  }, []);

  const renameCollection = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === "All" || trimmed === oldName) return;
    setCollections((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setBookmarks((prev) =>
      prev.map((b) => (b.collection === oldName ? { ...b, collection: trimmed } : b))
    );
  }, []);

  const batchMoveToCollection = useCallback((ids: (string | number)[], targetCollection: string) => {
    const idSet = new Set(ids.map((id) => String(id)));
    setBookmarks((prev) =>
      prev.map((b) => (idSet.has(b.id) || idSet.has(b.orderNo) ? { ...b, collection: targetCollection } : b))
    );
  }, []);

  const batchRemoveBookmarks = useCallback((ids: (string | number)[]) => {
    const idSet = new Set(ids.map((id) => String(id)));
    setBookmarks((prev) => prev.filter((b) => !idSet.has(b.id) && !idSet.has(b.orderNo)));
  }, []);

  const batchTogglePin = useCallback((ids: (string | number)[], pinState: boolean) => {
    const idSet = new Set(ids.map((id) => String(id)));
    setBookmarks((prev) =>
      prev.map((b) => (idSet.has(b.id) || idSet.has(b.orderNo) ? { ...b, isPinned: pinState } : b))
    );
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      collections,
      metrics,
      isHydrated,
      isBookmarked,
      toggleBookmark,
      addBookmark,
      removeBookmark,
      togglePin,
      updateNote,
      createCollection,
      deleteCollection,
      renameCollection,
      batchMoveToCollection,
      batchRemoveBookmarks,
      batchTogglePin,
    }),
    [
      bookmarks,
      collections,
      metrics,
      isHydrated,
      isBookmarked,
      toggleBookmark,
      addBookmark,
      removeBookmark,
      togglePin,
      updateNote,
      createCollection,
      deleteCollection,
      renameCollection,
      batchMoveToCollection,
      batchRemoveBookmarks,
      batchTogglePin,
    ]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
