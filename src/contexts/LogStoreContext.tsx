"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { mockDevLogs } from "@/data/mockData";
import type { DevLog } from "@/lib/types";

interface LogStoreContextValue {
  logs: DevLog[];
  addLog: (log: Omit<DevLog, "id" | "createdAt">) => void;
  updateLog: (id: string, patch: Partial<DevLog>) => void;
  deleteLog: (id: string) => void;
}

const Ctx = createContext<LogStoreContextValue | null>(null);

export function LogStoreProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<DevLog[]>(() =>
    [...mockDevLogs].sort((a, b) => b.date.localeCompare(a.date))
  );

  const addLog = useCallback((data: Omit<DevLog, "id" | "createdAt">) => {
    const newLog: DevLog = {
      ...data,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const updateLog = useCallback((id: string, patch: Partial<DevLog>) => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ logs, addLog, updateLog, deleteLog }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLogStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLogStore must be inside LogStoreProvider");
  return ctx;
}
