"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileStore, createEmptyProfile } from "@/stores/profileStore";
import { useVaultStore } from "@/stores/vaultStore";
import { scholarships } from "@/data/scholarships.seed";

const EDUCATION_LEVELS = [
  { v: "high_school", l: "High school" },
  { v: "undergrad", l: "Undergraduate" },
  { v: "postgrad", l: "Postgraduate" },
  { v: "phd", l: "PhD / Research" },
];

const NEED_LEVELS = [
  { v: "high", l: "High — I need significant support" },
  { v: "medium", l: "Medium — some help would matter" },
  { v: "low", l: "Low — nice to have" },
  { v: "none", l: "None — merit only" },
];

const BACKGROUNDS = ["women", "first-gen", "low-income", "rural", "minority", "international", "disability", "veterans"];

const COUNTRIES = [
  { v: "IN", l: "India" },
  { v: "US", l: "United States" },
  { v: "UK", l: "United Kingdom" },
  { v: "GLOBAL", l: "Other / Global" },
];

const FIELDS = ["computer science", "engineering", "medicine", "business", "arts", "law", "mathematics", "biology", "humanities", "data", "environment", "research"];

function seedVaultDocs() {
  const store = useVaultStore.getState();
  if (store.documents.length === 0) {
    const docs = [
      { type: "transcript", label: "Academic transcript" },
      { type: "id", label: "Government ID" },
      { type: "recommendation", label: "Recommendation letters" },
      { type: "resume", label: "Resume / CV" },
      { type: "essay", label: "Personal statement" },
    ].map((d) => ({
      id: crypto.randomUUID(),
      type: d.type,
      label: d.label,
      status: "missing" as const,
      updatedAt: new Date().toISOString(),
    }));
    useVaultStore.setState({ documents: docs });
  }
}

function loadSampleProfile() {
  const profile = createEmptyProfile({
    name: "Aisha Sharma",
    educationLevel: "undergrad",
    field: "computer science",
    country: "IN",
    gpa: 3.6,
    gpaScale: "4",
    needLevel: "medium",
    background: ["women", "first-gen"],
    interests: ["AI", "scholarships", "coding"],
    goals: "Become a software engineer and fund my studies.",
  });
  useProfileStore.getState().setProfile(profile);
  seedVaultDocs();
}

// We'll import application store at top
import { useApplicationStore, createApplication } from "@/stores/applicationStore";

function finishSample() {
  loadSampleProfile();
  const apps = useApplicationStore.getState().applications;
  if (apps.length === 0) {
    const savedSch = scholarships[1];
    const inProgSch = scholarships[0];
    useApplicationStore.getState().addApplication(createApplication(savedSch.id, [{ id: crypto.randomUUID(), label: "Transcript", done: true }, { id: crypto.randomUUID(), label: "Essay", done: false }]));
    const a2 = createApplication(inProgSch.id, [{ id: crypto.randomUUID(), label: "Transcript", done: true }, { id: crypto.randomUUID(), label: "Essay", done: true }]);
    // move to preparing
    useApplicationStore.getState().addApplication(a2);
    const created = useApplicationStore.getState().getByScholarship(inProgSch.id);
    if (created) useApplicationStore.getState().moveApplication(created.id, "preparing");
  }
}

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({
    name: "",
    educationLevel: "undergrad",
    field: "computer science",
    country: "IN",
    gpa: "",
    gpaScale: "4",
    needLevel: "medium",
    background: [] as string[],
    interests: [] as string[],
    goals: "",
  });

  useEffect(() => {
    if (params.get("sample") === "1") {
      finishSample();
      router.replace("/dashboard");
    }
  }, [params, router]);

  const steps = [
    {
      key: "name",
      title: "What should we call you?",
      render: () => (
        <input
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your name"
          value={String(data.name)}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      key: "educationLevel",
      title: "What's your education level?",
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          {EDUCATION_LEVELS.map((l) => (
            <button
              key={l.v}
              onClick={() => setData({ ...data, educationLevel: l.v })}
              className={`rounded-xl border p-4 text-left ${data.educationLevel === l.v ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              {l.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "field",
      title: "What are you studying?",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setData({ ...data, field: f })}
              className={`rounded-full border px-4 py-2 text-sm capitalize ${data.field === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
            >
              {f}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "country",
      title: "Where are you based?",
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.v}
              onClick={() => setData({ ...data, country: c.v })}
              className={`rounded-xl border p-4 text-left ${data.country === c.v ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              {c.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "gpa",
      title: "Your GPA or percentage (optional)",
      render: () => (
        <div className="space-y-3">
          <input
            type="number"
            step="0.1"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. 3.5 or 85"
            value={String(data.gpa)}
            onChange={(e) => setData({ ...data, gpa: e.target.value })}
          />
          <select
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            value={String(data.gpaScale)}
            onChange={(e) => setData({ ...data, gpaScale: e.target.value })}
          >
            <option value="4">Out of 4.0</option>
            <option value="percentage">Percentage</option>
            <option value="none">Skip</option>
          </select>
        </div>
      ),
    },
    {
      key: "needLevel",
      title: "How much financial support do you need?",
      render: () => (
        <div className="space-y-2">
          {NEED_LEVELS.map((l) => (
            <button
              key={l.v}
              onClick={() => setData({ ...data, needLevel: l.v })}
              className={`w-full rounded-xl border p-4 text-left ${data.needLevel === l.v ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              {l.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "background",
      title: "Any of these apply to you? (optional, used only for matching)",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => {
            const selected = (data.background as string[]).includes(b);
            return (
              <button
                key={b}
                onClick={() => {
                  const cur = data.background as string[];
                  setData({ ...data, background: selected ? cur.filter((x) => x !== b) : [...cur, b] });
                }}
                className={`rounded-full border px-4 py-2 text-sm capitalize ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                {b}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: "interests",
      title: "Your interests (comma separated)",
      render: () => (
        <input
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. AI, robotics, writing"
          value={(data.interests as string[]).join(", ")}
          onChange={(e) => setData({ ...data, interests: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
        />
      ),
    },
    {
      key: "goals",
      title: "What's your goal?",
      render: () => (
        <textarea
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="e.g. Become a software engineer and fund my studies"
          value={String(data.goals)}
          onChange={(e) => setData({ ...data, goals: e.target.value })}
        />
      ),
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }
  function skip() {
    next();
  }
  function finish() {
    const gpaRaw = data.gpa;
    const gpaNum = gpaRaw === "" ? undefined : Number(gpaRaw);
    const profile = createEmptyProfile({
      name: String(data.name) || "Student",
      educationLevel: data.educationLevel as never,
      field: String(data.field),
      country: String(data.country),
      gpa: isNaN(gpaNum as number) ? undefined : gpaNum,
      gpaScale: data.gpaScale as "4" | "percentage" | "none",
      needLevel: data.needLevel as never,
      background: data.background as string[],
      interests: data.interests as string[],
      goals: String(data.goals),
    });
    setProfile(profile);
    seedVaultDocs();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button onClick={back} disabled={step === 0} className="text-muted-foreground disabled:opacity-30">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</div>
          <button onClick={skip} className="text-muted-foreground flex items-center gap-1 text-sm">
            Skip <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <div className="h-2 rounded-full bg-muted mb-8 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6">{current.title}</h1>
            {current.render()}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8">
          <Button onClick={next} className="w-full rounded-full" size="lg">
            {step === steps.length - 1 ? "Finish" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 text-center">
          <Link href="/onboarding?sample=1" className="text-sm text-primary underline">
            Try with a sample student instead
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <OnboardingInner />
    </Suspense>
  );
}