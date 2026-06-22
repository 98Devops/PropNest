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
};

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children, initial = "dashboard" }: { children: ReactNode; initial?: ScreenKey }) {
  const [screen, setScreen] = useState<ScreenKey>(initial);
  const value = useMemo(() => ({ screen, setScreen }), [screen]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return ctx;
}
