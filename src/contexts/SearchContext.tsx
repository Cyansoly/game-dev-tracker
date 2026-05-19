"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextValue {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
}

const Ctx = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, openPalette: () => setOpen(true), closePalette: () => setOpen(false) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be inside SearchProvider");
  return ctx;
}
