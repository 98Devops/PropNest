import { Panel } from "./panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, MoonIcon, SunIcon, UserIcon, BellIcon, ShieldIcon } from "lucide-react";
import { useEffect, useState } from "react";
// @ts-expect-error - JS module without types
import { useAuth } from "@/parts/p1_imports_context.jsx";

const KEY = "propnest:theme";

export function Settings() {
  const auth = useAuth() as { user?: { email?: string; role?: string } | null } | null;
  const user = auth?.user ?? null;
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    try { window.localStorage.setItem(KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span className="text-brand-gradient">Settings</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account, appearance, and system preferences.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={window.location.pathname}>
            <ExternalLinkIcon /> Open full settings (legacy)
          </a>
        </Button>
      </header>

      <Panel stripe>
        <header className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Account</h3>
          <p className="text-xs text-muted-foreground">Signed in via Supabase auth.</p>
        </header>
        <div className="space-y-4 px-5 py-5">
          <Row icon={<UserIcon className="size-4" />} label="Email">
            <span className="font-medium text-foreground">{user?.email ?? "—"}</span>
          </Row>
          <Row icon={<ShieldIcon className="size-4" />} label="Role">
            <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>{user?.role ?? "guest"}</Badge>
          </Row>
        </div>
      </Panel>

      <Panel>
        <header className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Appearance</h3>
          <p className="text-xs text-muted-foreground">Light or dark — persisted to this browser.</p>
        </header>
        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <div className="text-sm text-muted-foreground">
            Currently using <span className="font-medium text-foreground capitalize">{mode}</span> mode
          </div>
          <div className="inline-flex overflow-hidden rounded-lg border">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-brand-gradient text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {m === "light" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                <span className="capitalize">{m}</span>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <header className="border-b px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">Coverage reminders and weekly digests — coming soon.</p>
        </header>
        <div className="space-y-3 px-5 py-5">
          <Row icon={<BellIcon className="size-4" />} label="Coverage expiring">
            <Badge variant="outline">Not yet enabled</Badge>
          </Row>
          <Row icon={<BellIcon className="size-4" />} label="Weekly digest">
            <Badge variant="outline">Not yet enabled</Badge>
          </Row>
        </div>
      </Panel>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="bg-brand-gradient-soft text-brand-blue flex size-8 items-center justify-center rounded-lg">{icon}</span>
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
