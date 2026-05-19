"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface InlineMultilineProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  accentColor?: string;
  rows?: number;
  readOnly?: boolean;
  emptyLabel?: string; // shown as "+ add" button when empty
}

export default function InlineMultiline({
  value,
  onChange,
  placeholder = "点击编辑…",
  className = "",
  accentColor,
  rows = 3,
  readOnly = false,
  emptyLabel,
}: InlineMultilineProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  function startEdit() {
    if (readOnly) return;
    setDraft(value);
    setEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(9999, 9999);
    }, 10);
  }

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  function cancel() { setEditing(false); setDraft(value); }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) commit();
        }}
        rows={rows}
        placeholder={placeholder}
        className={`w-full resize-none rounded-lg px-3 py-2 text-sm outline-none ${className}`}
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--text-1)",
          border: `1px solid ${accentColor ?? "var(--border-color)"}`,
        }}
      />
    );
  }

  if (!value && emptyLabel && !readOnly) {
    return (
      <button
        onClick={startEdit}
        className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
        style={{ color: accentColor ?? "var(--text-3)" }}
      >
        <span>+ {emptyLabel}</span>
      </button>
    );
  }

  return (
    <div
      onClick={startEdit}
      className={`group relative cursor-text rounded-lg px-2 py-1 text-sm leading-relaxed transition-colors hover:bg-white/[0.04] ${className}`}
      style={{ color: value ? "var(--text-2)" : "var(--text-3)" }}
    >
      {value ? (
        <span className="whitespace-pre-wrap">{value}</span>
      ) : (
        <span className="italic">{placeholder}</span>
      )}
      {!readOnly && (
        <Pencil
          className="absolute right-1 top-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40"
          style={{ color: "var(--text-3)" }}
        />
      )}
    </div>
  );
}
