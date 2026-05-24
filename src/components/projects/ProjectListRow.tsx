"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Archive, ExternalLink, Trash2 } from "lucide-react";
import type { GameProject } from "@/lib/types";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { cn } from "@/lib/cn";

interface ProjectListRowProps {
  project: GameProject;
  index: number;
}

export default function ProjectListRow({ project, index }: ProjectListRowProps) {
  const { t, lang } = useLanguage();
  const { updateProjectField, deleteProject } = useProjectStore();

  const zh = lang === "zh";

  function handleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    updateProjectField(project.id, "isArchived", !project.isArchived);
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm(
      zh
        ? `确定要删除「${project.name}」吗？这个操作不能撤销。`
        : `Delete "${project.name}"? This cannot be undone.`
    );

    if (!ok) return;

    deleteProject(project.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group grid grid-cols-[minmax(0,2fr)_120px_100px_160px_100px_100px_110px] items-center gap-4 rounded-xl border px-4 py-3 text-sm transition-colors hover:bg-white/5"
      )}
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {/* Color dot + Name */}
      <Link
        href={`/projects/${project.slug}`}
        className="flex min-w-0 items-center gap-3"
      >
        <div
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: project.coverColor }}
        />

        <div className="min-w-0">
          <div
            className="truncate font-medium"
            style={{ color: "var(--text-1)" }}
          >
            {project.name}
          </div>

          <div
            className="truncate text-xs"
            style={{ color: "var(--text-3)" }}
          >
            {project.genre}
          </div>
        </div>

        <ExternalLink
          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60"
          style={{ color: "var(--text-3)" }}
        />
      </Link>

      {/* Stage */}
      <div>
        <StageBadge stage={project.stage} />
      </div>

      {/* Version */}
      <div style={{ color: "var(--text-2)" }}>
        {project.currentVersion}
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="mb-1 flex justify-between text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          <span>{t.detail.overall}</span>
          <span>{project.overallProgress}%</span>
        </div>

        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--bg-raised)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${project.overallProgress}%`,
              backgroundColor: project.coverColor,
            }}
          />
        </div>
      </div>

      {/* Momentum */}
      <div>
        <MomentumBadge momentum={project.momentum} />
      </div>

      {/* Updated */}
      <div
        className="text-xs"
        style={{ color: "var(--text-3)" }}
      >
        {project.updatedAt.slice(5)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleArchive}
          className="rounded-lg border px-2 py-1 text-[11px] transition-colors hover:bg-white/10"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-2)",
          }}
          title={project.isArchived ? "取消归档" : "归档项目"}
        >
          <Archive className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg border px-2 py-1 text-[11px] transition-colors hover:bg-red-500/10"
          style={{
            borderColor: "rgba(239,68,68,0.35)",
            color: "#ef4444",
          }}
          title="删除项目"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}