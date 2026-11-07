"use client";
import { useState, useEffect, useMemo } from "react";
import { storage } from "@/lib/storage";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { scholarships } from "@/data/scholarships.seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GoalsPage() {
  const profile = useProfileStore((s) => s.profile);
  const applications = useApplicationStore((s) => s.applications);
  const [target, setTarget] = useState<number>(storage.get<number>("goalTarget") ?? 500000);
  const [saved, setSaved] = useState(target);

  useEffect(() => { setSaved(storage.get<number>("goalTarget") ?? 500000); setTarget(storage.get<number>("goalTarget") ?? 500000); }, []);

  function save() {
    storage.set("goalTarget", target);
    setSaved(target);
  }

  const appliedTotal = applications
    .filter((a) => a.status !== "not_selected")
    .reduce((sum, a) => {
      const sch = scholarships.find((s) => s.id === a.scholarshipId);
      return sum + (sch?.amount ?? 0);
    }, 0);
  const wonTotal = applications
    .filter((a) => a.status === "won")
    .reduce((sum, a) => {
      const sch = scholarships.find((s) => s.id === a.scholarshipId);
      return sum + (sch?.amount ?? 0);
    }, 0);
  // expected coverage: won + 40% of submitted/awaiting + 15% of preparing
  const expected = wonTotal
    + applications.filter((a) => a.status === "submitted" || a.status === "awaiting").reduce((s, a) => s + (scholarships.find((x) => x.id === a.scholarshipId)?.amount ?? 0) * 0.4, 0)
    + applications.filter((a) => a.status === "preparing" || a.status === "saved").reduce((s, a) => s + (scholarships.find((x) => x.id === a.scholarshipId)?.amount ?? 0) * 0.15, 0);

  const progress = Math.min(100, (expected / (saved || 1)) * 100);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-bold">Funding goal tracker</h1>
      <p className="text-muted-foreground">Track how your applications cover your tuition needs.</p>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Tuition / funding you need</label>
          <div className="flex gap-2 mt-2">
            <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            <Button onClick={save}>Save</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-muted p-3">
            <div className="text-2xl font-bold">{saved.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">You need (X)</div>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <div className="text-2xl font-bold">{appliedTotal.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Applied for (Y)</div>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <div className="text-2xl font-bold text-primary">{Math.round(expected).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Expected coverage (Z)</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Expected coverage</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You need {saved.toLocaleString()} for tuition. You've applied for {appliedTotal.toLocaleString()}. Expected coverage is {Math.round(expected).toLocaleString()} ({progress.toFixed(0)}%).
        </p>
      </div>
    </div>
  );
}