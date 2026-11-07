"use client";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const rows = [
  { pain: "Discovery is scattered and noisy", feature: "Discover Opportunities — one personalized, ranked feed with search, filters, sort, save, compare", impact: "Replaces dozens of scattered sites with a single tailored feed" },
  { pain: "Eligibility is confusing", feature: "Eligibility Matcher — \"Why you qualify\" (green) and \"What's missing\" (red) on every scholarship", impact: "Turns opaque criteria into plain-language, actionable guidance" },
  { pain: "Deadlines and requirements easy to miss", feature: "Unified calendar, reminders (7/3/1 days), per-scholarship checklists, .ics export", impact: "Nothing slips through the cracks" },
  { pain: "Applications are repetitive", feature: "Document Vault — reusable documents + essay workspace with outline generator and reuse suggestions", impact: "Write once, reuse everywhere" },
  { pain: "Nothing shows progress or next steps", feature: "Dashboard — total funding, closing this week, one \"Next best action\", progress stats", impact: "Replaces anxiety with a clear next step" },
];

export default function AboutPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-bold">Problem Statement Alignment</h1>
      <p className="text-muted-foreground">Grantly directly addresses every challenge in the brief: "Accessing educational financial assistance can be a complicated journey... The objective is to transform a complex experience into a seamless digital journey."</p>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border text-left">
              <th className="p-3">Brief pain point</th>
              <th className="p-3">Grantly feature</th>
              <th className="p-3">Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.pain} className="border-b border-border">
                <td className="p-3 font-medium">{r.pain}</td>
                <td className="p-3">{r.feature}</td>
                <td className="p-3 text-muted-foreground">{r.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold mb-3">How Grantly makes the journey seamless</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Discover Opportunities: personalized, ranked, filterable feed</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Eligibility Matcher: plain-language why you qualify / what's missing</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Manage Applications: Kanban + checklists + calendar + reminders</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Document Vault: reusable docs + essays + offline outline generator</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Dashboard: total funding, closing this week, next best action</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> Trust & Scam Prevention: verified source badges, scam-awareness tips</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> What-If Simulator + Funding Goal Tracker (innovation)</li>
        </ul>
      </div>
      <Link href="/dashboard" className="text-primary underline">Back to dashboard</Link>
    </div>
  );
}