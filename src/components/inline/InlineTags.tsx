"use client";

import { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InlineTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  accentColor?: string;
  readOnly?: boolean;
  renderTag?: (tag: string) => React.ReactNode;
  maxTags?: number;
}

export default function InlineTags({
  tags,
  onChange,
  placeholder = "添加标签",
  accentColor,
  readOnly = false,
  renderTag,
  maxTags = 20,
}: InlineTagsProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startAdd() {
    if (readOnly || tags.length >= maxTags) return;
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function commitAdd() {
    const val = draft.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setDraft("");
    setAdding(false);
  }

  function removeTag(tag: string) {
    if (readOnly) return;
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            className="group flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: accentColor ? `${accentColor}18` : "var(--bg-raised)",
              color: accentColor ?? "var(--text-2)",
              border: `1px solid ${accentColor ? `${accentColor}30` : "var(--border-color)"}`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
          >
            {renderTag ? renderTag(tag) : tag}
            {!readOnly && (
              <button
                onClick={() => removeTag(tag)}
                className="opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>

      {adding ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commitAdd(); }
            if (e.key === "Escape") { setAdding(false); setDraft(""); }
          }}
          placeholder={placeholder}
          className="rounded-full px-2.5 py-1 text-[11px] outline-none"
          style={{
            backgroundColor: "var(--input-bg)",
            color: "var(--text-1)",
            border: `1px solid ${accentColor ?? "var(--border-color)"}`,
            width: 100,
          }}
        />
      ) : (
        !readOnly && tags.length < maxTags && (
          <button
            onClick={startAdd}
            className="flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] transition-colors hover:bg-white/8"
            style={{ color: "var(--text-3)" }}
          >
            <Plus className="h-3 w-3" />
            {placeholder}
          </button>
        )
      )}
    </div>
  );
}
