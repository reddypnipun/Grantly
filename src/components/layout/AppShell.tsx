"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Kanban, Calendar, FolderOpen, Sparkles, Target, Bell } from "lucide-react";
import { scholarships } from "@/data/scholarships.seed";
import { useProfileStore } from "@/stores/profileStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { matchAll } from "@/lib/matching";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/tracker", label: "Tracker", icon: Kanban },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/what-if", label: "What if", icon: Sparkles },
  { href: "/goals", label: "Goals", icon: Target },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useProfileStore((s) => s.profile);
  const applications = useApplicationStore((s) => s.applications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [now] = useState(() => Date.now());

  const relevantIds = applications.length
    ? applications.map((a) => a.scholarshipId)
    : [];
  const matches = profile ? matchAll(profile, scholarships) : [];
  const ids = relevantIds.length ? relevantIds : matches.slice(0, 6).map((m) => m.id);
  const notifs = ids
    .map((id) => scholarships.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => s!)
    .map((s) => {
      const days = Math.ceil((new Date(s.deadline).getTime() - now) / 86400000);
      return { s, days };
    })
    .filter((n) => [1, 3, 7].includes(n.days) || (n.days > 0 && n.days <= 7));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="font-serif text-2xl font-bold text-primary">Grantly</Link>
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-muted">
              <Bell className="h-5 w-5" />
              {notifs.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg z-50 p-3">
                <div className="font-semibold mb-2">Reminders</div>
                {notifs.length === 0 ? <p className="text-sm text-muted-foreground">No urgent reminders.</p> : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifs.map((n) => (
                      <div key={n.s.id} className="text-sm border-b border-border pb-2 last:border-0">
                        <div className="font-medium">{n.s.title}</div>
                        <div className="text-xs text-muted-foreground">{n.days} day{n.days !== 1 ? "s" : ""} left • {n.s.deadline}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          Sample data for demonstration
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:pl-60 flex flex-col">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-card sticky top-0 z-30">
          <Link href="/dashboard" className="font-serif text-xl font-bold text-primary">Grantly</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2">
              <Bell className="h-5 w-5" />
              {notifs.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />}
            </button>
            <span className="text-xs text-muted-foreground">Sample</span>
          </div>
        </header>
        <main id="main" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}