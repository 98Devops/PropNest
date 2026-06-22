import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ScreenKey =
  | "dashboard"
  | "properties"
  | "tenants"
  | "finance"
  | "reports"
  | "calendar"
  | "settings";

type NavContextValue = {
  screen: ScreenKey;
  setScreen: (s: ScreenKey) => void;
  /** Currently focused property in the Properties screen, if any. */
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  /** Helper: jump straight to a property detail from anywhere (e.g. Dashboard). */
  openProperty: (id: string) => void;
};

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children, initial = "dashboard" }: { children: ReactNode; initial?: ScreenKey }) {
  const [screen, setScreen] = useState<ScreenKey>(initial);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const value = useMemo<NavContextValue>(
    () => ({
      screen,
      setScreen: (s) => {
        setScreen(s);
        if (s !== "properties") setSelectedPropertyId(null);
      },
      selectedPropertyId,
      setSelectedPropertyId,
      openProperty: (id) => {
        setSelectedPropertyId(id);
        setScreen("properties");
        if (typeof window !== "undefined") window.location.hash = "properties";
      },
    }),
    [screen, selectedPropertyId],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return ctx;
}
