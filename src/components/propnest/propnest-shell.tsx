import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { NavProvider, useNav, type ScreenKey } from "@/lib/propnest-nav";
import { PropNestDashboard } from "./propnest-dashboard";
import { Button } from "@/components/ui/button";
import { ConstructionIcon } from "lucide-react";

const VALID_SCREENS: ScreenKey[] = [
  "dashboard", "properties", "tenants", "finance", "reports", "calendar", "settings",
];

function readHashScreen(): ScreenKey {
  const raw = window.location.hash.replace(/^#\/?/, "") as ScreenKey;
  return (VALID_SCREENS as string[]).includes(raw) ? raw : "dashboard";
}

function ScreenSwitcher() {
  const { screen, setScreen } = useNav();

  useEffect(() => {
    const sync = () => setScreen(readHashScreen());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [setScreen]);

  if (screen === "dashboard") return <PropNestDashboard />;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <ConstructionIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground capitalize">{screen} — rebuild in progress</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This screen hasn&apos;t been fused into the new shell yet. The original
          {" "}<span className="font-medium text-foreground">{screen}</span>{" "}
          view is still available in the legacy app.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <a href={window.location.pathname}>Open legacy view</a>
        </Button>
      </div>
    </div>
  );
}

export function PropNestShell() {
  return (
    <NavProvider initial={readHashScreen()}>
      <AppShell>
        <ScreenSwitcher />
      </AppShell>
    </NavProvider>
  );
}

export default PropNestShell;
