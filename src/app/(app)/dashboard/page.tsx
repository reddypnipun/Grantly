"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Calendar, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { scholarships } from "@/data/scholarships.seed";
import { matchAll } from "@/lib/matching";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const profile = useProfileStore((s) => s.profile);
  const applications = useApplicationStore((s) => s.applications);
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  useEffect(() => setMounted(true), []);
  useEffect(() => setMounted(true), []);

  const matches = useMemo(() => (profile ? matchAll(profile, scholarships) : []), [profile]);
  const qualified = matches.filter((m) => m.match.score >= 50 && m.status !== "CLOSED_DISCONTINUED");
  const totalFunding = qualified.reduce((sum, m) => sum + (m.amount ?? 0), 0);

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const closingThisWeek = matches.filter((m) => {
    if (m.status === "CLOSED_DISCONTINUED" || m.status === "CLOSED_REOPENS") return false;
    const ref = m.deadline ?? m.lastKnownDeadline;
    if (!ref) return false;
    const d = new Date(ref);
    return d >= now && d <= weekEnd && m.match.score >= 50;
  });

  const upcomingDeadlines = matches
    .filter((m) => {
      const ref = m.deadline ?? m.lastKnownDeadline;
      return !!ref && new Date(ref) >= now;
    })
    .sort((a, b) => new Date((a.deadline ?? a.lastKnownDeadline)!).getTime() - new Date((b.deadline ?? b.lastKnownDeadline)!).getTime())
    .slice(0, 5);

  // Next best action
  let nba: { title: string; desc: string; href: string } = {
    title: "Find your matches",
    desc: "Complete onboarding to see personalized scholarships.",
    href: "/onboarding",
  };
  if (profile) {
    const inProgress = applications.find((a) => a.status === "preparing" || a.status === "saved");
    if (inProgress) {
      const sch = scholarships.find((s) => s.id === inProgress.scholarshipId);
      nba = {
        title: `Continue ${sch?.title ?? "application"}`,
        desc: `${inProgress.checklist.filter((c) => !c.done).length} tasks remaining`,
        href: "/tracker",
      };
    } else if (matches.length > 0) {
      nba = {
        title: `Start ${matches[0].title}`,
        desc: `Your best match at ${matches[0].match.score}% — ${matches[0].amount != null ? matches[0].amount.toLocaleString() : "unconfirmed amount"} ${matches[0].currency}`,
        href: `/scholarships/${matches[0].id}`,
      };
    }
  }

  const stats = {
    saved: applications.filter((a) => a.status === "saved").length,
    preparing: applications.filter((a) => a.status === "preparing").length,
    submitted: applications.filter((a) => a.status === "submitted" || a.status === "awaiting").length,
    won: applications.filter((a) => a.status === "won").length,
  };

  if (!mounted) return <div className="p-8">Loading…</div>;

  if (!profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-3xl font-bold">Welcome to Grantly</h1>
        <p className="mt-3 text-muted-foreground">Let's find scholarships made for you.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/onboarding"><Button>Start onboarding</Button></Link>
          <Link href="/onboarding?sample=1"><Button variant="outline">Try sample student</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {showWelcome && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-primary">Welcome to your seamless digital journey for discovering and managing educational financial assistance.</div>
            <p className="text-sm text-muted-foreground mt-1">Grantly turns a scattered, confusing scholarship hunt into one personalized feed — with plain-language eligibility, deadlines, checklists, and your next best action.</p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-muted-foreground text-sm">Dismiss</button>
        </div>
      )}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold">Hi {profile.name} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your scholarship snapshot.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Saved", value: stats.saved, color: "text-foreground" },
          { label: "In progress", value: stats.preparing, color: "text-warning" },
          { label: "Submitted", value: stats.submitted, color: "text-accent" },
          { label: "Won", value: stats.won, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Funding + closing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Trophy className="h-4 w-4" /> Total potential funding you qualify for</div>
          <div className="mt-2 font-serif text-4xl font-bold text-primary">{totalFunding.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Across {qualified.length} matching scholarships{qualified.filter((m) => m.amount == null).length ? ` (plus ${qualified.filter((m) => m.amount == null).length} with unconfirmed amounts)` : ""}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Calendar className="h-4 w-4" /> Closing this week</div>
          <div className="mt-2 font-serif text-4xl font-bold text-warning">{closingThisWeek.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Scholarships with deadlines in 7 days</div>
        </div>
      </div>

      {/* Next best action */}
      <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary font-semibold"><Target className="h-5 w-5" /> Next best action</div>
        <h2 className="font-serif text-2xl font-bold mt-2">{nba.title}</h2>
        <p className="text-muted-foreground mt-1">{nba.desc}</p>
        <Link href={nba.href} className="inline-block mt-4">
          <Button>Let's go <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>

      {/* Upcoming deadlines */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold mb-4">Upcoming deadlines</h2>
        <div className="space-y-3">
          {upcomingDeadlines.length === 0 && <p className="text-muted-foreground">No upcoming deadlines.</p>}
          {upcomingDeadlines.map((m) => (
            <Link key={m.id} href={`/scholarships/${m.id}`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-muted-foreground">{m.provider}</div>
              </div>
              <div className="text-sm font-semibold text-warning">{new Date(m.deadline ?? m.lastKnownDeadline!).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href="/what-if"><Button variant="outline"><Sparkles className="mr-2 h-4 w-4" /> What-if simulator</Button></Link>
        <Link href="/goals"><Button variant="outline"><Target className="mr-2 h-4 w-4" /> Funding goals</Button></Link>
      </div>
    </div>
  );
}