"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  LayoutGrid, List, Zap, Plus, ChevronDown,
  GripVertical, CalendarDays, Tag, FolderOpen, ArrowRight,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import TaskModal from "./TaskModal";

/* ─────────────────────────────── helpers ─── */
const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-zinc-500",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "#71717a",
  medium: "#fbbf24",
  high: "#f97316",
  urgent: "#ef4444",
};

const COL_CONFIG = [
  {
    id: "todo" as TaskStatus,
    emoji: "📋",
    color: "#71717a",
    bg: "rgba(113,113,122,0.08)",
    topBar: "#52525b",
  },
  {
    id: "in_progress" as TaskStatus,
    emoji: "⚡",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.06)",
    topBar: "#3b82f6",
  },
  {
    id: "review" as TaskStatus,
    emoji: "🔍",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.06)",
    topBar: "#8b5cf6",
  },
  {
    id: "done" as TaskStatus,
    emoji: "✅",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.06)",
    topBar: "#22c55e",
  },
];

type ViewMode = "kanban" | "list" | "focus";

/* ─────────────────────────────────────────────
   Rich Task Card (Kanban view)
───────────────────────────────────────────── */
function RichTaskCard({
  task,
  onClick,
  projectColor,
  projectName,
  isDragPreview = false,
}: {
  task: Task;
  onClick?: () => void;
  projectColor: string;
  projectName: string;
  isDragPreview?: boolean;
}) {
  const { lang } = useLanguage();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
  const daysLeft = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all",
        isDragPreview && "rotate-1 shadow-2xl",
        !isDragPreview && "hover:-translate-y-0.5 hover:shadow-lg"
      )}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: isDragPreview ? `${projectColor}50` : "var(--border-color)",
      }}
      onMouseEnter={(e) => {
        if (!isDragPreview)
          (e.currentTarget as HTMLDivElement).style.borderColor = `${projectColor}40`;
      }}
      onMouseLeave={(e) => {
        if (!isDragPreview)
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)";
      }}
      layout
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: projectColor }}
      />

      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Priority badge */}
        <div className="mb-2 flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: `${PRIORITY_COLOR[task.priority]}15`,
              color: PRIORITY_COLOR[task.priority],
            }}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[task.priority])} />
            {task.priority}
          </span>
          {task.dueDate && (
            <span
              className="num flex items-center gap-1 text-[10px]"
              style={{ color: isOverdue ? "#ef4444" : "var(--text-3)" }}
            >
              <CalendarDays className="h-2.5 w-2.5" />
              {isOverdue
                ? `逾期 ${Math.abs(daysLeft!)}天`
                : daysLeft === 0
                  ? "今天截止"
                  : daysLeft! <= 3
                    ? `${daysLeft}天后截止`
                    : new Date(task.dueDate).toLocaleDateString(
                      lang === "zh" ? "zh-CN" : "en-US",
                      { month: "short", day: "numeric" }
                    )}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="mb-3 text-sm font-medium leading-snug" style={{ color: "var(--text-1)" }}>
          {task.title}
        </p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-3)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Project label */}
        <div
          className="mt-3 flex items-center gap-1.5 text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          <FolderOpen className="h-3 w-3" />
          {projectName}
        </div>

        {/* User meta */}
        <div
          className="mt-2 flex flex-wrap gap-1.5 text-[10px]"
          style={{ color: "var(--text-3)" }}
        >
          {task.assigneeName && (
            <span
              className="rounded-full border px-2 py-0.5"
              style={{ borderColor: "var(--border-color)" }}
            >
              负责人：{task.assigneeName}
            </span>
          )}

          {task.createdByName && (
            <span
              className="rounded-full border px-2 py-0.5"
              style={{ borderColor: "var(--border-color)" }}
            >
              创建：{task.createdByName}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Draggable wrapper
───────────────────────────────────────────── */
function DraggableCard({
  task,
  onClick,
  projectColor,
  projectName,
}: {
  task: Task;
  onClick: () => void;
  projectColor: string;
  projectName: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.25 : 1 }}
      className="group relative"
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="absolute right-2 top-3 z-10 flex h-5 w-5 cursor-grab items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-30 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
      </button>
      <RichTaskCard task={task} onClick={onClick} projectColor={projectColor} projectName={projectName} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Droppable Column (Kanban)
───────────────────────────────────────────── */
function KanbanColumn({
  col,
  tasks,
  onCardClick,
  onAddTask,
  getProject,
  colLabel,
}: {
  col: typeof COL_CONFIG[0];
  tasks: Task[];
  onCardClick: (t: Task) => void;
  onAddTask: (s: TaskStatus) => void;
  getProject: (id: string) => { color: string; name: string };
  colLabel: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { isOver, setNodeRef } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className="flex min-w-[220px] flex-1 flex-col overflow-hidden rounded-2xl border transition-all"
      style={{
        borderColor: isOver ? `${col.color}40` : "var(--border-color)",
        backgroundColor: isOver ? col.bg : "rgba(128,128,128,0.02)",
        boxShadow: isOver ? `0 0 0 1px ${col.color}20` : "none",
      }}
    >
      {/* Top accent bar */}
      <div className="h-[2px] w-full" style={{ backgroundColor: col.topBar }} />

      {/* Header */}
      <div className="flex select-none items-center gap-2.5 px-3.5 py-3">
        <button
          className="flex flex-1 items-center gap-2.5"
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className="text-base leading-none">{col.emoji}</span>
          <span className="text-sm font-semibold" style={{ color: col.color }}>
            {colLabel}
          </span>
          <span
            className="num ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
            style={{ backgroundColor: `${col.color}20`, color: col.color }}
          >
            {tasks.length}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(col.id)}
            className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: col.color }}
            title="添加任务"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/8"
            style={{ color: "var(--text-3)" }}
          >
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ transform: collapsed ? "rotate(-90deg)" : "none" }}
            />
          </button>
        </div>
      </div>

      {/* Task list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-2.5 pb-3 pt-0.5">
              {tasks.map((task) => {
                const proj = getProject(task.projectId);
                return (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    onClick={() => onCardClick(task)}
                    projectColor={proj.color}
                    projectName={proj.name}
                  />
                );
              })}
              {tasks.length === 0 && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-5 text-xs transition-colors hover:bg-white/[0.03]"
                  style={{ borderColor: `${col.color}25`, color: "var(--text-3)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isOver ? "拖放至此" : "添加任务"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   List View Row
───────────────────────────────────────────── */
function ListRow({
  task,
  onClick,
  projectColor,
  projectName,
}: {
  task: Task;
  onClick: () => void;
  projectColor: string;
  projectName: string;
}) {
  const col = COL_CONFIG.find((c) => c.id === task.status)!;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <motion.div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:-translate-y-px hover:shadow-md"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${projectColor}40`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; }}
      layout
    >
      {/* Status dot */}
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: col.color }} />

      {/* Title */}
      <p className="flex-1 truncate text-sm font-medium" style={{ color: "var(--text-1)" }}>
        {task.title}
      </p>

      <div
        className="mt-1 flex gap-2 text-[10px]"
        style={{ color: "var(--text-3)" }}
      >
        {task.assigneeName && <span>负责人：{task.assigneeName}</span>}
        {task.createdByName && <span>创建：{task.createdByName}</span>}
      </div>

      {/* Tags */}
      <div className="hidden items-center gap-1 sm:flex">
        {task.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-3)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Priority */}
      <span
        className="hidden w-14 shrink-0 text-center text-[10px] font-semibold md:block"
        style={{ color: PRIORITY_COLOR[task.priority] }}
      >
        {task.priority}
      </span>

      {/* Project */}
      <div className="hidden items-center gap-1.5 w-28 lg:flex">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: projectColor }} />
        <span className="truncate text-[11px]" style={{ color: "var(--text-3)" }}>{projectName}</span>
      </div>

      {/* Due date */}
      <span
        className="num hidden w-20 shrink-0 text-right text-[11px] sm:block"
        style={{ color: isOverdue ? "#ef4444" : "var(--text-3)" }}
      >
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
          : "—"}
      </span>

      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" style={{ color: "var(--text-3)" }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   List View Groups (collapsible)
───────────────────────────────────────────── */
function ListViewGroups({
  filtered,
  colLabels,
  lang,
  getProject,
  onCardClick,
  onAddTask,
}: {
  filtered: Task[];
  colLabels: Record<TaskStatus, string>;
  lang: string;
  getProject: (id: string) => { color: string; name: string };
  onCardClick: (t: Task) => void;
  onAddTask: (s: TaskStatus) => void;
}) {
  const [collapsed, setCollapsed] = useState<Partial<Record<TaskStatus, boolean>>>({});

  function toggle(id: TaskStatus) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col gap-3">
      {COL_CONFIG.map((col) => {
        const colTasks = filtered.filter((t) => t.status === col.id);
        const isCollapsed = !!collapsed[col.id];

        return (
          <div
            key={col.id}
            className="overflow-hidden rounded-xl border transition-all"
            style={{
              borderColor: isCollapsed ? "var(--border-color)" : `${col.color}25`,
              backgroundColor: "rgba(128,128,128,0.02)",
            }}
          >
            {/* Group header */}
            <button
              onClick={() => toggle(col.id)}
              className="flex w-full items-center gap-2.5 px-4 py-3 transition-colors hover:bg-white/[0.03]"
            >
              {/* Top color line (left accent on header) */}
              <span className="text-base leading-none">{col.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: col.color }}>
                {colLabels[col.id]}
              </span>
              <span
                className="num flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{ backgroundColor: `${col.color}18`, color: col.color }}
              >
                {colTasks.length}
              </span>

              {/* Completion bar for Done column */}
              {col.id === "done" && filtered.length > 0 && (
                <div className="ml-2 flex flex-1 items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
                    <motion.div
                      className="h-1 rounded-full"
                      style={{ backgroundColor: col.color }}
                      animate={{ width: `${(colTasks.length / filtered.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>
                    {Math.round((colTasks.length / filtered.length) * 100)}%
                  </span>
                </div>
              )}

              <ChevronDown
                className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--text-3)",
                  transform: isCollapsed ? "rotate(-90deg)" : "none",
                }}
              />
            </button>

            {/* Collapsible content */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="mx-3 mb-3 h-px"
                    style={{ backgroundColor: `${col.color}15` }}
                  />
                  <div className="flex flex-col gap-1.5 px-3 pb-3">
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => {
                        const proj = getProject(task.projectId);
                        return (
                          <ListRow
                            key={task.id}
                            task={task}
                            onClick={() => onCardClick(task)}
                            projectColor={proj.color}
                            projectName={proj.name}
                          />
                        );
                      })
                    ) : (
                      <button
                        onClick={() => onAddTask(col.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-3 text-xs transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: `${col.color}20`, color: "var(--text-3)" }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {lang === "zh" ? "添加任务" : "Add task"}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Focus View
───────────────────────────────────────────── */
function FocusView({
  tasks,
  onCardClick,
  onAddTask,
  getProject,
  colLabels,
}: {
  tasks: Task[];
  onCardClick: (t: Task) => void;
  onAddTask: (s: TaskStatus) => void;
  getProject: (id: string) => { color: string; name: string };
  colLabels: Record<TaskStatus, string>;
}) {
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const todo = tasks.filter((t) => t.status === "todo");
  const review = tasks.filter((t) => t.status === "review");
  const done = tasks.filter((t) => t.status === "done");

  const SideCol = ({ items, status, label, color }: { items: Task[]; status: TaskStatus; label: string; color: string }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>{items.length}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.slice(0, 5).map((t) => {
          const proj = getProject(t.projectId);
          return (
            <button
              key={t.id}
              onClick={() => onCardClick(t)}
              className="group flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-all hover:bg-white/[0.04]"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
            >
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: proj.color }} />
              <p className="text-xs leading-snug line-clamp-2" style={{ color: "var(--text-2)" }}>{t.title}</p>
            </button>
          );
        })}
        {items.length === 0 && (
          <button
            onClick={() => onAddTask(status)}
            className="flex items-center justify-center gap-1 rounded-lg border border-dashed py-3 text-xs transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: `${color}30`, color: "var(--text-3)" }}
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr]">
      {/* Left: Todo */}
      <div className="space-y-4">
        <SideCol items={todo} status="todo" label={colLabels.todo} color="#71717a" />
        <SideCol items={done.slice(0, 3)} status="done" label={colLabels.done} color="#4ade80" />
      </div>

      {/* Center: In Progress spotlight */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: "#60a5fa" }} />
          <span className="font-semibold" style={{ color: "#60a5fa" }}>
            {colLabels.in_progress}
          </span>
          <span
            className="num rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: "#3b82f620", color: "#60a5fa" }}
          >
            {inProgress.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {inProgress.map((t) => {
            const proj = getProject(t.projectId);
            return (
              <RichTaskCard
                key={t.id}
                task={t}
                onClick={() => onCardClick(t)}
                projectColor={proj.color}
                projectName={proj.name}
              />
            );
          })}
          {inProgress.length === 0 && (
            <button
              onClick={() => onAddTask("in_progress")}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-14 transition-colors hover:bg-blue-500/5"
              style={{ borderColor: "#3b82f630", color: "#60a5fa" }}
            >
              <Zap className="h-6 w-6 opacity-40" />
              <span className="text-sm opacity-60">开始一个任务</span>
            </button>
          )}
          <button
            onClick={() => onAddTask("in_progress")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-xs transition-colors hover:bg-blue-500/5"
            style={{ borderColor: "#3b82f630", color: "#60a5fa" }}
          >
            <Plus className="h-3.5 w-3.5" />
            添加进行中
          </button>
        </div>
      </div>

      {/* Right: Review */}
      <SideCol items={review} status="review" label={colLabels.review} color="#a78bfa" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Board
───────────────────────────────────────────── */
interface TaskKanbanBoardProps {
  projectId?: string;
}

export default function TaskKanbanBoard({ projectId }: TaskKanbanBoardProps) {
  const { tasks, updateStatus } = useTaskStore();
  const { projects } = useProjectStore();
  const { t, lang } = useLanguage();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | null>(null);
  const [view, setView] = useState<ViewMode>("kanban");

  const getProject = (id: string) => {
    const p = projects.find((p) => p.id === id);
    return { color: p?.coverColor ?? "#52525b", name: p?.name ?? "—" };
  };

  const filtered = projectId ? tasks.filter((t) => t.projectId === projectId) : tasks;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(e: DragStartEvent) {
    setActiveTask(filtered.find((t) => t.id === e.active.id) ?? null);
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    if (!e.over) return;
    const task = filtered.find((t) => t.id === e.active.id);
    if (task && task.status !== e.over.id) updateStatus(task.id, e.over.id as TaskStatus);
  }

  const colLabels: Record<TaskStatus, string> = {
    todo: t.tasks.todo,
    in_progress: t.tasks.inProgress,
    review: t.tasks.review,
    done: t.tasks.done,
  };

  const total = filtered.length;
  const doneCount = filtered.filter((t) => t.status === "done").length;

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Stats */}
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "var(--text-2)" }}>
            {total} {lang === "zh" ? "个任务" : "tasks"}
          </span>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
                <motion.div
                  className="h-1.5 rounded-full bg-green-500"
                  animate={{ width: `${(doneCount / total) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="num text-xs" style={{ color: "var(--text-3)" }}>
                {doneCount}/{total}
              </span>
            </div>
          )}
        </div>

        {/* View toggle + Add */}
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-color)" }}>
            {(["kanban", "list", "focus"] as ViewMode[]).map((v) => {
              const Icon = v === "kanban" ? LayoutGrid : v === "list" ? List : Zap;
              const label = v === "kanban" ? (lang === "zh" ? "看板" : "Board") : v === "list" ? (lang === "zh" ? "列表" : "List") : (lang === "zh" ? "专注" : "Focus");
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: view === v ? "var(--text-1)" : "var(--text-3)" }}
                >
                  {view === v && (
                    <motion.div
                      layoutId="view-indicator"
                      className="absolute inset-0"
                      style={{ backgroundColor: "var(--bg-raised)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.25 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setNewTaskStatus("todo")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === "zh" ? "新建任务" : "New Task"}
          </button>
        </div>
      </div>

      {/* ── Views ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === "kanban" && (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {COL_CONFIG.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    col={col}
                    tasks={filtered.filter((t) => t.status === col.id)}
                    onCardClick={(task) => setModalTask(task)}
                    onAddTask={(s) => setNewTaskStatus(s)}
                    getProject={getProject}
                    colLabel={colLabels[col.id]}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={null}>
                {activeTask ? (
                  <RichTaskCard
                    task={activeTask}
                    projectColor={getProject(activeTask.projectId).color}
                    projectName={getProject(activeTask.projectId).name}
                    isDragPreview
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {view === "list" && (
            <ListViewGroups
              filtered={filtered}
              colLabels={colLabels}
              lang={lang}
              getProject={getProject}
              onCardClick={(task) => setModalTask(task)}
              onAddTask={(s) => setNewTaskStatus(s)}
            />
          )}

          {view === "focus" && (
            <FocusView
              tasks={filtered}
              onCardClick={(task) => setModalTask(task)}
              onAddTask={(s) => setNewTaskStatus(s)}
              getProject={getProject}
              colLabels={colLabels}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {modalTask && <TaskModal task={modalTask} onClose={() => setModalTask(null)} />}
      {newTaskStatus && (
        <TaskModal
          defaultStatus={newTaskStatus}
          defaultProjectId={projectId}
          onClose={() => setNewTaskStatus(null)}
        />
      )}
    </>
  );
}
