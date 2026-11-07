const PREFIX = "grantly:";

export interface Storage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageAdapter implements Storage {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }
  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PREFIX + key);
  }
  clear(): void {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  }
}

export const storage: Storage = new LocalStorageAdapter();

export const STORAGE_KEYS = {
  profile: "profile",
  applications: "applications",
  vaultDocs: "vaultDocs",
  essays: "essays",
  saved: "saved",
  theme: "theme",
  onboardingDone: "onboardingDone",
  goals: "goals",
} as const;
