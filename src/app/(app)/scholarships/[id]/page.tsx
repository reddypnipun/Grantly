"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import { scholarships } from "@/data/scholarships.seed";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore, createApplication } from "@/stores/applicationStore";
import { matchScholarship } from "@/lib/matching";
import { Button } from "@/components/ui/button";
import { getMissingFields, getDisplayDeadline } from "@/lib/scholarship";

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id);
  const profile = useProfileStore((s) => s.profile);
  const apps = useApplicationStore((s) => s.applications);
  const addApp = useApplicationStore((s) => s.addApplication);
  const sch = scholarships.find((s) => s.id === id);

  if (!sch) {
    return <div className="p-8">Scholarship not found. <Link href="/discover" className="text-primary underline">Back to discover</Link></div>;
  }

  const match = profile ? matchScholarship(profile, sch) : null;
  const existingApp = apps.find((a) => a.scholarshipId === sch.id);

  function startApplication() {
    if (existingApp) {
      router.push("/tracker");
      return;
    }
    addApp(createApplication(sch!.id, sch!.requirements.map((r) => ({ id: crypto.randomUUID(), label: r, done: false }))));
    router.push("/tracker");
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/discover" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">{sch.title}</h1>
            <p className="text-muted-foreground mt-1">{sch.provider}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2 py-1 font-medium ${sch.status === "OPEN" ? "bg-success/10 text-success" : sch.status === "ROLLING" ? "bg-accent/10 text-accent" : sch.status === "OPENING_SOON" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>{(sch.status ?? "OPEN").replace(/_/g, " ")}</span>
              {sch.isReal && <span className="rounded-full bg-primary/10 text-primary px-2 py-1">Real program. Verify details on the official site.</span>}
              {sch.confidence && <span className="rounded-full bg-muted px-2 py-1" title="Confidence level">Confidence: {sch.confidence}</span>}
              {sch.amount != null && <span className="rounded-full bg-primary/10 text-primary px-2 py-1">{sch.amount.toLocaleString()} {sch.currency}</span>}
              <span className="rounded-full bg-muted px-2 py-1">{sch.country}</span>
              <span className="rounded-full bg-muted px-2 py-1">Deadline: {getDisplayDeadline(sch, new Date())}</span>
            </div>
          </div>
          {match && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{match.score}%</div>
              <div className="text-xs text-muted-foreground">match</div>
            </div>
          )}
        </div>
        <p className="mt-4 text-foreground/90">{sch.description}</p>
        <div className="mt-6">
          <Button size="lg" onClick={startApplication} className="rounded-full">
            {existingApp ? "View in tracker" : "Start application"} <ArrowRightIcon />
          </Button>
        </div>
      </div>

      {/* Eligibility breakdown */}
      {match && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold">Eligibility Matcher</h2>
          {match.whyMatch.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-success mb-2">Why you qualify</h3>
              <ul className="space-y-1">
                {match.whyMatch.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> {w}</li>
                ))}
              </ul>
            </div>
          )}
          {(match.needsAttention.length > 0 || match.notEligible.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-danger mb-2">What's missing</h3>
              <ul className="space-y-1">
                {[...match.needsAttention, ...match.notEligible].map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-danger">✕ {w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Effort estimate: {sch.effort.essays} essay(s), {sch.effort.recommendations} recommendation(s), about {sch.effort.hours} hours.
          </div>
        </div>
      )}

      {/* Requirements checklist */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold mb-3">Requirements</h2>
        <ul className="space-y-2">
          {sch.requirements.map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /> {r}</li>
          ))}
        </ul>
      </div>

      {/* Key dates & award */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold mb-3">Key dates</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Deadline:</span> {sch.deadline}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold mb-3">Award details</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Amount:</span> {sch.amount != null ? `${sch.amount.toLocaleString()} ${sch.currency}` : "Unconfirmed"}</div>
            <div><span className="text-muted-foreground">Type:</span> {sch.type.replace("_", " ")}</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold mb-3">Tips</h2>
        <ul className="space-y-2 text-sm">
          {sch.tips.map((t, i) => <li key={i}>• {t}</li>)}
        </ul>
        {sch.officialUrl ? (
          <a href={sch.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm mt-3">
            Open official site <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground mt-3">Search for the official page</p>
        )}
      </div>

      {/* Notes for unverified / conflict / low confidence */}
      <div className="space-y-2">
        {sch.hasConflict && <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 text-sm text-warning">Sources disagree on some details. Check the official site.</div>}
        {sch.confidence === "LOW" && <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Limited sources. Please verify.</div>}
        {getMissingFields(sch).length > 0 && <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">Some details aren't confirmed yet. Check the official site.</div>}
        {(sch.status === "CLOSED_REOPENS" || sch.status === "CLOSED_DISCONTINUED") && (
          <Button variant="outline" onClick={() => { const r = sch.opensMonth ?? 6; alert(`Reminder set for ${r} (7 days before estimated reopening).`); }}>Remind me when it reopens</Button>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold mb-4">Application steps</h2>
        <ol className="space-y-3">
          {["Check eligibility above", "Gather required documents", "Write your essay(s)", "Get recommendation letters", "Submit before the deadline", "Track in Manage Applications"].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{i + 1}</span>
              <span className="text-sm pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-success/30 bg-success/5 p-6">
        <div className="flex items-center gap-2 font-semibold text-success"><ShieldCheck className="h-5 w-5" /> Trust & safety</div>
        <p className="text-sm mt-2">Source: <span className="font-medium">{sch.source === "sample" ? "Sample data for demonstration" : "Verified"}</span></p>
        <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
          <li>• Legit scholarships never ask you to pay a fee.</li>
          <li>• Never share passwords or bank details.</li>
          <li>• Verify on the official website before applying.</li>
        </ul>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return <svg className="ml-2 h-4 w-4 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}