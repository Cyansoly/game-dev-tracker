"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pin, Pencil, Trash2, FolderInput } from "lucide-react";
import type { IdeaCapsule, IdeaCategory } from "@/lib/types";
import { useIdeaStore } from "@/contexts/IdeaStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import IdeaModal from "./IdeaModal";

const CATEGORY_LABELS: Record<IdeaCategory, { zh: string; en: string }> = {
  gameplay:  { zh: "玩法",   en: "Gameplay" },
  art:       { zh: "美术",   en: "Art" },
  story:     { zh: "剧情",   en: "Story" },
  audio:     { zh: "音效",   en: "Audio" },
  tech:      { zh: "技术",   en: "Tech" },
  marketing: { zh: "推广",   en: "Marketing" },
  other:     { zh: "其他",   en: "Other" },
};

interface IdeaCardProps {
  idea: IdeaCapsule;
  index?: number;
}

export default function IdeaCard({ idea, index = 0 }: IdeaCardProps) {
  const { removeIdea, togglePin, moveToProject } = useIdeaStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [editing, setEditing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const catLabel = idea.category ? (zh ? CATEGORY_LABELS[idea.category].zh : CATEGORY_LABELS[idea.category].en) : null;
  const color = idea.color ?? "#3b82f6";

  return (
    <>
      <motion.div
        className="group relative rounded-2xl border p-4 transition-all"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: idea.pinned ? `${color}50` : "var(--border-color)",
          borderLeft: `3px solid ${color}`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        layout
      >
        {/* Pinned indicator */}
        {idea.pinned && (
          <div className="absolute right-3 top-3">
            <Pin className="h-3 w-3" style={{ color }} />
          </div>
        )}

        {/* Content */}
        <div className="mb-3 pr-5">
          <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-1)" }}>
            {idea.title}
          </p>
          {idea.content && (
            <p className="mt-1.5 text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-3)" }}>
              {idea.content}
            </p>
          )}
        </div>

        {/* Category tag */}
        {catLabel && (
          <span
            className="mb-2 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${color}18`,
              color,
              border: `1px solid ${color}30`,
            }}
          >
            {catLabel}
          </span>
        )}

        {/* Footer: date + actions */}
        <div className="flex items-center justify-between">
          <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>
            {idea.createdAt.slice(0, 10)}
          </span>

          {/* Action buttons — appear on hover */}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => togglePin(idea.id)}
              className={cn("flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/10", idea.pinned && "text-amber-400")}
              style={{ color: idea.pinned ? "#eab308" : "var(--text-3)" }}
              title={zh ? "置顶" : "Pin"}
            >
              <Pin className="h-3 w-3" />
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/10"
              style={{ color: "var(--text-3)" }}
              title={zh ? "编辑" : "Edit"}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu((v) => !v)}
                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/10"
                style={{ color: "var(--text-3)" }}
                title={zh ? "移动到项目" : "Move to project"}
              >
                <FolderInput className="h-3 w-3" />
              </button>
              {showMoveMenu && (
                <div
                  className="absolute bottom-full right-0 z-20 mb-1 min-w-[140px] rounded-xl border py-1 shadow-xl"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
                >
                  <button
                    onClick={() => { moveToProject(idea.id, undefined); setShowMoveMenu(false); }}
                    className="w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/6"
                    style={{ color: "var(--text-2)" }}
                  >
                    {zh ? "未归类" : "Uncategorized"}
                  </button>
                  {projects.filter((p) => !p.isArchived).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { moveToProject(idea.id, p.id); setShowMoveMenu(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/6"
                      style={{ color: "var(--text-2)" }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => removeIdea(idea.id)}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-500/10 hover:text-red-400"
              style={{ color: "var(--text-3)" }}
              title={zh ? "删除" : "Delete"}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {editing && (
        <IdeaModal idea={idea} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
