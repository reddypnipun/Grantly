import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentProfile } from "@/types";
import { zustandStorage } from "@/lib/storage/zustand";
import { STORAGE_KEYS } from "@/lib/storage";

interface ProfileState {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
  updateProfile: (partial: Partial<StudentProfile>) => void;
  clearProfile: () => void;
  hasProfile: () => boolean;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (p) => set({ profile: { ...p, updatedAt: new Date().toISOString() } }),
      updateProfile: (partial) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...partial, updatedAt: new Date().toISOString() } } : s)),
      clearProfile: () => set({ profile: null }),
      hasProfile: () => get().profile !== null,
    }),
    { name: STORAGE_KEYS.profile, storage: createJSONStorage(() => zustandStorage), skipHydration: true }
  )
);

export function createEmptyProfile(partial: Partial<StudentProfile> = {}): StudentProfile {
  const now = new Date().toISOString();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return {
    id,
    name: partial.name ?? "Student",
    educationLevel: partial.educationLevel ?? "undergrad",
    field: partial.field ?? "",
    country: partial.country ?? "IN",
    gpa: partial.gpa,
    gpaScale: partial.gpaScale ?? "4",
    needLevel: partial.needLevel ?? "medium",
    background: partial.background ?? [],
    interests: partial.interests ?? [],
    goals: partial.goals ?? "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
