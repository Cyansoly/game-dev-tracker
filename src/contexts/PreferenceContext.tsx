"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react";

const ACCENT_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#ec4899",
] as const;
export type AccentColor = typeof ACCENT_COLORS[number];

interface PreferenceContextValue {
  accentColor: string;
  setAccentColor: (c: string) => void;
  compactMode: boolean;
  setCompactMode: (v: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (v: boolean) => void;
  ACCENT_COLORS: typeof ACCENT_COLORS;
}

const Ctx = createContext<PreferenceContextValue | null>(null);

const LS_ACCENT   = "devtracker_pref_accent";
const LS_COMPACT  = "devtracker_pref_compact";
const LS_ANIM     = "devtracker_pref_anim";

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState("#3b82f6");
  const [compactMode, setCompactModeState] = useState(false);
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);

  // Hydrate from localStorage
  useEffect(() => {
    const a = localStorage.getItem(LS_ACCENT);
    const c = localStorage.getItem(LS_COMPACT);
    const n = localStorage.getItem(LS_ANIM);
    if (a) setAccentColorState(a);
    if (c !== null) setCompactModeState(c === "1");
    if (n !== null) setAnimationsEnabledState(n !== "0");
  }, []);

  // Apply accent to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
  }, [accentColor]);

  // Apply compact class
  useEffect(() => {
    document.documentElement.classList.toggle("compact", compactMode);
  }, [compactMode]);

  // Apply no-anim class
  useEffect(() => {
    document.documentElement.classList.toggle("no-anim", !animationsEnabled);
  }, [animationsEnabled]);

  const setAccentColor = useCallback((c: string) => {
    setAccentColorState(c);
    localStorage.setItem(LS_ACCENT, c);
  }, []);

  const setCompactMode = useCallback((v: boolean) => {
    setCompactModeState(v);
    localStorage.setItem(LS_COMPACT, v ? "1" : "0");
  }, []);

  const setAnimationsEnabled = useCallback((v: boolean) => {
    setAnimationsEnabledState(v);
    localStorage.setItem(LS_ANIM, v ? "1" : "0");
  }, []);

  return (
    <Ctx.Provider value={{
      accentColor, setAccentColor,
      compactMode, setCompactMode,
      animationsEnabled, setAnimationsEnabled,
      ACCENT_COLORS,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePreference() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePreference must be inside PreferenceProvider");
  return ctx;
}
