"use client";

import { useState } from "react";
import { CheckSquare, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Task } from "@/lib/types";
import TaskModal from "@/components/tasks/TaskModal";
import WidgetCard from "../WidgetCard";
import { cn } from "@/lib/cn";

const PRIORITY_COLOR: Record<string, string> = {
  low: "#71717a", medium: "#fbbf24", high: "#f97316", urgent: "#ef4444",
};

export default function TaskFocusWidget() {
  const { personalTasks: tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const [modalTask, setModalTask] = useState<Task | null>(null);

  const active = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const p = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 5);

  const getProject = (id: string) => projects.find((p) => p.id === id);

  return (
    <>
      <WidgetCard
        id="task-focus"
        title={zh ? "待办焦点" : "Task Focus"}
        icon={<CheckSquare className="h-4 w-4" />}
        accentColor="#3b82f6"
        headerRight={
          <Link href="/tasks" className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-3)" }}>
            {zh ? "看板" : "Board"} <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        <div className="flex flex-col gap-1.5">
          {active.map((task, i) => {
            const proj = getProject(task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            const isToday = task.dueDate === new Date().toISOString().slice(0, 10);
            return (
              <motion.button
                key={task.id}
                onClick={() => setModalTask(task)}
                className="group flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md"
                style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Priority indicator */}
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: "var(--text-1)" }}>
                    {task.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {proj && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: proj.coverColor }} />
                        <span className="text-[9px]" style={{ color: "var(--text-3)" }}>{proj.name}</span>
                      </span>
                    )}
                    {task.dueDate && (
                      <span
                        className={cn("text-[9px] font-medium")}
                        style={{ color: isOverdue ? "#ef4444" : isToday ? "#f97316" : "var(--text-3)" }}
                      >
                        {isOverdue
                          ? (zh ? "已逾期" : "Overdue")
                          : isToday
                            ? (zh ? "今日截止" : "Due today")
                            : new Date(task.dueDate).toLocaleDateString(zh ? "zh-CN" : "en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                {(isOverdue || isToday) && (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: isOverdue ? "#ef4444" : "#f97316" }} />
                )}
              </motion.button>
            );
          })}
          {active.length === 0 && (
            <p className="py-4 text-center text-xs" style={{ color: "var(--text-3)" }}>
              🎉 {zh ? "暂无待办任务" : "No pending tasks"}
            </p>
          )}
        </div>
      </WidgetCard>
      {modalTask && <TaskModal task={modalTask} onClose={() => setModalTask(null)} />}
    </>
  );
}
