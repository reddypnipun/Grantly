"use client";
import { useEffect, useState } from "react";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { useVaultStore } from "@/stores/vaultStore";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      useProfileStore.persist.rehydrate(),
      useApplicationStore.persist.rehydrate(),
      useVaultStore.persist.rehydrate(),
    ]).then(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading Grantly…</div>
      </div>
    );
  }
  return <>{children}</>;
}