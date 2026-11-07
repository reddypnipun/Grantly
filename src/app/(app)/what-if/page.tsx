"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scholarships } from "@/data/scholarships.seed";
import { useProfileStore } from "@/stores/profileStore";
import { matchAll } from "@/lib/matching";
import { createEmptyProfile } from "@/stores/profileStore";
import type { StudentProfile } from "@/types";

const FIELDS = ["computer science", "engineering", "medicine", "business", "arts", "law", "mathematics", "biology", "humanities", "data", "environment", "research"];
const COUNTRIES = ["IN", "US", "UK", "GLOBAL"];
const NEEDS = ["high", "medium", "low", "none"];

export default function WhatIfPage() {
  const profile = useProfileStore((s) => s.profile);
  const [gpa, setGpa] = useState(profile?.gpa ?? 3.0);
  const [gpaScale, setGpaScale] = useState<"4" | "percentage">(profile?.gpaScale === "percentage" ? "percentage" : "4");
  const [field, setField] = useState(profile?.field ?? "computer science");
  const [country, setCountry] = useState(profile?.country ?? "IN");
  const [needLevel, setNeedLevel] = useState(profile?.needLevel ?? "medium");
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "undergrad");

  const simProfile: StudentProfile = createEmptyProfile({
    ...profile,
    gpa: gpaScale === "percentage" ? gpa : gpa,
    gpaScale,
    field,
    country,
    needLevel: needLevel as never,
    educationLevel: educationLevel as never,
    background: profile?.background ?? [],
  });

  const matches = useMemo(() => matchAll(simProfile, scholarships), [simProfile]);
  const qualified = matches.filter((m) => m.match.score >= 50);
  const total = qualified.reduce((s, m) => s + (m.amount ?? 0), 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-bold">What-if simulator</h1>
      <p className="text-muted-foreground">Adjust your profile and watch matches update live.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium">GPA: {gpa}</label>
            <input type="range" min={0} max={gpaScale === "percentage" ? 100 : 4} step={gpaScale === "percentage" ? 1 : 0.1} value={gpa} onChange={(e) => setGpa(Number(e.target.value))} className="w-full mt-2" />
            <select className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={gpaScale} onChange={(e) => setGpaScale(e.target.value as "4" | "percentage")}>
              <option value="4">Out of 4.0</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Field</label>
            <select className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={field} onChange={(e) => setField(e.target.value)}>
              {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <select className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Need level</label>
            <select className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={needLevel} onChange={(e) => setNeedLevel(e.target.value as never)}>
              {NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Education level</label>
            <select className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value as never)}>
              <option value="high_school">High school</option>
              <option value="undergrad">Undergraduate</option>
              <option value="postgrad">Postgraduate</option>
              <option value="phd">PhD</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            key={total}
            initial={{ scale: 0.95, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-border bg-card p-6 text-center"
          >
            <div className="text-sm text-muted-foreground">Total fundable amount</div>
            <div className="font-serif text-5xl font-bold text-primary mt-2">{total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">{qualified.length} matching scholarships</div>
          </motion.div>

          <div className="rounded-2xl border border-border bg-card p-4 max-h-[400px] overflow-y-auto space-y-2">
            <AnimatePresence>
              {matches.slice(0, 12).map((m) => (
                <motion.div
                  key={m.id + m.match.score}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="text-sm font-medium truncate">{m.title}</div>
                  <div className="text-sm font-bold text-primary ml-2">{m.match.score}%</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}