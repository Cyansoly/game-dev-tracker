"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Trash2, ChevronDown, Calendar, Tag as TagIcon,
  Folder, AlignLeft, Clock, AlertCircle,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

/* ─── Config ─── */
interface StatusConfig { label: string; color: string; bg: string; dot: string }
const STATUS_CFG = (zh: boolean): Record<TaskStatus, StatusConfig> => ({
  todo:        { label: zh ? "待办"   : "Todo",        color: "#71717a", bg: "rgba(113,113,122,0.12)", dot: "#52525b" },
  in_progress: { label: zh ? "进行中" : "In Progress",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  dot: "#3b82f6" },
  review:      { label: zh ? "待审核" : "Review",       color: "#a78bfa", bg: "rgba(167,139,250,0.12)", dot: "#8b5cf6" },
  done:        { label: zh ? "已完成" : "Done",         color: "#4ade80", bg: "rgba(74,222,128,0.12)",  dot: "#22c55e" },
});
interface PriorityConfig { label: string; color: string; bg: string; icon: string }
const PRIORITY_CFG = (zh: boolean): Record<TaskPriority, PriorityConfig> => ({
  low:    { label: zh ? "低"   : "Low",    color: "#71717a", bg: "rgba(113,113,122,0.1)", icon: "▪" },
  medium: { label: zh ? "中"   : "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: "▪▪" },
  high:   { label: zh ? "高"   : "High",   color: "#f97316", bg: "rgba(249,115,22,0.1)",  icon: "▪▪▪" },
  urgent: { label: zh ? "紧急" : "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: "!!!" },
});

const ALL_TAGS = ["coding", "bugfix", "art", "design", "level", "audio", "balance", "planning"];

/* ─── Inline dropdown ─── */
function PropDropdown<T extends string>({
  options, value, onChange,
  renderItem, renderValue,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  renderItem: (v: T) => React.ReactNode;
  renderValue: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/8"
      >
        {renderValue(value)}
        <ChevronDown className="h-3 w-3 opacity-40" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl shadow-2xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-white/8"
              >
                {opt === value && <Check className="h-3 w-3 shrink-0 text-blue-400" />}
                {opt !== value && <span className="h-3 w-3 shrink-0" />}
                {renderItem(opt)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tag chip with add/remove ─── */
function TagsEditor({ tags, onChange, zh }: { tags: string[]; onChange: (t: string[]) => void; zh: boolean }) {
  const [addOpen, setAddOpen] = useState(false);
  const available = ALL_TAGS.filter((t) => !tags.includes(t));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tags.filter((t) => t !== tag))}
          className="group flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors hover:border-red-500/30 hover:bg-red-500/5"
          style={{ borderColor: "var(--border-color)", color: "var(--text-2)" }}
        >
          {tag}
          <X className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
        </button>
      ))}
      {available.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-[11px] transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border-color)", color: "var(--text-3)" }}
          >
            + {zh ? "标签" : "tag"}
          </button>
          <AnimatePresence>
            {addOpen && (
              <motion.div
                className="absolute left-0 top-full z-50 mt-1 flex flex-wrap gap-1 rounded-xl p-2 shadow-xl"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", minWidth: 180 }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {available.map((t) => (
                  <button
                    key={t}
                    onClick={() => { onChange([...tags, t]); setAddOpen(false); }}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors hover:bg-white/8"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-2)" }}
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── Property row ─── */
function PropRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--border-color)" }}>
      <div className="flex w-28 shrink-0 items-center gap-2 pt-1.5">
        <span style={{ color: "var(--text-3)" }}>{icon}</span>
        <span className="text-xs" style={{ color: "var(--text-3)" }}>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ─── Main Modal ─── */
interface TaskModalProps {
  task?: Task | null;
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  onClose: () => void;
}

export default function TaskModal({ task, defaultStatus = "todo", defaultProjectId, onClose }: TaskModalProps) {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ?? "");
      setProjectId(task.projectId);
      setTags(task.tags ?? []);
    } else {
      setTitle(""); setDescription(""); setStatus(defaultStatus);
      setPriority("medium"); setDueDate(""); setTags([]);
      setProjectId(defaultProjectId ?? projects[0]?.id ?? "");
    }
  }, [task, defaultStatus, defaultProjectId, projects]);

  function handleSave() {
    if (!title.trim()) return;
    if (isEdit && task) {
      updateTask(task.id, { title: title.trim(), description, status, priority, dueDate: dueDate || undefined, projectId, tags });
    } else {
      addTask({ title: title.trim(), description, status, priority, dueDate: dueDate || undefined, projectId, tags });
    }
    onClose();
  }

  const sCfg = STATUS_CFG(zh);
  const pCfg = PRIORITY_CFG(zh);
  const curProject = projects.find((p) => p.id === projectId);
  const sc = sCfg[status];
  const pc = pCfg[priority];

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "done";
  const daysLeft = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <AnimatePresence>
      {true && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col shadow-2xl"
            style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-color)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
          >
            {/* Status accent bar */}
            <div className="h-[3px] w-full" style={{ backgroundColor: sc.color }} />

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-color)" }}>
              {/* Status badge (big) */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                style={{ backgroundColor: sc.bg }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {isEdit && !showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: "var(--text-3)" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {showDeleteConfirm && (
                  <motion.div
                    className="flex items-center gap-2 rounded-xl border px-2.5 py-1"
                    style={{ borderColor: "#ef444440", backgroundColor: "#ef444410" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="text-xs text-red-400">{zh ? "确认删除？" : "Delete?"}</span>
                    <button
                      onClick={() => { if (task) { deleteTask(task.id); onClose(); } }}
                      className="rounded-lg bg-red-500/20 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/30"
                    >
                      {zh ? "删除" : "Yes"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-lg px-2 py-0.5 text-xs hover:bg-white/8"
                      style={{ color: "var(--text-3)" }}
                    >
                      {zh ? "取消" : "No"}
                    </button>
                  </motion.div>
                )}
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/8"
                  style={{ color: "var(--text-3)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Title */}
              <div className="px-5 pt-5 pb-3">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
                  autoFocus={!isEdit}
                  rows={2}
                  placeholder={zh ? "任务标题…" : "Task title…"}
                  className="w-full resize-none bg-transparent text-lg font-bold leading-snug outline-none placeholder:font-normal"
                  style={{ color: "var(--text-1)" }}
                  onInput={(e) => {
                    const el = e.target as HTMLTextAreaElement;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
                {/* Tags row */}
                <div className="mt-2">
                  <TagsEditor tags={tags} onChange={setTags} zh={zh} />
                </div>
              </div>

              {/* Properties */}
              <div className="px-5">
                {/* Status */}
                <PropRow icon={<span className="h-3.5 w-3.5 rounded-full inline-block" style={{ backgroundColor: sc.dot }} />} label={zh ? "状态" : "Status"}>
                  <PropDropdown
                    options={["todo", "in_progress", "review", "done"] as TaskStatus[]}
                    value={status}
                    onChange={setStatus}
                    renderValue={(v) => (
                      <span style={{ color: sCfg[v].color }} className="font-medium">{sCfg[v].label}</span>
                    )}
                    renderItem={(v) => (
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sCfg[v].dot }} />
                        <span style={{ color: sCfg[v].color }} className="font-medium">{sCfg[v].label}</span>
                      </span>
                    )}
                  />
                </PropRow>

                {/* Priority */}
                <PropRow icon={<AlertCircle className="h-3.5 w-3.5" />} label={zh ? "优先级" : "Priority"}>
                  <PropDropdown
                    options={["low", "medium", "high", "urgent"] as TaskPriority[]}
                    value={priority}
                    onChange={setPriority}
                    renderValue={(v) => (
                      <span className="flex items-center gap-2">
                        <span className="num text-[10px] font-black" style={{ color: pCfg[v].color }}>{pCfg[v].icon}</span>
                        <span style={{ color: pCfg[v].color }} className="font-medium">{pCfg[v].label}</span>
                      </span>
                    )}
                    renderItem={(v) => (
                      <span className="flex items-center gap-2">
                        <span className="num text-[10px] font-black w-6 text-center" style={{ color: pCfg[v].color }}>{pCfg[v].icon}</span>
                        <span style={{ color: pCfg[v].color }} className="font-medium">{pCfg[v].label}</span>
                      </span>
                    )}
                  />
                </PropRow>

                {/* Project */}
                <PropRow icon={<Folder className="h-3.5 w-3.5" />} label={zh ? "项目" : "Project"}>
                  <PropDropdown
                    options={projects.map((p) => p.id)}
                    value={projectId}
                    onChange={setProjectId}
                    renderValue={(id) => {
                      const p = projects.find((p) => p.id === id);
                      return (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p?.coverColor ?? "#52525b" }} />
                          <span className="font-medium" style={{ color: "var(--text-1)" }}>{p?.name ?? "—"}</span>
                        </span>
                      );
                    }}
                    renderItem={(id) => {
                      const p = projects.find((p) => p.id === id);
                      return (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p?.coverColor ?? "#52525b" }} />
                          <span style={{ color: "var(--text-1)" }}>{p?.name ?? id}</span>
                        </span>
                      );
                    }}
                  />
                </PropRow>

                {/* Due Date */}
                <PropRow icon={<Calendar className="h-3.5 w-3.5" />} label={zh ? "截止日期" : "Due Date"}>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="num rounded-lg border px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500/50"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: isOverdue ? "#ef444450" : "var(--border-color)",
                        color: isOverdue ? "#ef4444" : "var(--text-1)",
                        colorScheme: "dark",
                      }}
                    />
                    {dueDate && (
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: isOverdue ? "#ef4444" : daysLeft! <= 3 ? "#f97316" : "var(--text-3)" }}
                      >
                        {isOverdue
                          ? (zh ? `逾期 ${Math.abs(daysLeft!)} 天` : `${Math.abs(daysLeft!)}d overdue`)
                          : daysLeft === 0
                            ? (zh ? "今日截止" : "Due today")
                            : daysLeft! <= 7
                              ? (zh ? `${daysLeft} 天后` : `in ${daysLeft}d`)
                              : ""}
                      </span>
                    )}
                  </div>
                </PropRow>
              </div>

              {/* Description */}
              <div className="px-5 py-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
                    {zh ? "备注" : "Notes"}
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={zh ? "添加详细说明、子任务、参考链接…" : "Add details, subtasks, links…"}
                  className="w-full resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-blue-500/30"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    borderColor: "transparent",
                    color: "var(--text-2)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-color)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "transparent"; }}
                />
              </div>

              {/* Created / updated info */}
              {isEdit && task && (
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-3)" }}>
                    <Clock className="h-3 w-3" />
                    <span>{zh ? "创建于" : "Created"} {new Date(task.createdAt).toLocaleDateString(zh ? "zh-CN" : "en-US")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-2 px-5 py-4"
              style={{ borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}
            >
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-white/8"
                style={{ color: "var(--text-2)" }}
              >
                {zh ? "取消" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: curProject?.coverColor ?? "#3b82f6" }}
              >
                <Check className="h-3.5 w-3.5" />
                {isEdit ? (zh ? "保存修改" : "Save") : (zh ? "创建任务" : "Create Task")}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
