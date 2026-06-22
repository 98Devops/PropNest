import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { NavProvider, useNav, type ScreenKey } from "@/lib/propnest-nav";
import { PropNestDashboard } from "./propnest-dashboard";
import { Properties } from "./properties";
import { Tenants } from "./tenants";
import { Finance } from "./finance";
import { Reports } from "./reports";
import { CalendarScreen } from "./calendar";
import { Settings } from "./settings";

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

  switch (screen) {
    case "dashboard":  return <PropNestDashboard />;
    case "properties": return <Properties />;
    case "tenants":    return <Tenants />;
    case "finance":    return <Finance />;
    case "reports":    return <Reports />;
    case "calendar":   return <CalendarScreen />;
    case "settings":   return <Settings />;
    default:           return <PropNestDashboard />;
  }
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
