import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { VaultDocument, Essay } from "@/types";
import { zustandStorage } from "@/lib/storage/zustand";
import { STORAGE_KEYS } from "@/lib/storage";

interface VaultState {
  documents: VaultDocument[];
  essays: Essay[];
  setDocStatus: (id: string, status: VaultDocument["status"]) => void;
  updateDocFile: (id: string, fileName: string, fileSize: number) => void;
  addEssay: (e: Essay) => void;
  updateEssay: (id: string, partial: Partial<Essay>) => void;
  deleteEssay: (id: string) => void;
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      documents: [],
      essays: [],
      setDocStatus: (id, status) =>
        set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d)) })),
      updateDocFile: (id, fileName, fileSize) =>
        set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, fileName, fileSize, status: "ready", updatedAt: new Date().toISOString() } : d)) })),
      addEssay: (e) => set((s) => ({ essays: [...s.essays, e] })),
      updateEssay: (id, partial) =>
        set((s) => ({ essays: s.essays.map((e) => (e.id === id ? { ...e, ...partial, wordCount: (partial.body ?? e.body).trim().split(/\s+/).filter(Boolean).length, updatedAt: new Date().toISOString() } : e)) })),
      deleteEssay: (id) => set((s) => ({ essays: s.essays.filter((e) => e.id !== id) })),
    }),
    { name: STORAGE_KEYS.vaultDocs, storage: createJSONStorage(() => zustandStorage), skipHydration: true, partialize: (s) => ({ documents: s.documents, essays: s.essays }) as unknown as VaultState }
  )
);
