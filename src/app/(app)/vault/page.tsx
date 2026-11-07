"use client";
import { useState } from "react";
import { FileText, Plus, Trash2, Wand2, Lightbulb } from "lucide-react";
import { useVaultStore } from "@/stores/vaultStore";
import { scholarships } from "@/data/scholarships.seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DOC_STATUSES = ["missing", "in_progress", "ready"] as const;

function outlineFor(title: string, tags: string[]) {
  const tag = tags[0] || "your topic";
  return `Outline: ${title}\n\n1. Introduction — hook and thesis about ${tag}.\n2. Background — context and motivation.\n3. Key experiences — 2-3 concrete examples.\n4. Impact — what you learned and changed.\n5. Future goals — how this scholarship helps.\n6. Conclusion — restate thesis and call to action.`;
}

function reuseSuggestions(essays: { id: string; title: string; body: string; tags: string[] }[], currentTags: string[]) {
  return essays
    .filter((e) => e.tags.some((t) => currentTags.includes(t)))
    .map((e) => ({ id: e.id, title: e.title, snippet: e.body.slice(0, 120) }));
}

export default function VaultPage() {
  const { documents, essays, setDocStatus, updateDocFile, addEssay, updateEssay, deleteEssay } = useVaultStore();
  const [tab, setTab] = useState<"docs" | "essays">("docs");
  const [newEssayTitle, setNewEssayTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [selectedSch, setSelectedSch] = useState("");

  function createEssay() {
    if (!newEssayTitle.trim()) return;
    const id = crypto.randomUUID();
    addEssay({ id, title: newEssayTitle, body: "", tags: [], linkedScholarshipIds: [], wordCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    setNewEssayTitle("");
    setEditingId(id);
    setBody("");
    setTags("");
  }

  function saveEssay() {
    if (!editingId) return;
    updateEssay(editingId, { body, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
    setEditingId(null);
  }

  const editingEssay = essays.find((e) => e.id === editingId);
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const limit = 500;
  const suggestions = editingId ? reuseSuggestions(essays.filter((e) => e.id !== editingId), tags.split(",").map((t) => t.trim()).filter(Boolean)) : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
      <h1 className="font-serif text-3xl font-bold">Document & essay vault</h1>
      <div className="flex gap-2">
        <Button variant={tab === "docs" ? "default" : "outline"} size="sm" onClick={() => setTab("docs")}>Documents</Button>
        <Button variant={tab === "essays" ? "default" : "outline"} size="sm" onClick={() => setTab("essays")}>Essays</Button>
      </div>

      {tab === "docs" && (
        <div className="space-y-3">
          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents yet.</p>
              <p className="text-sm mt-1">Complete onboarding to get your document checklist, or add one manually.</p>
            </div>
          )}
          {documents.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{d.label}</div>
                {d.fileName && <div className="text-xs text-muted-foreground">{d.fileName} ({Math.round((d.fileSize || 0) / 1024)}KB)</div>}
              </div>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={d.status}
                onChange={(e) => setDocStatus(d.id, e.target.value as typeof d.status)}
              >
                {DOC_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
              <label className="cursor-pointer text-sm text-primary underline">
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) updateDocFile(d.id, f.name, f.size);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {tab === "essays" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-3">
            <div className="flex gap-2">
              <Input value={newEssayTitle} onChange={(e) => setNewEssayTitle(e.target.value)} placeholder="New essay title" />
              <Button size="sm" onClick={createEssay}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              {essays.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No essays yet. Create one to start writing and reusing across applications.
                </div>
              )}
              {essays.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setEditingId(e.id); setBody(e.body); setTags(e.tags.join(", ")); }}
                  className={`w-full text-left rounded-xl border p-3 ${editingId === e.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                >
                  <div className="font-medium text-sm">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.wordCount} words</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {editingEssay ? (
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h2 className="font-serif text-xl font-bold">{editingEssay.title}</h2>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
                <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={selectedSch} onChange={(e) => setSelectedSch(e.target.value)}>
                  <option value="">Link to scholarship (optional)</option>
                  {scholarships.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-ring"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your essay..."
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={wordCount > limit ? "text-danger" : "text-muted-foreground"}>{wordCount} / {limit} words</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBody(outlineFor(editingEssay.title, tags.split(",").map((t) => t.trim()).filter(Boolean)))}>
                      <Wand2 className="mr-1 h-4 w-4" /> Outline
                    </Button>
                    <Button size="sm" onClick={saveEssay}>Save</Button>
                    <Button variant="destructive" size="sm" onClick={() => { deleteEssay(editingId!); setEditingId(null); }} aria-label="Delete essay">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2"><Lightbulb className="h-4 w-4" /> Reuse suggestions</div>
                    <div className="space-y-2">
                      {suggestions.map((s) => (
                        <div key={s.id} className="text-sm">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.snippet}…</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Select or create an essay to start writing.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}