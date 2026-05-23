"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProject, DevLog, Task, VersionRecord } from "@/lib/types";
import GlowCard from "@/components/ui/GlowCard";
import ModuleMixer from "@/components/ui/ModuleMixer";
import VersionTimeline from "./VersionTimeline";
import RecentLogs from "@/components/dashboard/RecentLogs";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";
import InlineMultiline from "@/components/inline/InlineMultiline";
import InlineLinks from "@/components/inline/InlineLinks";
import LogModal from "@/components/logs/LogModal";
import type { DevLog as DevLogType } from "@/lib/types";
import { LayoutGrid, BookOpen, GitBranch, CheckSquare, ChevronRight, Plus, Link2, Lightbulb, Zap } from "lucide-react";
import IdeaCard from "@/components/inspirations/IdeaCard";
import IdeaModal from "@/components/inspirations/IdeaModal";
import { useIdeaStore } from "@/contexts/IdeaStoreContext";

type TabId = "overview" | "logs" | "board" | "versions" | "ideas";

interface ProjectDetailTabsProps {
  project: GameProject;
  logs: DevLog[];
  tasks: Task[];
  versions: VersionRecord[];
}

export default function ProjectDetailTabs({ project, logs, tasks, versions }: ProjectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { t, lang } = useLanguage();
  const zh = lang === "zh";
  const { tasks: storeTasks } = useTaskStore();
  const { updateModuleProgress, updateProjectField, addCustomModule, removeModule, updateModuleMeta, addProjectLink, removeProjectLink } = useProjectStore();
  const d = t.detail;

  const [showLogModal, setShowLogModal] = useState(false);
  const [editLog, setEditLog] = useState<DevLogType | null>(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const { ideas } = useIdeaStore();
  const projectIdeas = ideas.filter((i) => i.projectId === project.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const projectTasks = storeTasks.filter((t) => t.projectId === project.id);

  function field<K extends keyof GameProject>(key: K) {
    return (val: GameProject[K]) => updateProjectField(project.id, key, val);
  }

  const TABS = [
    { id: "overview" as TabId,  label: d.overview,  icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "logs" as TabId,      label: d.devLogs,   icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "board" as TabId,     label: d.board,     icon: <CheckSquare className="h-3.5 w-3.5" /> },
    { id: "versions" as TabId,  label: d.versions,  icon: <GitBranch className="h-3.5 w-3.5" /> },
    { id: "ideas" as TabId,     label: d.ideas,     icon: <Lightbulb className="h-3.5 w-3.5" /> },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        className="mb-5 flex gap-0.5 rounded-xl border p-1"
        style={{ borderColor: "var(--border-color)", backgroundColor: "rgba(128,128,128,0.04)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: activeTab === tab.id ? "var(--text-1)" : "var(--text-3)" }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="detail-tab-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: "var(--bg-raised)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}{tab.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Left: Module progress */}
              <GlowCard className="lg:col-span-2">
                <h4 className="mb-1 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                  {d.devProgress}
                </h4>
                <ModuleMixer
                  modules={project.progressModules}
                  projectId={project.id}
                  onModuleChange={(key, val) => updateModuleProgress(project.id, key, val)}
                  onModuleMeta={(key, patch) => updateModuleMeta(project.id, key, patch)}
                  onModuleAdd={(data) => addCustomModule(project.id, { ...data })}
                  onModuleRemove={(key) => removeModule(project.id, key)}
                />
              </GlowCard>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                {/* Next steps */}
                <GlowCard>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    <ChevronRight className="h-3 w-3" />{d.nextSteps}
                  </h4>
                  <InlineMultiline
                    value={project.nextPlan ?? ""}
                    onChange={field("nextPlan")}
                    placeholder={zh ? "点击编辑下一步计划…" : "Click to edit next steps…"}
                    accentColor={project.coverColor}
                    rows={3}
                    emptyLabel={zh ? "添加下一步计划" : "Add next steps"}
                  />
                </GlowCard>

                {/* Tech stack */}
                <GlowCard>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    {d.techStack}
                  </h4>
                  <InlineMultiline
                    value={project.techStackNotes ?? ""}
                    onChange={field("techStackNotes")}
                    placeholder={zh ? "Unity · C# · DOTween…" : "Unity · C# · DOTween…"}
                    accentColor={project.coverColor}
                    rows={2}
                    emptyLabel={zh ? "添加技术栈备注" : "Add tech stack notes"}
                  />
                </GlowCard>

                {/* Quick stats */}
                <GlowCard>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    {d.quickStats}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: d.logsCount,     value: logs.length,                                            color: "var(--text-1)" },
                      { label: d.tasksCount,    value: projectTasks.length,                                    color: "var(--text-1)" },
                      { label: d.doneCount,     value: projectTasks.filter((t) => t.status === "done").length, color: "#22c55e" },
                      { label: d.versionsCount, value: versions.length,                                        color: "var(--text-1)" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{label}</p>
                        <p className="num text-lg font-bold" style={{ color }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </div>

              {/* ── Second row: Pitch + References + Links ── */}
              <GlowCard>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  <Zap className="h-3 w-3" />{zh ? "推介词" : "Pitch"}
                </h4>
                <InlineMultiline
                  value={project.pitch ?? ""}
                  onChange={field("pitch")}
                  placeholder={zh ? "用两三句话描述游戏的卖点…" : "Describe your game's selling points…"}
                  accentColor={project.coverColor}
                  rows={3}
                  emptyLabel={zh ? "添加推介词" : "Add pitch"}
                />
              </GlowCard>

              <GlowCard>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  <Lightbulb className="h-3 w-3" />{zh ? "灵感与参考" : "References"}
                </h4>
                <InlineMultiline
                  value={project.references ?? ""}
                  onChange={field("references")}
                  placeholder={zh ? "Hades, Dead Cells, Binding of Isaac…" : "Hades, Dead Cells, Binding of Isaac…"}
                  accentColor={project.coverColor}
                  rows={3}
                  emptyLabel={zh ? "添加参考作品" : "Add references"}
                />
              </GlowCard>

              <GlowCard>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  <Link2 className="h-3 w-3" />{zh ? "相关链接" : "Links"}
                </h4>
                <InlineLinks
                  links={project.links ?? []}
                  onChange={(links) => updateProjectField(project.id, "links", links)}
                  accentColor={project.coverColor}
                />
              </GlowCard>
            </div>
          )}

          {/* ── Logs ── */}
          {activeTab === "logs" && (
            <GlowCard>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                  {d.logsOf} ({logs.length})
                </h4>
                <button
                  onClick={() => { setEditLog(null); setShowLogModal(true); }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: project.coverColor }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {zh ? "新建日志" : "New Log"}
                </button>
              </div>
              {logs.length > 0 ? (
                <RecentLogs
                  logs={logs}
                  onLogClick={(log) => { setEditLog(log); setShowLogModal(true); }}
                />
              ) : (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>
                  {d.noLogsYet}
                </p>
              )}
            </GlowCard>
          )}

          {/* ── Board ── */}
          {activeTab === "board" && (
            <GlowCard>
              <h4 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                {d.boardOf}
              </h4>
              <TaskKanbanBoard projectId={project.id} />
            </GlowCard>
          )}

          {/* ── Versions ── */}
          {activeTab === "versions" && (
            <GlowCard>
              <h4 className="mb-5 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                {d.versionHistory}
              </h4>
              {versions.length > 0 ? (
                <VersionTimeline versions={versions} accentColor={project.coverColor} />
              ) : (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>
                  {d.noVersionsYet}
                </p>
              )}
            </GlowCard>
          )}

          {/* ── Ideas ── */}
          {activeTab === "ideas" && (
            <GlowCard>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                  {d.ideasOf} ({projectIdeas.length})
                </h4>
                <button
                  onClick={() => setShowIdeaModal(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: project.coverColor }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {d.addIdea}
                </button>
              </div>
              {projectIdeas.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {projectIdeas.map((idea, i) => (
                    <IdeaCard key={idea.id} idea={idea} index={i} />
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>
                  {d.noIdeasYet}
                </p>
              )}
            </GlowCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Log modal */}
      {showLogModal && (
        <LogModal
          log={editLog}
          defaultProjectId={project.id}
          onClose={() => { setShowLogModal(false); setEditLog(null); }}
        />
      )}

      {/* Idea modal */}
      {showIdeaModal && (
        <IdeaModal
          defaultProjectId={project.id}
          onClose={() => setShowIdeaModal(false)}
        />
      )}
    </div>
  );
}
