"use client";

import { useRef, useEffect, useCallback } from "react";

const ITEM_H = 44; // px per item
const VISIBLE = 5; // visible items

interface ScrollPickerProps {
  values: (number | string)[];
  selected: number | string;
  onChange: (v: number | string) => void;
  unit?: string;
  className?: string;
}

export default function ScrollPicker({ values, selected, onChange, unit, className }: ScrollPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, values.indexOf(selected));
  const isScrolling = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to selected item on mount / when selected changes externally
  useEffect(() => {
    const el = listRef.current;
    if (!el || isScrolling.current) return;
    const target = idx * ITEM_H;
    el.scrollTop = target;
  }, [idx]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    isScrolling.current = true;

    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const rawIdx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(rawIdx, values.length - 1));
      // Snap
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onChange(values[clamped]);
      isScrolling.current = false;
    }, 120);
  }, [values, onChange]);

  useEffect(() => {
    return () => { if (snapTimer.current) clearTimeout(snapTimer.current); };
  }, []);

  const padTop = ITEM_H * Math.floor(VISIBLE / 2);
  const containerH = ITEM_H * VISIBLE;

  return (
    <div className={`relative select-none ${className ?? ""}`} style={{ width: 72, height: containerH }}>
      {/* Gradient masks */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: padTop,
          background: "linear-gradient(to bottom, var(--bg-raised) 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: padTop,
          background: "linear-gradient(to top, var(--bg-raised) 0%, transparent 100%)",
        }}
      />

      {/* Selection highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 z-0"
        style={{
          top: padTop,
          height: ITEM_H,
          backgroundColor: "rgba(59, 130, 246, 0.12)",
          borderTop: "1px solid rgba(59, 130, 246, 0.25)",
          borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: 8,
        }}
      />

      {/* Scroll list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-scroll"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingTop: padTop,
          paddingBottom: padTop,
        }}
      >
        {/* Hide native scrollbar in webkit */}
        <style>{`.scroll-picker-inner::-webkit-scrollbar{display:none}`}</style>
        {values.map((v, i) => {
          const isSelected = i === idx;
          return (
            <div
              key={v}
              className="flex cursor-pointer items-center justify-center transition-all"
              style={{
                height: ITEM_H,
                fontSize: isSelected ? 18 : 14,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? "var(--text-1)" : "var(--text-3)",
                opacity: Math.abs(i - idx) > 2 ? 0.2 : 1 - Math.abs(i - idx) * 0.25,
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
              onClick={() => {
                const el = listRef.current;
                if (el) el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                onChange(v);
              }}
            >
              {String(v).padStart(2, "0")}
            </div>
          );
        })}
      </div>

      {/* Unit label */}
      {unit && (
        <div
          className="pointer-events-none absolute right-1 z-20 text-[10px] font-medium"
          style={{ top: padTop + 14, color: "var(--text-3)" }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}
