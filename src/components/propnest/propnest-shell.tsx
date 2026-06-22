import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { NavProvider, useNav, type ScreenKey } from "@/lib/propnest-nav";
import { PropNestDashboard } from "./propnest-dashboard";
import { Properties } from "./properties";
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
  if (screen === "properties") return <Properties />;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-gradient-soft">
          <ConstructionIcon className="size-5 text-brand-blue" />
        </div>
        <h2 className="text-lg font-semibold capitalize">
          <span className="text-brand-gradient">{screen}</span> — rebuild in progress
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This screen hasn&apos;t been fused into the new shell yet. The original
          {" "}<span className="font-medium text-foreground">{screen}</span>{" "}
          view is still available in the legacy app.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button asChild variant="gradient">
            <a href={window.location.pathname}>Open legacy view</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PropNestShell() {
  return (
    <NavProvider initial={readHashScreen()}>
      <AppShell>
        <div className="bg-page-gradient -m-4 min-h-[calc(100vh-3.5rem)] p-4 md:-m-6 md:p-6">
          <ScreenSwitcher />
        </div>
      </AppShell>
    </NavProvider>
  );
}

export default PropNestShell;
