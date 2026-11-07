import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Application, ApplicationStatus, ChecklistItem } from "@/types";
import { zustandStorage } from "@/lib/storage/zustand";
import { STORAGE_KEYS } from "@/lib/storage";

interface ApplicationState {
  applications: Application[];
  addApplication: (a: Application) => void;
  updateApplication: (id: string, partial: Partial<Application>) => void;
  moveApplication: (id: string, status: ApplicationStatus) => void;
  removeApplication: (id: string) => void;
  getByScholarship: (scholarshipId: string) => Application | undefined;
  toggleChecklist: (appId: string, itemId: string) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: [],
      addApplication: (a) => set((s) => (s.applications.some((x) => x.scholarshipId === a.scholarshipId) ? s : { applications: [...s.applications, a] })),
      updateApplication: (id, partial) =>
        set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, ...partial, updatedAt: new Date().toISOString() } : a)) })),
      moveApplication: (id, status) =>
        set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)) })),
      removeApplication: (id) => set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),
      getByScholarship: (sid) => get().applications.find((a) => a.scholarshipId === sid),
      toggleChecklist: (appId, itemId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? { ...a, checklist: a.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)), updatedAt: new Date().toISOString() }
              : a
          ),
        })),
    }),
    { name: STORAGE_KEYS.applications, storage: createJSONStorage(() => zustandStorage), skipHydration: true }
  )
);

export function createApplication(scholarshipId: string, checklist: ChecklistItem[]): Application {
  const now = new Date().toISOString();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return { id, scholarshipId, status: "saved", checklist, notes: "", createdAt: now, updatedAt: now };
}
