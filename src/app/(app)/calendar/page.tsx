"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { scholarships } from "@/data/scholarships.seed";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { matchAll } from "@/lib/matching";
import { downloadIcs } from "@/lib/ics";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const profile = useProfileStore((s) => s.profile);
  const applications = useApplicationStore((s) => s.applications);
  const [view, setView] = useState<"month" | "agenda">("month");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const matches = useMemo(() => (profile ? matchAll(profile, scholarships) : []), [profile]);
  const relevantIds = applications.length
    ? applications.map((a) => a.scholarshipId)
    : matches.slice(0, 8).map((m) => m.id);
  const events = relevantIds
    .map((id) => scholarships.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s && !!(s.deadline || s.lastKnownDeadline))
    .sort((a, b) => new Date(a.lastKnownDeadline ?? a.deadline!).getTime() - new Date(b.lastKnownDeadline ?? b.deadline!).getTime());

  function urgency(iso: string) {
    const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
    if (days <= 3) return "bg-danger text-white";
    if (days <= 7) return "bg-warning text-white";
    return "bg-accent text-white";
  }

  // month grid
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsByDay = new Map<number, typeof events>();
  events.forEach((e) => {
    const ref = (e.deadline ?? e.lastKnownDeadline)!;
    const dt = new Date(ref);
    if (dt.getFullYear() === year && dt.getMonth() === month) {
      const day = dt.getDate();
      if (!eventsByDay.has(day)) eventsByDay.set(day, []);
      eventsByDay.get(day)!.push(e);
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
          <Button variant={view === "agenda" ? "default" : "outline"} size="sm" onClick={() => setView("agenda")}>Agenda</Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 hover:bg-muted rounded" aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="font-serif text-xl font-bold">{cursor.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 hover:bg-muted rounded" aria-label="Next month"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => (
              <div key={i} className="min-h-[70px] rounded-lg border border-border/50 p-1">
                {day && (
                  <>
                    <div className="text-xs font-medium">{day}</div>
                    <div className="space-y-1 mt-1">
                      {(eventsByDay.get(day) || []).map((e) => (
                        <div key={e.id} className={`text-[10px] rounded px-1 py-0.5 truncate ${urgency((e.deadline ?? e.lastKnownDeadline)!)}`} title={e.title}>
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-muted-foreground">{e.provider} • {e.deadline ?? e.lastKnownDeadline}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs rounded-full px-2 py-1 ${urgency((e.deadline ?? e.lastKnownDeadline)!)}`}>{Math.ceil((new Date((e.deadline ?? e.lastKnownDeadline)!).getTime() - Date.now()) / 86400000)}d</span>
                <Button size="sm" variant="outline" onClick={() => downloadIcs(e.title, (e.deadline ?? e.lastKnownDeadline)!, e.description)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-muted-foreground">No upcoming deadlines.</p>}
        </div>
      )}
    </div>
  );
}