"use client";

import { useState } from "react";
import { Gamepad2, Plus, LayoutGrid, List, ChevronDown } from "lucide-react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectListRow from "@/components/projects/ProjectListRow";
import ProjectModal from "@/components/projects/ProjectModal";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

type ViewMode = "grid" | "list";

export default function ProjectsPage() {
  const { t } = useLanguage();
  const { projects } = useProjectStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  const active = projects.filter((p) => !p.isArchived);
  const filtered =
    stageFilter === "all" ? active : active.filter((p) => p.stage === stageFilter);

  const stageStyle: Record<string, string> = {
    concept:    "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
    prototype:  "bg-purple-500/8 text-purple-400 border-purple-500/20",
    production: "bg-blue-500/8 text-blue-400 border-blue-500/20",
    polish:     "bg-cyan-500/8 text-cyan-400 border-cyan-500/20",
    released:   "bg-green-500/8 text-green-400 border-green-500/20",
    paused:     "bg-zinc-700/40 text-zinc-500 border-zinc-700/30",
  };

  return (
    <AnimatedPageWrapper className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
            {t.projects.title}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {active.length} {t.projects.activeCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-1"
            style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                viewMode === "grid" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="格子视图"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                viewMode === "list" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="列表视图"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            {t.projects.newProject}
          </button>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStageFilter("all")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
            stageFilter === "all"
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-transparent bg-zinc-800/40 text-zinc-500 hover:text-zinc-400"
          )}
        >
          {t.projects.title === "项目" ? "全部" : "All"}
          <span className="num rounded-full bg-white/10 px-1.5 py-0 text-[10px]">{active.length}</span>
        </button>

        {(["concept", "prototype", "production", "polish", "released", "paused"] as const).map((stage) => {
          const count = active.filter((p) => p.stage === stage).length;
          if (count === 0) return null;
          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                stageStyle[stage],
                stageFilter === stage && "ring-2 ring-blue-500/30 ring-offset-1 ring-offset-transparent"
              )}
            >
              {t.stages[stage]}
              <span className="num rounded-full bg-white/10 px-1.5 py-0 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {/* List header */}
            <div
              className="mb-2 grid grid-cols-1 px-4 text-xs font-medium"
              style={{ color: "var(--text-3)" }}
            >
              <div className="hidden items-center gap-4 sm:grid"
                style={{
                  gridTemplateColumns: "1fr 112px 64px 128px 80px 96px",
                }}>
                <span>{t.projects.title === "项目" ? "项目" : "Project"}</span>
                <span>{t.projects.title === "项目" ? "阶段" : "Stage"}</span>
                <span>{t.projects.title === "项目" ? "版本" : "Version"}</span>
                <span>{t.projects.title === "项目" ? "进度" : "Progress"}</span>
                <span className="hidden lg:block">{t.projects.title === "项目" ? "风险" : "Risk"}</span>
                <span className="hidden text-right lg:block">{t.projects.title === "项目" ? "更新" : "Updated"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {filtered.map((project, i) => (
                <ProjectListRow key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--bg-raised)" }}>
            <Gamepad2 className="h-6 w-6" style={{ color: "var(--text-3)" }} />
          </div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>{t.projects.noProjects}</h3>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-3)" }}>{t.projects.noProjectsDesc}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            {t.projects.newProject}
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} />
      )}
    </AnimatedPageWrapper>
  );
}
