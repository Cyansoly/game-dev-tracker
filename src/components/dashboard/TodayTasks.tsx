"use client";

import { motion } from "framer-motion";
import type { Task } from "@/lib/types";
import { PriorityBadge } from "@/components/ui/Badge";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";

const statusDot: Record<string, string> = {
  todo:        "bg-zinc-600",
  in_progress: "bg-blue-500",
  review:      "bg-purple-500",
  done:        "bg-green-500",
};

interface TodayTasksProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TodayTasks({ tasks, onTaskClick }: TodayTasksProps) {
  const { t } = useLanguage();
  const { projects } = useProjectStore();
  const active = tasks
    .filter((t) => t.status === "todo" || t.status === "in_progress")
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-0">
      {active.map((task, i) => {
        const color = projects.find((p) => p.id === task.projectId)?.coverColor ?? "#52525b";
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className={`flex items-start gap-3 border-b py-3 last:border-0 ${onTaskClick ? "cursor-pointer rounded-lg px-2 -mx-2 transition-colors hover:bg-white/[0.03]" : ""}`}
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => onTaskClick?.(task)}
          >
            <span
              className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", statusDot[task.status])}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-zinc-300 leading-snug">{task.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="h-1 w-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <span className={cn("text-[11px]", isOverdue ? "text-red-400" : "text-zinc-600")}>
                    {isOverdue ? "⚠ " : ""}
                    {new Date(task.dueDate).toLocaleDateString(
                      t === undefined ? "zh-CN" : "zh-CN",
                      { month: "short", day: "numeric" }
                    )}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {active.length === 0 && (
        <p className="py-6 text-center text-xs text-zinc-600">
          {t.dashboard.noActiveTasks}
        </p>
      )}
    </div>
  );
}
