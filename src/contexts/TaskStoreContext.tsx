"use client";

import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from "react";
import { mockTasks } from "@/data/mockData";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";

interface TaskStoreContextValue {
  tasks: Task[];
  addTask: (data: Omit<Task, "id" | "createdAt" | "order">) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const TaskStoreContext = createContext<TaskStoreContextValue | null>(null);

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    [...mockTasks].sort((a, b) => a.order - b.order)
  );

  const updateStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }, []);

  const addTask = useCallback((data: Omit<Task, "id" | "createdAt" | "order">) => {
    setTasks((prev) => {
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((t) => t.order)) : 0;
      const newTask: Task = {
        ...data,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
      };
      return [...prev, newTask];
    });
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TaskStoreContext.Provider value={{ tasks, addTask, updateStatus, updateTask, deleteTask }}>
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore(): TaskStoreContextValue {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error("useTaskStore must be inside TaskStoreProvider");
  return ctx;
}
