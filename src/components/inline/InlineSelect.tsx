"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Option<T extends string> {
  value: T;
  label: string;
  className?: string; // Tailwind badge classes
  color?: string;     // inline style color
}

interface InlineSelectProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  readOnly?: boolean;
  accentColor?: string;
}

export default function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  readOnly = false,
  accentColor,
}: InlineSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !readOnly && setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
        style={
          current?.color
            ? { color: current.color, backgroundColor: `${current.color}18`, cursor: readOnly ? "default" : "pointer" }
            : { cursor: readOnly ? "default" : "pointer" }
        }
      >
        <span className={current?.className}>{current?.label ?? value}</span>
        {!readOnly && (
          <ChevronDown
            className="h-3 w-3 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none", color: accentColor ?? "var(--text-3)" }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-xl shadow-xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/8"
                style={{ color: o.color ?? "var(--text-2)" }}
              >
                {o.value === value && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                {o.value !== value && <span className="h-1.5 w-1.5 shrink-0" />}
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
