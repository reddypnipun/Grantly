"use client";
import { useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { List, LayoutGrid, MoreHorizontal } from "lucide-react";
import { scholarships } from "@/data/scholarships.seed";
import { useApplicationStore } from "@/stores/applicationStore";
import type { Application, ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/button";

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "preparing", label: "Preparing" },
  { id: "submitted", label: "Submitted" },
  { id: "awaiting", label: "Awaiting result" },
  { id: "won", label: "Won" },
  { id: "not_selected", label: "Not selected" },
];

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function Card({ app, view }: { app: Application; view: "kanban" | "list" }) {
  const sch = scholarships.find((s) => s.id === app.scholarshipId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const done = app.checklist.filter((c) => c.done).length;
  const total = app.checklist.length;
  const move = useApplicationStore((s) => s.moveApplication);
  const [menuOpen, setMenuOpen] = useState(false);

  if (view === "list") {
    return (
      <tr className="border-b border-border">
        <td className="p-3"><Link href={`/scholarships/${sch?.id}`} className="font-medium hover:text-primary">{sch?.title}</Link></td>
        <td className="p-3 text-sm">{sch?.provider}</td>
        <td className="p-3 text-sm">{app.status}</td>
        <td className="p-3 text-sm">{total ? `${done}/${total}` : "—"}</td>
        <td className="p-3 text-sm">{sch ? (sch.deadline ? daysUntil(sch.deadline) : "—") : "—"}d</td>
      </tr>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-xl border border-border bg-card p-3 cursor-grab active:cursor-grabbing touch-none">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/scholarships/${sch?.id}`} className="font-medium text-sm hover:text-primary">{sch?.title}</Link>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="text-muted-foreground" aria-label="Move card"><MoreHorizontal className="h-4 w-4" /></button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 z-20 rounded-lg border border-border bg-card shadow-md p-1 min-w-[140px]">
              {COLUMNS.map((c) => (
                <button key={c.id} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded" onClick={() => { move(app.id, c.id); setMenuOpen(false); }}>
                  Move to {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{sch?.provider}</div>
      {total > 0 && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{done}/{total} tasks</div>
        </div>
      )}
      <div className="mt-2 text-xs text-warning font-medium">{sch ? `${sch.deadline ? daysUntil(sch.deadline) : "?"} days left` : ""}</div>
    </div>
  );
}

export default function TrackerPage() {
  const applications = useApplicationStore((s) => s.applications);
  const move = useApplicationStore((s) => s.moveApplication);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    // determine target column: if over is a column id or a card
    let targetCol: ApplicationStatus | null = null;
    if (COLUMNS.some((c) => c.id === overId)) targetCol = overId as ApplicationStatus;
    else {
      const overApp = applications.find((a) => a.id === overId);
      if (overApp) targetCol = overApp.status;
    }
    if (targetCol) move(String(active.id), targetCol);
  }

  const activeApp = applications.find((a) => a.id === activeId);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold">Application tracker</h1>
        <div className="flex gap-2">
          <Button variant={view === "kanban" ? "default" : "outline"} size="sm" onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No applications yet. Start one from a scholarship.</p>
          <Link href="/discover" className="text-primary underline mt-2 inline-block">Discover scholarships</Link>
        </div>
      ) : view === "list" ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-left text-sm">
                <th className="p-3">Scholarship</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Status</th>
                <th className="p-3">Checklist</th>
                <th className="p-3">Days left</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => <Card key={a.id} app={a} view="list" />)}
            </tbody>
          </table>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const colApps = applications.filter((a) => a.status === col.id);
              return (
                <div key={col.id} id={col.id} className="min-w-[260px] w-[260px] flex-shrink-0">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{col.label}</h3>
                      <span className="text-xs bg-card rounded-full px-2 py-0.5">{colApps.length}</span>
                    </div>
                    <SortableContext items={colApps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2 min-h-[60px]">
                        {colApps.map((a) => <Card key={a.id} app={a} view="kanban" />)}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeApp ? <div className="opacity-80"><Card app={activeApp} view="kanban" /></div> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}