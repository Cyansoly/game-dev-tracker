"use client";

import { useState, useRef } from "react";
import { Plus, Lightbulb } from "lucide-react";
import { useIdeaStore } from "@/contexts/IdeaStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickCaptureBarProps {
  defaultProjectId?: string;
  onExpand?: () => void;
}

export default function QuickCaptureBar({ defaultProjectId, onExpand }: QuickCaptureBarProps) {
  const { addIdea } = useIdeaStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [value, setValue] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    addIdea({ title: trimmed, content: "", projectId, category: "gameplay", pinned: false });
    setValue("");
    inputRef.current?.focus();
  }

  const active = projects.filter((p) => !p.isArchived);

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <Lightbulb className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
        }}
        placeholder={zh ? "随手记录一个灵感，回车保存…" : "Capture an idea, press Enter to save…"}
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: "var(--text-1)" }}
      />
      {active.length > 0 && (
        <select
          value={projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || undefined)}
          className="rounded-md border px-2 py-1 text-xs outline-none"
          style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-color)", color: "var(--text-2)" }}
        >
          <option value="">{zh ? "未归类" : "No project"}</option>
          {active.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      {onExpand && (
        <button
          onClick={onExpand}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: "var(--text-3)" }}
          title={zh ? "展开详情" : "Add details"}
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
