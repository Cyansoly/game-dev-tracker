"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, CheckSquare, GitBranch, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import type { GameProject, ProjectStage, DevMomentum, Platform } from "@/lib/types";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import QuestBar from "@/components/ui/QuestBar";
import ProgressRing from "@/components/ui/ProgressRing";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";
import InlineText from "@/components/inline/InlineText";
import InlineMultiline from "@/components/inline/InlineMultiline";
import InlineSelect from "@/components/inline/InlineSelect";
import InlineTags from "@/components/inline/InlineTags";
import LogModal from "@/components/logs/LogModal";
import TaskModal from "@/components/tasks/TaskModal";
import VersionModal from "@/components/versions/VersionModal";
import { useVersionStore } from "@/contexts/VersionStoreContext";

const PLATFORM_LABELS: Record<Platform, string> = {
  pc: "PC", mac: "Mac", linux: "Linux", switch: "Switch",
  ps5: "PS5", xbox: "Xbox", ios: "iOS", android: "Android", web: "Web",
};
const PLATFORM_EMOJI: Record<Platform, string> = {
  pc: "🖥️", mac: "🍎", linux: "🐧", switch: "🎮",
  ps5: "🎮", xbox: "🎮", ios: "📱", android: "📱", web: "🌐",
};
const ALL_PLATFORMS: Platform[] = ["pc", "mac", "linux", "switch", "ps5", "xbox", "ios", "android", "web"];

const STAGE_OPTIONS = (zh: boolean): { value: ProjectStage; label: string; color: string }[] => [
  { value: "concept", label: zh ? "概念期" : "Concept", color: "#71717a" },
  { value: "prototype", label: zh ? "原型期" : "Prototype", color: "#a855f7" },
  { value: "production", label: zh ? "开发中" : "Production", color: "#3b82f6" },
  { value: "polish", label: zh ? "打磨期" : "Polish", color: "#06b6d4" },
  { value: "released", label: zh ? "已发布" : "Released", color: "#22c55e" },
  { value: "paused", label: zh ? "已暂停" : "Paused", color: "#6b7280" },
];

const MOMENTUM_OPTIONS = (zh: boolean): { value: DevMomentum; label: string; color: string }[] => [
  { value: "idle", label: zh ? "🌙 搁置中" : "🌙 Idle", color: "#71717a" },
  { value: "steady", label: zh ? "🌊 稳步推进" : "🌊 Steady", color: "#60a5fa" },
  { value: "active", label: zh ? "⚡ 高度活跃" : "⚡ Active", color: "#4ade80" },
  { value: "crunch", label: zh ? "🔥 全力攻关" : "🔥 Crunch", color: "#fb923c" },
];

interface ProjectHeaderProps {
  project: GameProject;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { updateProjectField, updateOverallProgress, deleteProject } = useProjectStore();
  const { addVersion } = useVersionStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showMore, setShowMore] = useState(false);

  function field<K extends keyof GameProject>(key: K) {
    return (val: GameProject[K]) => updateProjectField(project.id, key, val);
  }

  function handleDeleteProject() {
    const ok = window.confirm(
      zh
        ? `确定要删除「${project.name}」吗？这个操作不能撤销。`
        : `Delete "${project.name}"? This cannot be undone.`
    );

    if (!ok) return;

    deleteProject(project.id);
    setShowMore(false);
    router.push("/projects");
  }

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
    >
      {/* Accent line */}
      <div
        className="absolute left-0 top-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${project.coverColor}, transparent 60%)` }}
      />
      {/* BG glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${project.coverColor}, transparent)`, filter: "blur(40px)" }}
      />

      <div className="relative px-6 pb-5 pt-5">
        {/* ── Row 1: Icon + Name + Version + Stage + Risk + ActionStrip ── */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {/* Icon */}
              <InlineText
                value={project.icon ?? "🎮"}
                onChange={field("icon")}
                size="xl"
                className="!px-0 text-2xl"
                inputClassName="w-14 text-center text-2xl"
              />
              {/* Name */}
              <InlineText
                value={project.name}
                onChange={field("name")}
                size="xl"
                accentColor={project.coverColor}
              />
              {/* Version */}
              <InlineText
                value={project.currentVersion}
                onChange={field("currentVersion")}
                size="sm"
                className="num !font-semibold"
                inputClassName="w-20 text-center"
                accentColor={project.coverColor}
              />
              {/* Stage */}
              <InlineSelect
                value={project.stage}
                options={STAGE_OPTIONS(zh)}
                onChange={field("stage")}
                accentColor={project.coverColor}
              />
              {/* Momentum */}
              <InlineSelect
                value={project.momentum}
                options={MOMENTUM_OPTIONS(zh)}
                onChange={field("momentum")}
                accentColor={project.coverColor}
              />
            </div>

            {/* Tagline */}
            <InlineText
              value={project.tagline ?? ""}
              onChange={field("tagline")}
              placeholder={zh ? "+ 添加一句话描述" : "+ Add tagline"}
              size="md"
              className="text-sm"
              accentColor={project.coverColor}
            />
          </div>

          {/* ActionStrip */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ProgressRing
              progress={project.overallProgress}
              size={80}
              strokeWidth={6}
              color={project.coverColor}
              showLabel
              labelSize="lg"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/8"
                style={{ color: project.coverColor }}
                title={zh ? "快速记录日志" : "Quick log"}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {zh ? "日志" : "Log"}
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/8"
                style={{ color: project.coverColor }}
                title={zh ? "快速新建任务" : "Quick task"}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {zh ? "任务" : "Task"}
              </button>
              <button
                onClick={() => setShowVersionModal(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/8"
                style={{ color: project.coverColor }}
                title={zh ? "记录新版本" : "New version"}
              >
                <GitBranch className="h-3.5 w-3.5" />
                {zh ? "版本" : "Ver"}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMore((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/8"
                  style={{ color: "var(--text-3)" }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl shadow-xl"
                      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                    >
                      <button
                        onClick={() => { updateProjectField(project.id, "isArchived", !project.isArchived); setShowMore(false); }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/8"
                        style={{ color: "var(--text-2)" }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        {project.isArchived ? (zh ? "取消归档" : "Unarchive") : (zh ? "归档项目" : "Archive")}
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs hover:bg-red-500/10"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {zh ? "删除项目" : "Delete project"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Description ── */}
        <div className="mt-3">
          <InlineMultiline
            value={project.description}
            onChange={field("description")}
            placeholder={zh ? "点击添加项目描述…" : "Click to add description…"}
            accentColor={project.coverColor}
            rows={2}
            emptyLabel={zh ? "添加项目描述" : "Add description"}
          />
        </div>

        {/* ── Row 3: Genre + Platforms + Engine ── */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "类型" : "Genre"}</span>
            <InlineText
              value={project.genre}
              onChange={field("genre")}
              size="sm"
              accentColor={project.coverColor}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "引擎" : "Engine"}</span>
            <InlineText
              value={project.engine ?? ""}
              onChange={field("engine")}
              placeholder={zh ? "+ 引擎" : "+ Engine"}
              size="sm"
              accentColor={project.coverColor}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "平台" : "Platforms"}</span>
            <div className="flex flex-wrap gap-1">
              {ALL_PLATFORMS.map((p) => {
                const selected = project.platforms?.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => {
                      const cur = project.platforms ?? [];
                      field("platforms")(selected ? cur.filter((x) => x !== p) : [...cur, p]);
                    }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
                    style={{
                      backgroundColor: selected ? `${project.coverColor}22` : "var(--bg-raised)",
                      color: selected ? project.coverColor : "var(--text-3)",
                      border: `1px solid ${selected ? `${project.coverColor}40` : "var(--border-color)"}`,
                    }}
                    title={PLATFORM_LABELS[p]}
                  >
                    {PLATFORM_EMOJI[p]} {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 4: Dates + Team ── */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "立项" : "Started"}</span>
            <input
              type="date"
              value={project.startedAt ?? ""}
              onChange={(e) => field("startedAt")(e.target.value || undefined)}
              className="num rounded border px-1.5 py-0.5 text-[11px] outline-none"
              style={{ backgroundColor: "transparent", borderColor: "var(--border-color)", color: "var(--text-2)" }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "目标发布" : "Target"}</span>
            <input
              type="date"
              value={project.targetReleaseDate ?? ""}
              onChange={(e) => field("targetReleaseDate")(e.target.value || undefined)}
              className="num rounded border px-1.5 py-0.5 text-[11px] outline-none"
              style={{ backgroundColor: "transparent", borderColor: "var(--border-color)", color: "var(--text-2)" }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{zh ? "角色" : "Role"}</span>
            <InlineText
              value={project.role ?? ""}
              onChange={field("role")}
              placeholder={zh ? "+ 我的角色" : "+ My role"}
              size="sm"
              accentColor={project.coverColor}
            />
          </div>
        </div>

        {/* ── Row 5: Tags ── */}
        <div className="mt-3">
          <InlineTags
            tags={project.tags ?? []}
            onChange={field("tags")}
            placeholder={zh ? "添加标签" : "Add tag"}
            accentColor={project.coverColor}
          />
        </div>

        {/* ── Row 6: QuestBar overall progress ── */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
              {zh ? "总进度" : "Overall progress"}
            </span>
          </div>
          <QuestBar
            value={project.overallProgress}
            onChange={(v) => updateOverallProgress(project.id, v)}
            color={project.coverColor}
            zh={zh}
            showLabel
          />
        </div>
      </div>

      {/* Modals */}
      {showLogModal && (
        <LogModal defaultProjectId={project.id} onClose={() => setShowLogModal(false)} />
      )}
      {showTaskModal && (
        <TaskModal defaultProjectId={project.id} onClose={() => setShowTaskModal(false)} />
      )}
      {showVersionModal && (
        <VersionModal
          projectId={project.id}
          defaultVersion={project.currentVersion}
          onClose={() => setShowVersionModal(false)}
          onSave={(data) => { addVersion(data); }}
        />
      )}
    </div>
  );
}
