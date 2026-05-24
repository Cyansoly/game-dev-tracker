"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";

interface TaskStoreContextValue {
  tasks: Task[];
  personalTasks: Task[];
  addTask: (data: Omit<Task, "id" | "createdAt" | "order">) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

type TaskRow = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  created_by_name: string | null;
  assignee_name: string | null;
  completed_by_name: string | null;
  payload: Partial<Task> | null;
  created_at: string;
  updated_at: string;
};

const TaskStoreContext = createContext<TaskStoreContextValue | null>(null);

function makeId() {
  return crypto.randomUUID();
}

function mapTask(row: TaskRow): Task {
  const payload = row.payload ?? {};

  return {
    ...payload,
    id: row.id,
    projectId: row.project_id ?? payload.projectId ?? "",
    title: row.title,
    description: row.description ?? payload.description,
    status: row.status,
    priority: row.priority ?? payload.priority ?? "medium",
    tags: payload.tags ?? [],
    dueDate: payload.dueDate,
    order: payload.order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByName: row.created_by_name ?? payload.createdByName,
    assigneeName:
      row.assignee_name ?? payload.assigneeName ?? row.created_by_name ?? undefined,
    completedByName: row.completed_by_name ?? payload.completedByName,
  };
}

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const { workspaceId, localUserName, viewingUserName } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    if (!workspaceId) {
      setTasks([]);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("load tasks failed", error);
      return;
    }

    setTasks(
      ((data ?? []) as TaskRow[])
        .map(mapTask)
        .sort((a, b) => a.order - b.order)
    );
  }, [workspaceId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const personalTasks = useMemo(() => {
    if (!viewingUserName) return [];
    return tasks.filter((task) => task.assigneeName === viewingUserName);
  }, [tasks, viewingUserName]);

  const addTask = useCallback(
    (data: Omit<Task, "id" | "createdAt" | "order">) => {
      if (!workspaceId) return;

      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : 0;

      const newTask: Task = {
        ...data,
        id: makeId(),
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
        createdByName: localUserName ?? undefined,
        assigneeName: data.assigneeName ?? localUserName ?? undefined,
      };

      setTasks((prev) => [...prev, newTask]);

      void (async () => {
        const { error } = await supabase.from("tasks").insert({
          id: newTask.id,
          workspace_id: workspaceId,
          project_id: newTask.projectId || null,
          title: newTask.title,
          description: newTask.description ?? null,
          status: newTask.status,
          priority: newTask.priority,
          created_by_name: localUserName,
          assignee_name: newTask.assigneeName ?? localUserName,
          payload: newTask,
        });

        if (error) {
          console.error("add task failed", error);
          await loadTasks();
        }
      })();
    },
    [workspaceId, localUserName, tasks, loadTasks]
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      if (!workspaceId) return;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;

          const next: Task = {
            ...task,
            ...patch,
            updatedAt: new Date().toISOString(),
          };

          void (async () => {
            const { error } = await supabase
              .from("tasks")
              .update({
                project_id: next.projectId || null,
                title: next.title,
                description: next.description ?? null,
                status: next.status,
                priority: next.priority,
                assignee_name: next.assigneeName ?? null,
                completed_by_name: next.completedByName ?? null,
                payload: next,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("workspace_id", workspaceId);

            if (error) console.error("update task failed", error);
          })();

          return next;
        })
      );
    },
    [workspaceId]
  );

  const updateStatus = useCallback(
    (id: string, status: TaskStatus) => {
      updateTask(id, {
        status,
        completedByName: status === "done" ? localUserName ?? undefined : undefined,
      });
    },
    [updateTask, localUserName]
  );

  const deleteTask = useCallback(
    (id: string) => {
      if (!workspaceId) return;

      setTasks((prev) => prev.filter((t) => t.id !== id));

      void (async () => {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          console.error("delete task failed", error);
          await loadTasks();
        }
      })();
    },
    [workspaceId, loadTasks]
  );

  return (
    <TaskStoreContext.Provider
      value={{
        tasks,
        personalTasks,
        addTask,
        updateStatus,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore(): TaskStoreContextValue {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error("useTaskStore must be inside TaskStoreProvider");
  return ctx;
}