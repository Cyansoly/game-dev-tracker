"use client";

import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const { t } = useLanguage();
  const { tasks } = useTaskStore();

  return (
    <AnimatedPageWrapper className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
            {t.tasks.title}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {tasks.length} {t.tasks.allTasks}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
          <Plus className="h-4 w-4" />
          {t.tasks.newTask}
        </button>
      </div>

      <TaskKanbanBoard />
    </AnimatedPageWrapper>
  );
}
