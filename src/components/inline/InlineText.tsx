"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface InlineTextProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  readOnly?: boolean;
}

const sizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-2xl font-bold",
};

export default function InlineText({
  value,
  onChange,
  placeholder = "点击编辑…",
  className = "",
  inputClassName = "",
  accentColor,
  size = "md",
  readOnly = false,
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  function startEdit() {
    if (readOnly) return;
    setDraft(value);
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
  }

  function commit() {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim());
  }

  function cancel() { setDiting(false); setDraft(value); }

  // eslint-disable-next-line
  function setDiting(v: boolean) { setEditing(v); }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        className={`rounded px-1 outline-none ${sizeMap[size]} ${inputClassName}`}
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--text-1)",
          border: `1px solid ${accentColor ?? "var(--border-color)"}`,
          minWidth: 60,
          width: Math.max(120, draft.length * 10),
        }}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className={`group relative inline-flex cursor-text items-center gap-1 rounded px-1 transition-colors hover:bg-white/5 ${sizeMap[size]} ${className}`}
      style={{ color: value ? "var(--text-1)" : "var(--text-3)" }}
      title={readOnly ? undefined : "点击编辑"}
    >
      {value || placeholder}
      {!readOnly && (
        <Pencil
          className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-50"
          style={{ color: "var(--text-3)" }}
        />
      )}
    </span>
  );
}
