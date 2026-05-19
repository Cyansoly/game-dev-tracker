"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Plus, Trash2, Check } from "lucide-react";
import type { ProgressModule } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

const MODULE_COLORS: Record<string, string> = {
  art:       "#a855f7",
  code:      "#3b82f6",
  level:     "#06b6d4",
  audio:     "#22c55e",
  narrative: "#f97316",
  qa:        "#eab308",
};

const MODULE_ZH: Record<string, string> = {
  art:       "美术",
  code:      "程序",
  level:     "关卡",
  audio:     "音效",
  narrative: "剧情",
  qa:        "测试",
};

const TRACK_H = 160;
const COL_H = TRACK_H + 80;

/* ──────────────────────────────────────
   Meta Popover (note / weight / remove)
────────────────────────────────────── */
interface MetaPopoverProps {
  mod: ProgressModule;
  color: string;
  onUpdate: (patch: Partial<Pick<ProgressModule, "label" | "weight" | "note">>) => void;
  onRemove?: () => void;
  onClose: () => void;
  zh: boolean;
}

function MetaPopover({ mod, color, onUpdate, onRemove, onClose, zh }: MetaPopoverProps) {
  const [label, setLabel] = useState(mod.label);
  const [note, setNote] = useState(mod.note ?? "");
  const [weight, setWeight] = useState(String(mod.weight));

  function commit() {
    const w = parseFloat(weight);
    onUpdate({
      label: label.trim() || mod.label,
      note: note.trim() || undefined,
      weight: isNaN(w) ? mod.weight : Math.max(0.1, Math.min(3, w)),
    });
    onClose();
  }

  return (
    <motion.div
      className="absolute left-1/2 z-50 w-44 -translate-x-1/2 rounded-xl p-3 shadow-2xl"
      style={{
        top: COL_H + 8,
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${color}50`,
      }}
      initial={{ opacity: 0, y: -6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.94 }}
      transition={{ duration: 0.14 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex flex-col gap-1.5">
        <label className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>
          {zh ? "模块名称" : "Name"}
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          className="rounded-lg border px-2 py-1 text-xs outline-none"
          style={{ backgroundColor: "var(--input-bg)", borderColor: color, color: "var(--text-1)" }}
        />
      </div>
      <div className="mb-2 flex flex-col gap-1.5">
        <label className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>
          {zh ? "权重 (0.1-3)" : "Weight (0.1-3)"}
        </label>
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          type="number"
          step={0.1}
          min={0.1}
          max={3}
          className="num rounded-lg border px-2 py-1 text-xs outline-none"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
        />
      </div>
      <div className="mb-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>
          {zh ? "备注" : "Note"}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border px-2 py-1 text-[11px] leading-relaxed outline-none"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={commit}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          <Check className="h-3 w-3" />{zh ? "保存" : "Save"}
        </button>
        {onRemove && (
          <button
            onClick={() => { onRemove(); onClose(); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/20"
            style={{ color: "#ef4444" }}
            title={zh ? "删除模块" : "Remove module"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   AddModulePanel
────────────────────────────────────── */
interface AddModulePanelProps {
  onAdd: (data: { key: string; label: string; weight: number }) => void;
  onClose: () => void;
  zh: boolean;
}

function AddModulePanel({ onAdd, onClose, zh }: AddModulePanelProps) {
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState("1.0");

  function commit() {
    if (!label.trim()) return;
    const key = `custom-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    onAdd({ key, label: label.trim(), weight: parseFloat(weight) || 1 });
    onClose();
  }

  return (
    <motion.div
      className="flex flex-col gap-2 rounded-xl border p-3"
      style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-color)" }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <p className="text-[11px] font-medium" style={{ color: "var(--text-2)" }}>
        {zh ? "添加自定义模块" : "Add custom module"}
      </p>
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") onClose(); }}
        placeholder={zh ? "模块名称" : "Module name"}
        className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none"
        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
      />
      <div className="flex items-center gap-2">
        <label className="text-[10px] shrink-0" style={{ color: "var(--text-3)" }}>
          {zh ? "权重" : "Weight"}
        </label>
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          type="number"
          step={0.1}
          min={0.1}
          max={3}
          className="num w-16 rounded-lg border px-2 py-1 text-xs outline-none"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
        />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={commit}
          disabled={!label.trim()}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-1.5 text-xs text-white disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />{zh ? "添加" : "Add"}
        </button>
        <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-xs hover:bg-white/8" style={{ color: "var(--text-3)" }}>
          {zh ? "取消" : "Cancel"}
        </button>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   VerticalSlider
────────────────────────────────────── */
interface VerticalSliderProps {
  mod: ProgressModule;
  active: boolean;
  isHovered: boolean;
  onHover: (key: string | null) => void;
  onChange: (key: string, val: number) => void;
  onMetaUpdate: (patch: Partial<Pick<ProgressModule, "label" | "weight" | "note">>) => void;
  onRemove?: () => void;
  zh: boolean;
}

function VerticalSlider({ mod, active, isHovered, onHover, onChange, onMetaUpdate, onRemove, zh }: VerticalSliderProps) {
  const color = mod.color ?? MODULE_COLORS[mod.key] ?? "#71717a";
  const label = zh && !mod.isCustom ? (MODULE_ZH[mod.key] ?? mod.label) : mod.label;

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [draggingVis, setDraggingVis] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState(String(mod.progress));
  const [delta, setDelta] = useState<number | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const lastVal = useRef(mod.progress);

  function getPctFromY(clientY: number): number {
    if (!trackRef.current) return mod.progress;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return Math.round(ratio * 100);
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    setDraggingVis(true);
    lastVal.current = mod.progress;
    onChange(mod.key, getPctFromY(e.clientY));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.key, onChange]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const v = getPctFromY(e.clientY);
    setDelta(v - lastVal.current);
    onChange(mod.key, v);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.key, onChange]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    setDraggingVis(false);
    setTimeout(() => setDelta(null), 700);
  }, []);

  function commitInput() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) onChange(mod.key, Math.max(0, Math.min(100, n)));
    setEditMode(false);
  }

  const fillH = Math.max(0, Math.min(TRACK_H, (mod.progress / 100) * TRACK_H));

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ height: COL_H, width: 52 }}
      onMouseEnter={() => onHover(mod.key)}
      onMouseLeave={() => { onHover(null); setShowMeta(false); }}
    >
      {/* Delta badge */}
      <div className="flex h-6 shrink-0 items-center justify-center overflow-hidden">
        <AnimatePresence>
          {delta !== null && delta !== 0 && (
            <motion.span
              key="delta"
              className="num rounded px-1.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: delta > 0 ? "#22c55e22" : "#ef444422",
                color: delta > 0 ? "#22c55e" : "#ef4444",
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative shrink-0 cursor-ns-resize rounded-lg"
        style={{
          width: 40,
          height: TRACK_H,
          backgroundColor: "var(--bg-raised)",
          opacity: active ? 1 : 0.45,
          transition: "opacity 0.2s",
          border: draggingVis ? `1px solid ${color}60` : "1px solid transparent",
          touchAction: "none",
          overflow: "hidden",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {[25, 50, 75].map((t) => (
          <div key={t} className="absolute left-0 right-0 opacity-20"
            style={{ bottom: `${t}%`, height: 1, backgroundColor: "var(--text-3)" }} />
        ))}

        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-t-sm"
          animate={{ height: fillH }}
          transition={draggingVis ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 30 }}
          style={{ background: `linear-gradient(to top, ${color}cc, ${color}55)` }}
        />

        <AnimatePresence>
          {(isHovered || draggingVis) && (
            <motion.div
              className="absolute left-1/2 z-10 -translate-x-1/2"
              style={{ bottom: Math.max(0, Math.min(TRACK_H - 8, fillH - 4)) }}
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: draggingVis ? 1.3 : 1 }}
              exit={{ opacity: 0, scaleX: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="h-2 w-7 rounded-full border-2 bg-white shadow-md" style={{ borderColor: color }} />
            </motion.div>
          )}
        </AnimatePresence>

        {mod.progress >= 100 && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{ boxShadow: [`inset 0 0 0px ${color}00`, `inset 0 0 12px ${color}60`, `inset 0 0 0px ${color}00`] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Value label */}
      <div className="flex h-7 shrink-0 items-center justify-center overflow-hidden">
        {editMode ? (
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commitInput}
            onKeyDown={(e) => { if (e.key === "Enter") commitInput(); if (e.key === "Escape") setEditMode(false); }}
            autoFocus
            className="num w-14 rounded border px-1 py-0.5 text-center text-xs outline-none"
            style={{ backgroundColor: "var(--input-bg)", borderColor: color, color }}
            type="number"
            min={0}
            max={100}
          />
        ) : (
          <span
            className="num cursor-text text-sm font-bold transition-colors"
            style={{ color: isHovered ? color : active ? "var(--text-2)" : "var(--text-3)" }}
            onDoubleClick={() => { setInputVal(String(mod.progress)); setEditMode(true); }}
            title={zh ? "双击精确输入" : "Double-click for exact value"}
          >
            {mod.progress}%
          </span>
        )}
      </div>

      {/* Module label + ⋮ button */}
      <div className="flex h-5 shrink-0 items-center gap-1 overflow-visible">
        <span className="text-[11px] font-medium transition-colors" style={{ color: isHovered ? color : "var(--text-3)" }}>
          {label}
        </span>
        <AnimatePresence>
          {isHovered && (
            <motion.button
              className="flex h-4 w-4 items-center justify-center rounded opacity-60 hover:opacity-100"
              style={{ color: "var(--text-3)" }}
              onClick={(e) => { e.stopPropagation(); setShowMeta((v) => !v); }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              title={zh ? "编辑模块信息" : "Edit module meta"}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Note tooltip */}
      <AnimatePresence>
        {isHovered && mod.note && !showMeta && (
          <motion.div
            className="pointer-events-none absolute left-1/2 z-30 w-40 -translate-x-1/2 rounded-lg px-3 py-2 text-[11px] leading-relaxed shadow-xl"
            style={{ top: COL_H + 4, backgroundColor: "var(--bg-card)", border: `1px solid ${color}40`, color: "var(--text-2)" }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {mod.note}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta popover */}
      <AnimatePresence>
        {showMeta && (
          <MetaPopover
            mod={mod}
            color={color}
            onUpdate={onMetaUpdate}
            onRemove={mod.isCustom ? onRemove : undefined}
            onClose={() => setShowMeta(false)}
            zh={zh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────
   ModuleMixer (main export)
────────────────────────────────────── */
interface ModuleMixerProps {
  modules: ProgressModule[];
  projectId: string;
  onModuleChange: (key: string, val: number) => void;
  onModuleMeta?: (key: string, patch: Partial<Pick<ProgressModule, "label" | "weight" | "note">>) => void;
  onModuleAdd?: (data: { key: string; label: string; weight: number; progress: number }) => void;
  onModuleRemove?: (key: string) => void;
}

export default function ModuleMixer({
  modules,
  projectId: _projectId,
  onModuleChange,
  onModuleMeta,
  onModuleAdd,
  onModuleRemove,
}: ModuleMixerProps) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [hovered, setHovered] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const totalW = modules.reduce((s, m) => s + m.weight, 0);
  const avg = totalW > 0 ? Math.round(modules.reduce((s, m) => s + m.progress * m.weight, 0) / totalW) : 0;

  return (
    <div className="relative">
      <p className="mb-3 text-[11px]" style={{ color: "var(--text-3)" }}>
        {zh
          ? "上下拖动调整进度 · 双击数字精确输入 · ⋯ 编辑模块信息"
          : "Drag up/down · Double-click for exact value · ⋯ Edit meta"}
      </p>

      {/* Sliders */}
      <div className="flex items-start justify-around" style={{ height: COL_H, position: "relative" }}>
        {modules.map((mod) => (
          <VerticalSlider
            key={mod.key}
            mod={mod}
            active={hovered === null || hovered === mod.key}
            isHovered={hovered === mod.key}
            onHover={setHovered}
            onChange={onModuleChange}
            onMetaUpdate={(patch) => onModuleMeta?.(mod.key, patch)}
            onRemove={onModuleRemove ? () => onModuleRemove(mod.key) : undefined}
            zh={zh}
          />
        ))}
      </div>

      {/* Weighted average bar + Add button */}
      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-xs font-medium" style={{ color: "var(--text-3)" }}>
          {zh ? "加权综合" : "Weighted avg"}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
          <motion.div
            className="h-full rounded-full bg-blue-500"
            animate={{ width: `${avg}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          />
        </div>
        <span className="num shrink-0 text-xs font-bold" style={{ color: "var(--text-1)" }}>{avg}%</span>

        {onModuleAdd && (
          <button
            onClick={() => setShowAddPanel((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors hover:bg-white/8"
            style={{ color: "var(--text-3)" }}
            title={zh ? "添加自定义模块" : "Add custom module"}
          >
            <Plus className="h-3.5 w-3.5" />
            {zh ? "模块" : "Module"}
          </button>
        )}
      </div>

      {/* Add module panel */}
      <AnimatePresence>
        {showAddPanel && (
          <div className="mt-3">
            <AddModulePanel
              onAdd={(data) => { onModuleAdd?.({ ...data, progress: 0 }); }}
              onClose={() => setShowAddPanel(false)}
              zh={zh}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
