import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorMode } from "@chakra-ui/react";
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
}
const STORAGE_KEY = "aix2-theme";
const MEDIA = "(prefers-color-scheme: dark)";
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({
  children


}: {children: React.ReactNode;}) {
  const {
    setColorMode
  } = useColorMode();
  const [preference, setPref] = useState<ThemePreference>(readPreference);
  const [systemDark, setSystemDark] = useState<boolean>(prefersDark);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(MEDIA);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const resolved: ResolvedTheme = preference === "system" ? systemDark ? "dark" : "light" : preference;
  useEffect(() => {
    applyTheme(resolved);
    setColorMode(resolved);
  }, [resolved, setColorMode]);
  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {

      /* storage unavailable — preference lasts for this session only */}
  }, []);
  const value = useMemo(() => ({
    preference,
    resolved,
    setPreference
  }), [preference, resolved, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {

    /* ignore */}
  return "dark";
}
function prefersDark() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(MEDIA).matches;
}
function applyTheme(t: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("theme-light", t === "light");
  root.classList.toggle("theme-dark", t === "dark");
  root.style.colorScheme = t;
}

// Apply before first paint to avoid a flash of the wrong theme.
applyTheme(readPreference() === "system" ? prefersDark() ? "dark" : "light" : readPreference() as ResolvedTheme);