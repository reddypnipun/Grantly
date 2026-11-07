"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Bookmark, GitCompare, X, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useProfileStore, createEmptyProfile } from "@/stores/profileStore";
import { useApplicationStore, createApplication } from "@/stores/applicationStore";
import { scholarships } from "@/data/scholarships.seed";
import { matchAll } from "@/lib/matching";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// minimal Input
// (defined below)

const LEVELS = ["high_school", "undergrad", "postgrad", "phd"];
const FIELDS = ["computer science", "engineering", "medicine", "business", "arts", "law", "mathematics", "biology", "humanities", "data", "environment", "research"];
const COUNTRIES = ["IN", "US", "UK", "GLOBAL"];

function parseNL(q: string) {
  const filters: Record<string, unknown> = {};
  const lower = q.toLowerCase();
  // field
  for (const f of FIELDS) {
    if (lower.includes(f)) filters.field = f;
  }
  if (lower.includes("women")) filters.demographic = "women";
  if (lower.includes("low effort") || lower.includes("under 2 hours") || lower.includes("quick")) filters.effortMax = 2;
  const effortMatch = lower.match(/under (\d+)\s*hour/);
  if (effortMatch) filters.effortMax = Number(effortMatch[1]);
  const amountMatch = lower.match(/under \$?(\d+)/);
  if (amountMatch) filters.amountMax = Number(amountMatch[1]);
  if (lower.includes("closing soon") || lower.includes("this month")) filters.deadlineDays = 30;
  if (lower.includes("need")) filters.type = "need";
  if (lower.includes("merit")) filters.type = "merit";
  if (lower.includes("india")) filters.location = "IN";
  if (lower.includes("us") || lower.includes("usa")) filters.location = "US";
  if (lower.includes("uk")) filters.location = "UK";
  return filters;
}

export default function DiscoverPage() {
  const profile = useProfileStore((s) => s.profile);
  const applications = useApplicationStore((s) => s.applications);
  const addApp = useApplicationStore((s) => s.addApplication);
  const removeApp = useApplicationStore((s) => s.removeApplication);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("guest") === "1" && !useProfileStore.getState().profile) {
      const p = createEmptyProfile({ name: "Guest Student", educationLevel: "undergrad", field: "computer science", country: "IN", gpa: 3.4, gpaScale: "4", needLevel: "medium", background: [], interests: [], goals: "" });
      useProfileStore.getState().setProfile(p);
    }
  }, [searchParams]);

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [amountMax, setAmountMax] = useState<number | "">("");
  const [deadlineDays, setDeadlineDays] = useState<number | "">("");
  const [level, setLevel] = useState("");
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [effortMax, setEffortMax] = useState<number | "">("");
  const [sort, setSort] = useState("match");
  const [statusFilter, setStatusFilter] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [nlFilters, setNlFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const matches = useMemo(() => (profile ? matchAll(profile, scholarships) : scholarships.map((s) => ({ ...s, match: { scholarshipId: s.id, score: 50, tier: "medium" as const, whyMatch: [], needsAttention: [], notEligible: [], breakdown: [] } }))), [profile]);

  // apply NL filters on query change
  useEffect(() => {
    if (query.trim()) setNlFilters(parseNL(query));
    else setNlFilters({});
  }, [query]);

  const filtered = useMemo(() => {
    let list = [...matches];
    const am = amountMax !== "" ? Number(amountMax) : (nlFilters.amountMax as number | undefined);
    const dd = deadlineDays !== "" ? Number(deadlineDays) : (nlFilters.deadlineDays as number | undefined);
    const ef = effortMax !== "" ? Number(effortMax) : (nlFilters.effortMax as number | undefined);
    const lvl = level || (nlFilters as { level?: string }).level;
    const fld = field || (nlFilters.field as string | undefined);
    const loc = location || (nlFilters.location as string | undefined);
    const typ = type || (nlFilters.type as string | undefined);

    list = list.filter((m) => {
      if (am && (m.amount == null || m.amount > am)) return false;
      if (dd) {
        const ref = m.deadline ?? m.lastKnownDeadline;
        if (!ref) return false; // exclude null deadlines when filter active? spec: exclude only null when filter active for amount; for deadline same treatment. Let me exclude null deadlines when deadline filter active.
        const days = (new Date(ref).getTime() - Date.now()) / 86400000;
        if (days > dd) return false;
      }
      if (lvl && !m.level.includes(lvl as never)) return false;
      if (fld && !m.fields.includes(fld) && !m.fields.includes("any")) return false;
      if (loc && m.country !== loc && m.country !== "GLOBAL") return false;
      if (typ === "need" && !m.needBased) return false;
      if (typ === "merit" && !m.meritBased) return false;
      if (ef && m.effort.hours > ef) return false;
      if (nlFilters.demographic === "women" && !m.demographics.includes("women")) return false;
      const isOpen = m.status === "OPEN" || m.status === "OPENING_SOON" || m.status === "ROLLING";
      if (!showClosed && !isOpen) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      return true;
    });

    if (sort === "closing") list.sort((a, b) => new Date(a.deadline ?? a.lastKnownDeadline ?? 0).getTime() - new Date(b.deadline ?? b.lastKnownDeadline ?? 0).getTime());
    else if (sort === "amount") list.sort((a, b) => (b.amount ?? -1) - (a.amount ?? -1));
    else if (sort === "effort") list.sort((a, b) => a.effort.hours - b.effort.hours);
    else list.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));

    return list;
  }, [matches, amountMax, deadlineDays, level, field, location, type, effortMax, sort, nlFilters]);

  function toggleSave(id: string) {
    const existing = applications.find((a) => a.scholarshipId === id);
    if (existing) {
      if (existing.status === "saved") removeApp(existing.id);
    } else {
      const sch = scholarships.find((s) => s.id === id)!;
      addApp(createApplication(id, sch.requirements.map((r) => ({ id: crypto.randomUUID(), label: r, done: false }))));
    }
  }

  function toggleCompare(id: string) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  }

  const compared = scholarships.filter((s) => compare.includes(s.id));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='Search: "engineering scholarships for women under 2 hours"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="rounded-full">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
          <select className="rounded-full border border-border bg-card px-4 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="match">Best match</option>
            <option value="closing">Closing soon</option>
            <option value="amount">Highest amount</option>
            <option value="effort">Lowest effort</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={amountMax} onChange={(e) => setAmountMax(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Any amount</option>
            <option value="1000">Under 1000</option>
            <option value="5000">Under 5000</option>
            <option value="10000">Under 10000</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Any deadline</option>
            <option value="30">Within 30 days</option>
            <option value="60">Within 60 days</option>
            <option value="90">Within 90 days</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Any level</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l.replace("_", " ")}</option>)}
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">Any field</option>
            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Any location</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Need or merit</option>
            <option value="need">Need-based</option>
            <option value="merit">Merit-based</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={effortMax} onChange={(e) => setEffortMax(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Any effort</option>
            <option value="2">Under 2 hours</option>
            <option value="5">Under 5 hours</option>
            <option value="10">Under 10 hours</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Any status</option>
            <option value="OPEN">Open</option>
            <option value="OPENING_SOON">Opening soon</option>
            <option value="ROLLING">Rolling</option>
            <option value="CLOSED_REOPENS">Closed (reopens)</option>
            <option value="CLOSED_DISCONTINUED">Discontinued</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Show closed
          </label>
        </div>
      )}

      <div className="text-sm text-muted-foreground">{filtered.length} results • {scholarships.filter((s) => s.status === "OPEN").length} open, {scholarships.filter((s) => s.status === "CLOSED_REOPENS" || s.status === "CLOSED_DISCONTINUED").length} closed</div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              <div className="h-8 bg-muted rounded w-1/3 mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No scholarships match your filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setAmountMax(""); setDeadlineDays(""); setLevel(""); setField(""); setLocation(""); setType(""); setEffortMax(""); setQuery(""); }}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const saved = applications.some((a) => a.scholarshipId === m.id);
            const comparing = compare.includes(m.id);
            return (
              <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/scholarships/${m.id}`} className="font-semibold hover:text-primary">{m.title}</Link>
                    <div className="text-sm text-muted-foreground">{m.provider}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{m.match?.score ?? "—"}%</div>
                    <div className="text-xs text-muted-foreground">match</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-1">{m.amount != null ? `${m.amount.toLocaleString()} ${m.currency}` : "Amount unconfirmed"}</span>
                  <span className="rounded-full bg-muted px-2 py-1">{m.effort.hours}h effort</span>
                  <span className="rounded-full bg-muted px-2 py-1">{m.country}</span>
                  <span className={`rounded-full px-2 py-1 ${m.status === "OPEN" ? "bg-success/10 text-success" : m.status === "ROLLING" ? "bg-accent/10 text-accent" : m.status === "OPENING_SOON" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>{(m.status ?? "OPEN").replace(/_/g, " ")}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Button size="sm" variant={saved ? "secondary" : "default"} onClick={() => toggleSave(m.id)} className="flex-1">
                    <Bookmark className="mr-1 h-4 w-4" /> {saved ? "Saved" : "Save"}
                  </Button>
                  <Button size="sm" variant={comparing ? "secondary" : "outline"} onClick={() => toggleCompare(m.id)} aria-label="Compare">
                    <GitCompare className="h-4 w-4" />
                  </Button>
                  <Link href={`/scholarships/${m.id}`}><Button size="sm" variant="ghost">View</Button></Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {compare.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Compare ({compare.length}/3)</h3>
            <button onClick={() => setCompare([])} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Field</th>
                  {compared.map((s) => <th key={s.id} className="text-left p-2">{s.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {([
                  ["Amount", (s: (typeof compared)[0]) => `${s.amount} ${s.currency}`],
                  ["Country", (s: (typeof compared)[0]) => s.country],
                  ["Level", (s: (typeof compared)[0]) => s.level.join(", ")],
                  ["Min GPA", (s: (typeof compared)[0]) => (s.minGpa ?? "None") as React.ReactNode],
                  ["Effort (hrs)", (s: (typeof compared)[0]) => s.effort.hours],
                  ["Essays", (s: (typeof compared)[0]) => s.effort.essays],
                  ["Deadline", (s: (typeof compared)[0]) => s.deadline],
                ] as [string, (s: (typeof compared)[0]) => React.ReactNode][]).map(([label, fn]) => (
                  <tr key={label} className="border-b border-border">
                    <td className="p-2 font-medium">{label}</td>
                    {compared.map((s) => <td key={s.id} className="p-2">{fn(s)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}