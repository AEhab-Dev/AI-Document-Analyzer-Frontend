import { create } from "zustand";
import { DocumentListItem, DocumentDetail, User } from "@/lib/types";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  documents: DocumentListItem[];
  setDocuments: (docs: DocumentListItem[]) => void;
  addDocument: (doc: DocumentListItem) => void;

  activeDocument: DocumentDetail | null;
  setActiveDocument: (doc: DocumentDetail | null) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  documents: [],
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents].slice(0, 10) })),

  activeDocument: null,
  setActiveDocument: (doc) => set({ activeDocument: doc }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));