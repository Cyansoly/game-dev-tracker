"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Eye, EyeOff, ChevronUp, ChevronDown, LayoutGrid } from "lucide-react";
import type { WidgetId, WidgetSize } from "@/contexts/LayoutStoreContext";
import { useLayoutStore } from "@/contexts/LayoutStoreContext";
import { cn } from "@/lib/cn";

interface WidgetCardProps {
  id: WidgetId;
  title: string;
  icon?: ReactNode;
  accentColor?: string;
  children: ReactNode;
  /** extra element in header right slot */
  headerRight?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const SIZE_LABELS: Record<WidgetSize, string> = {
  sm: "小", md: "中", lg: "大", xl: "全宽",
};

export default function WidgetCard({
  id, title, icon, accentColor = "#3b82f6",
  children, headerRight, className, noPadding,
}: WidgetCardProps) {
  const { widgets, setVisible, setSize, reorder } = useLayoutStore();
  const cfg = widgets.find((w) => w.id === id);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-2xl border", className)}
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Accent top line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accentColor}80, transparent 60%)` }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2">
          {icon && <span style={{ color: accentColor }}>{icon}</span>}
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {/* Widget menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-6 w-6 items-center justify-center rounded-lg opacity-0 transition-all hover:opacity-100 group-hover:opacity-60"
              style={{ color: "var(--text-3)" }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl shadow-xl"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {/* Size options */}
                  <div className="px-3 pb-1 pt-2">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                      <LayoutGrid className="h-3 w-3" /> 尺寸
                    </p>
                    <div className="grid grid-cols-4 gap-0.5">
                      {(["sm", "md", "lg", "xl"] as WidgetSize[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSize(id, s); setMenuOpen(false); }}
                          className="rounded py-0.5 text-[10px] font-medium transition-colors hover:bg-white/10"
                          style={{
                            color: cfg?.size === s ? accentColor : "var(--text-3)",
                            backgroundColor: cfg?.size === s ? `${accentColor}15` : "transparent",
                          }}
                        >
                          {SIZE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="my-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
                  {/* Move */}
                  <button
                    onClick={() => { reorder(id, "up"); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-white/8"
                    style={{ color: "var(--text-2)" }}
                  >
                    <ChevronUp className="h-3.5 w-3.5" /> 上移
                  </button>
                  <button
                    onClick={() => { reorder(id, "down"); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-white/8"
                    style={{ color: "var(--text-2)" }}
                  >
                    <ChevronDown className="h-3.5 w-3.5" /> 下移
                  </button>
                  <div className="my-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
                  {/* Hide */}
                  <button
                    onClick={() => { setVisible(id, false); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-white/8"
                    style={{ color: "var(--text-3)" }}
                  >
                    <EyeOff className="h-3.5 w-3.5" /> 隐藏此模块
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={cn(!noPadding && "p-4")}>
        {children}
      </div>
    </motion.div>
  );
}

/* A hover-sensitive wrapper so ⋮ appears on hover */
export function WidgetWrapper({ children }: { children: ReactNode }) {
  return <div className="group">{children}</div>;
}
