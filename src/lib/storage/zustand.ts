const PREFIX = "grantly:";

export const zustandStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(PREFIX + name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PREFIX + name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PREFIX + name);
  },
};