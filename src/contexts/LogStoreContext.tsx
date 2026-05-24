"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { DevLog, DevLogTag, Mood } from "@/lib/types";

interface LogStoreContextValue {
  logs: DevLog[];
  addLog: (log: Omit<DevLog, "id" | "createdAt">) => void;
  updateLog: (id: string, patch: Partial<DevLog>) => void;
  deleteLog: (id: string) => void;
}

type LogRow = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  author_name: string;
  title: string | null;
  content: string;
  minutes: number;
  tags: DevLogTag[] | null;
  payload: Partial<DevLog> | null;
  created_at: string;
  updated_at: string;
};

const Ctx = createContext<LogStoreContextValue | null>(null);

function makeId() {
  return crypto.randomUUID();
}

function mapLog(row: LogRow): DevLog {
  const payload = row.payload ?? {};

  return {
    ...payload,
    id: row.id,
    projectId: row.project_id ?? payload.projectId ?? "",
    date: payload.date ?? row.created_at.slice(0, 10),
    tags: row.tags ?? payload.tags ?? [],
    completed: row.content,
    blockers: payload.blockers,
    tomorrowPlan: payload.tomorrowPlan,
    mood: (payload.mood ?? "good") as Mood,
    durationMinutes: row.minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorName: row.author_name,
  };
}

export function LogStoreProvider({ children }: { children: ReactNode }) {
  const { workspaceId, localUserName, viewingUserName } = useWorkspace();
  const [logs, setLogs] = useState<DevLog[]>([]);

  const loadLogs = useCallback(async () => {
    if (!workspaceId || !viewingUserName) {
      setLogs([]);
      return;
    }

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("author_name", viewingUserName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("load logs failed", error);
      return;
    }

    setLogs(
      ((data ?? []) as LogRow[])
        .map(mapLog)
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  }, [workspaceId, viewingUserName]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const addLog = useCallback(
    (data: Omit<DevLog, "id" | "createdAt">) => {
      if (!workspaceId || !localUserName) return;

      const newLog: DevLog = {
        ...data,
        id: makeId(),
        createdAt: new Date().toISOString(),
        authorName: localUserName,
      };

      if (viewingUserName === localUserName) {
        setLogs((prev) =>
          [newLog, ...prev].sort((a, b) => b.date.localeCompare(a.date))
        );
      }

      void (async () => {
        const { error } = await supabase.from("logs").insert({
          id: newLog.id,
          workspace_id: workspaceId,
          project_id: newLog.projectId || null,
          author_name: localUserName,
          title: null,
          content: newLog.completed,
          minutes: newLog.durationMinutes,
          tags: newLog.tags ?? [],
          payload: newLog,
        });

        if (error) {
          console.error("add log failed", error);
          await loadLogs();
        }
      })();
    },
    [workspaceId, localUserName, viewingUserName, loadLogs]
  );

  const updateLog = useCallback(
    (id: string, patch: Partial<DevLog>) => {
      if (!workspaceId) return;

      setLogs((prev) =>
        prev.map((log) => {
          if (log.id !== id) return log;

          const next: DevLog = {
            ...log,
            ...patch,
            updatedAt: new Date().toISOString(),
          };

          void (async () => {
            const { error } = await supabase
              .from("logs")
              .update({
                project_id: next.projectId || null,
                content: next.completed,
                minutes: next.durationMinutes,
                tags: next.tags ?? [],
                payload: next,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("workspace_id", workspaceId);

            if (error) console.error("update log failed", error);
          })();

          return next;
        })
      );
    },
    [workspaceId]
  );

  const deleteLog = useCallback(
    (id: string) => {
      if (!workspaceId) return;

      setLogs((prev) => prev.filter((l) => l.id !== id));

      void (async () => {
        const { error } = await supabase
          .from("logs")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          console.error("delete log failed", error);
          await loadLogs();
        }
      })();
    },
    [workspaceId, loadLogs]
  );

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