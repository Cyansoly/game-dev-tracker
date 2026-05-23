"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type WidgetId =
  | "today-focus"
  | "active-projects"
  | "streak"
  | "lifetime-stats"
  | "weekly-rhythm"
  | "task-focus"
  | "recent-logs"
  | "heatmap"
  | "achievements";

export type WidgetSize = "sm" | "md" | "lg" | "xl";

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  size: WidgetSize;
  order: number;
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  // Row 1: 今日 (8 + 4 = 12)
  { id: "today-focus",     visible: true, size: "lg", order: 0 },
  { id: "streak",          visible: true, size: "sm", order: 1 },
  // Row 2: 项目 (12)
  { id: "active-projects", visible: true, size: "xl", order: 2 },
  // Row 3: 总览上行 (8 + 4 = 12)
  { id: "lifetime-stats",  visible: true, size: "lg", order: 3 },
  { id: "task-focus",      visible: true, size: "sm", order: 4 },
  // Row 4: 总览下行 (6 + 6 = 12)
  { id: "weekly-rhythm",   visible: true, size: "md", order: 5 },
  { id: "recent-logs",     visible: true, size: "md", order: 6 },
  // Row 5-6: 活动与成就 (12 each)
  { id: "heatmap",         visible: true, size: "xl", order: 7 },
  { id: "achievements",    visible: true, size: "xl", order: 8 },
];

const LS_KEY = "devtracker_layout_v2";

interface LayoutCtxValue {
  widgets: WidgetConfig[];
  setVisible: (id: WidgetId, v: boolean) => void;
  setSize: (id: WidgetId, s: WidgetSize) => void;
  reorder: (id: WidgetId, direction: "up" | "down") => void;
  reset: () => void;
}

const Ctx = createContext<LayoutCtxValue | null>(null);

function load(): WidgetConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const saved: WidgetConfig[] = JSON.parse(raw);
    // merge — add any new widgets that weren't in the saved layout
    const ids = new Set(saved.map((w) => w.id));
    const extras = DEFAULT_LAYOUT.filter((d) => !ids.has(d.id));
    return [...saved, ...extras].sort((a, b) => a.order - b.order);
  } catch { return DEFAULT_LAYOUT; }
}

function save(widgets: WidgetConfig[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(widgets)); } catch {}
}

export function LayoutStoreProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_LAYOUT);

  useEffect(() => { setWidgets(load()); }, []);

  const update = useCallback((fn: (prev: WidgetConfig[]) => WidgetConfig[]) => {
    setWidgets((prev) => { const next = fn(prev); save(next); return next; });
  }, []);

  const setVisible = useCallback((id: WidgetId, v: boolean) =>
    update((prev) => prev.map((w) => w.id === id ? { ...w, visible: v } : w)), [update]);

  const setSize = useCallback((id: WidgetId, s: WidgetSize) =>
    update((prev) => prev.map((w) => w.id === id ? { ...w, size: s } : w)), [update]);

  const reorder = useCallback((id: WidgetId, direction: "up" | "down") => {
    update((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const next = sorted.map((w, i) => {
        if (i === idx) return { ...w, order: sorted[swapIdx].order };
        if (i === swapIdx) return { ...w, order: sorted[idx].order };
        return w;
      });
      return next;
    });
  }, [update]);

  const reset = useCallback(() => update(() => DEFAULT_LAYOUT), [update]);

  return (
    <Ctx.Provider value={{ widgets, setVisible, setSize, reorder, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLayoutStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLayoutStore must be inside LayoutStoreProvider");
  return ctx;
}
