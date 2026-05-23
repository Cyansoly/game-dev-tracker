"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Pin } from "lucide-react";
import type { IdeaCapsule, IdeaCategory } from "@/lib/types";
import { useIdeaStore } from "@/contexts/IdeaStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

const CATEGORY_LABELS: Record<IdeaCategory, { zh: string; en: string }> = {
  gameplay:  { zh: "玩法",   en: "Gameplay" },
  art:       { zh: "美术",   en: "Art" },
  story:     { zh: "剧情",   en: "Story" },
  audio:     { zh: "音效",   en: "Audio" },
  tech:      { zh: "技术",   en: "Tech" },
  marketing: { zh: "推广",   en: "Marketing" },
  other:     { zh: "其他",   en: "Other" },
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as IdeaCategory[];

const PRESET_COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#eab308", "#ec4899"];

interface IdeaModalProps {
  idea?: IdeaCapsule | null;
  defaultProjectId?: string;
  onClose: () => void;
}

export default function IdeaModal({ idea, defaultProjectId, onClose }: IdeaModalProps) {
  const { addIdea, updateIdea } = useIdeaStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const isEdit = !!idea;

  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const [category, setCategory] = useState<IdeaCategory>("gameplay");
  const [color, setColor]     = useState(PRESET_COLORS[0]);
  const [pinned, setPinned]   = useState(false);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setContent(idea.content);
      setProjectId(idea.projectId);
      setCategory(idea.category ?? "gameplay");
      setColor(idea.color ?? PRESET_COLORS[0]);
      setPinned(idea.pinned ?? false);
    }
  }, [idea]);

  function handleSave() {
    if (!title.trim()) return;
    const data = { title: title.trim(), content, projectId, category, color, pinned };
    if (isEdit && idea) {
      updateIdea(idea.id, data);
    } else {
      addIdea(data);
    }
    onClose();
  }

  const active = projects.filter((p) => !p.isArchived);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl shadow-2xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <span className="font-semibold" style={{ color: "var(--text-1)" }}>
              {isEdit ? (zh ? "编辑灵感" : "Edit Idea") : (zh ? "新建灵感" : "New Idea")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPinned((v) => !v)}
                className={cn("flex h-7 w-7 items-center justify-center rounded-lg transition-colors", pinned ? "text-amber-400 bg-amber-400/10" : "hover:bg-white/8")}
                style={{ color: pinned ? "#eab308" : "var(--text-3)" }}
                title={pinned ? (zh ? "取消置顶" : "Unpin") : (zh ? "置顶" : "Pin")}
              >
                <Pin className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/8" style={{ color: "var(--text-3)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "标题 *" : "Title *"}
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
                placeholder={zh ? "一个好点子…" : "A great idea…"}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "详细描述" : "Description"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder={zh ? "展开描述这个灵感…" : "Expand on this idea…"}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "分类" : "Category"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                      category === cat ? "ring-2 ring-blue-500/40" : "opacity-60 hover:opacity-80"
                    )}
                    style={{
                      backgroundColor: category === cat ? `${color}22` : "var(--bg-raised)",
                      color: category === cat ? color : "var(--text-2)",
                      border: `1px solid ${category === cat ? `${color}40` : "var(--border-color)"}`,
                    }}
                  >
                    {zh ? CATEGORY_LABELS[cat].zh : CATEGORY_LABELS[cat].en}
                  </button>
                ))}
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "归属项目（可选）" : "Assign to project (optional)"}
              </label>
              <select
                value={projectId ?? ""}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              >
                <option value="">{zh ? "未归类" : "Uncategorized"}</option>
                {active.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "标签色" : "Color"}
              </label>
              <div className="flex gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn("h-6 w-6 rounded-full border-2 transition-transform hover:scale-110", color === c ? "border-white" : "border-transparent")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border-color)" }}>
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/8" style={{ color: "var(--text-2)" }}>
              {zh ? "取消" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              {isEdit ? (zh ? "保存" : "Save") : (zh ? "创建灵感" : "Create")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
