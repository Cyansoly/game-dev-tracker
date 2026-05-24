"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Archive, CalendarDays, Tag, Trash2 } from "lucide-react";
import type { GameProject, Platform } from "@/lib/types";
import ProgressRing from "@/components/ui/ProgressRing";
import HPBar from "@/components/ui/HPBar";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";

const PLATFORM_EMOJI: Record<Platform, string> = {
  pc: "🖥️",
  mac: "🍎",
  linux: "🐧",
  switch: "🎮",
  ps5: "🎮",
  xbox: "🎮",
  ios: "📱",
  android: "🤖",
  web: "🌐",
};

const PLATFORM_SHORT: Record<Platform, string> = {
  pc: "PC",
  mac: "Mac",
  linux: "NSW",
  switch: "NSW",
  ps5: "PS5",
  xbox: "XBX",
  ios: "iOS",
  android: "APK",
  web: "Web",
};

interface ProjectCardProps {
  project: GameProject;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {/* Top color bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: project.coverColor }}
      />

      {/* Action buttons */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        <button
          type="button"
          onClick={handleArchive}
          className="rounded-lg border px-2 py-1 text-[11px] transition-colors hover:bg-white/10"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-card)",
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
            backgroundColor: "var(--bg-card)",
            color: "#ef4444",
          }}
          title="删除项目"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Link
        href={`/projects/${project.slug}`}
        className="block p-5"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4 pr-16">
          <div className="flex min-w-0 items-start gap-3">
            {project.icon && (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{
                  backgroundColor: `${project.coverColor}22`,
                }}
              >
                {project.icon}
              </div>
            )}

            <div className="min-w-0">
              <h3
                className="truncate text-base font-semibold"
                style={{ color: "var(--text-1)" }}
              >
                {project.name}
              </h3>

              <div
                className="mt-1 flex flex-wrap items-center gap-2 text-xs"
                style={{ color: "var(--text-3)" }}
              >
                <span>{project.currentVersion}</span>
                <StageBadge stage={project.stage} />
                <MomentumBadge momentum={project.momentum} />
              </div>
            </div>
          </div>

          <ProgressRing
            progress={project.overallProgress}
            size={48}
            strokeWidth={5}
            color={project.coverColor}
          />
        </div>

        {/* Tagline */}
        {project.tagline && (
          <p
            className="mb-3 line-clamp-1 text-sm font-medium"
            style={{ color: "var(--text-2)" }}
          >
            {project.tagline}
          </p>
        )}

        <div
          className="mb-3 flex flex-wrap items-center gap-2 text-xs"
          style={{ color: "var(--text-3)" }}
        >
          <span>{project.genre}</span>

          {project.platforms && project.platforms.length > 0 && (
            <>
              <span>·</span>
              {project.platforms.slice(0, 3).map((p) => (
                <span key={p} title={PLATFORM_SHORT[p]}>
                  {PLATFORM_EMOJI[p]}
                </span>
              ))}
              {project.platforms.length > 3 && (
                <span>+{project.platforms.length - 3}</span>
              )}
            </>
          )}
        </div>

        {/* Description */}
        <p
          className="mb-4 line-clamp-2 min-h-[40px] text-sm leading-5"
          style={{ color: "var(--text-3)" }}
        >
          {project.description}
        </p>

        {/* Module Bars */}
        <div className="mb-4 space-y-2">
          {project.progressModules.slice(0, 4).map((mod) => (
            <div key={mod.key}>
              <div
                className="mb-1 flex justify-between text-[11px]"
                style={{ color: "var(--text-3)" }}
              >
                <span>
                  {t.modules[mod.key as keyof typeof t.modules] ?? mod.label}
                </span>
                <span>{mod.progress}%</span>
              </div>

              <HPBar
                value={mod.progress}
                color={project.coverColor}
                height={5}
              />
            </div>
          ))}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-3)",
                }}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: "var(--text-3)" }}
        >
          <div className="flex items-center gap-1.5">
            {project.targetReleaseDate && (
              <>
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(project.targetReleaseDate).toLocaleDateString(
                  lang === "zh" ? "zh-CN" : "en-US",
                  {
                    year: "numeric",
                    month: "short",
                  }
                )}
              </>
            )}
          </div>

          <span>
            {new Date(project.updatedAt).toLocaleDateString(
              lang === "zh" ? "zh-CN" : "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}