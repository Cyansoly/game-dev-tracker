"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Named anchors shown under the bar */
const ANCHORS = [
  { pct: 0,   labelZh: "概念", labelEn: "Concept" },
  { pct: 25,  labelZh: "原型", labelEn: "Prototype" },
  { pct: 50,  labelZh: "制作", labelEn: "Production" },
  { pct: 75,  labelZh: "打磨", labelEn: "Polish" },
  { pct: 100, labelZh: "发布", labelEn: "Release" },
];

function barColor(pct: number): string {
  if (pct < 25)  return "#a855f7";   // concept  – purple
  if (pct < 50)  return "#3b82f6";   // proto    – blue
  if (pct < 75)  return "#06b6d4";   // prod     – cyan
  if (pct < 100) return "#f97316";   // polish   – orange
  return "#22c55e";                   // released – green
}

function nearestAnchorLabel(pct: number, zh: boolean): string | null {
  const anchor = ANCHORS.find((a) => Math.abs(a.pct - pct) <= 3);
  if (!anchor) return null;
  return zh ? anchor.labelZh : anchor.labelEn;
}

interface QuestBarProps {
  value: number;           // 0-100
  onChange?: (v: number) => void;
  readOnly?: boolean;
  color?: string;
  zh?: boolean;
  showLabel?: boolean;
}

export default function QuestBar({
  value,
  onChange,
  readOnly = false,
  color,
  zh = true,
  showLabel = true,
}: QuestBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState(String(value));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fillColor = color ?? barColor(value);

  function getPctFromX(clientX: number): number {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * 100);
  }

  function applyValue(v: number) {
    if (!onChange) return;
    const clamped = Math.max(0, Math.min(100, v));
    onChange(clamped);

    // Show anchor toast
    const label = nearestAnchorLabel(clamped, zh ?? true);
    if (label) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(label);
      toastTimer.current = setTimeout(() => setToast(null), 1800);
    }
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (readOnly || !onChange) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    applyValue(getPctFromX(e.clientX));
  }, [readOnly, onChange, value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || readOnly || !onChange) return;
    applyValue(getPctFromX(e.clientX));
  }, [dragging, readOnly, onChange]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  function commitInput() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) applyValue(n);
    setEditMode(false);
  }

  // Keyboard on handle
  function onHandleKeyDown(e: React.KeyboardEvent) {
    if (readOnly || !onChange) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); applyValue(value + step); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); applyValue(value - step); }
  }

  return (
    <div className="relative flex flex-col gap-3 select-none">
      {/* Bar + handle */}
      <div className="relative">
        {/* Track */}
        <div
          ref={trackRef}
          className={`relative h-3 w-full overflow-visible rounded-full ${readOnly ? "" : "cursor-pointer"}`}
          style={{ backgroundColor: "var(--bg-raised)" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Fill */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${fillColor}88, ${fillColor})` }}
            animate={{ width: `${value}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Anchor dots */}
          {ANCHORS.map((a) => (
            <div
              key={a.pct}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${a.pct}%` }}
            >
              <div
                className="h-2 w-2 rounded-full border-2"
                style={{
                  backgroundColor: value >= a.pct ? fillColor : "var(--bg-base)",
                  borderColor: value >= a.pct ? fillColor : "var(--border-color)",
                  transition: "background-color 0.2s, border-color 0.2s",
                }}
              />
            </div>
          ))}

          {/* Drag handle */}
          {!readOnly && (
            <motion.div
              className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${value}%` }}
              role="slider"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onKeyDown={onHandleKeyDown}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setInputVal(String(value));
                setEditMode(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              whileDrag={{ scale: 1.25 }}
              animate={{ scale: dragging ? 1.25 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div
                className="h-5 w-5 rounded-full border-2 bg-white shadow-md"
                style={{ borderColor: fillColor }}
              />
            </motion.div>
          )}
        </div>

        {/* Anchor toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg"
              style={{
                backgroundColor: fillColor,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              {zh ? "进入阶段：" : "Stage: "}{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Anchor labels row */}
      {showLabel && (
        <div className="relative h-5">
          {ANCHORS.map((a) => (
            <div
              key={a.pct}
              className="absolute -translate-x-1/2"
              style={{ left: `${a.pct}%` }}
            >
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: value >= a.pct ? fillColor : "var(--text-3)" }}
              >
                {zh ? a.labelZh : a.labelEn}
              </span>
            </div>
          ))}
          {/* Current value inline input or label */}
          <div
            className="absolute right-0 top-0"
            onDoubleClick={() => {
              if (readOnly) return;
              setInputVal(String(value));
              setEditMode(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          >
            {editMode ? (
              <input
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={commitInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitInput();
                  if (e.key === "Escape") setEditMode(false);
                }}
                className="num w-14 rounded border px-1 py-0 text-xs text-right outline-none"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: fillColor,
                  color: fillColor,
                }}
                type="number"
                min={0}
                max={100}
              />
            ) : (
              <span
                className={`num text-xs font-bold ${!readOnly ? "cursor-text" : ""}`}
                style={{ color: fillColor }}
                title={readOnly ? undefined : (zh ? "双击输入精确值" : "Double-click to type")}
              >
                {value}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
