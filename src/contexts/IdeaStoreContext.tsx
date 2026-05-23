"use client";

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react";
import type { IdeaCapsule } from "@/lib/types";

interface IdeaStoreContextValue {
  ideas: IdeaCapsule[];
  addIdea: (idea: Omit<IdeaCapsule, "id" | "createdAt" | "updatedAt">) => void;
  updateIdea: (id: string, patch: Partial<IdeaCapsule>) => void;
  removeIdea: (id: string) => void;
  moveToProject: (id: string, projectId: string | undefined) => void;
  togglePin: (id: string) => void;
}

const Ctx = createContext<IdeaStoreContextValue | null>(null);

const LS_KEY = "devtracker_ideas_v3";

function stamp() {
  return new Date().toISOString();
}

function load(): IdeaCapsule[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

function save(ideas: IdeaCapsule[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ideas));
  } catch {}
}

export function IdeaStoreProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<IdeaCapsule[]>([]);

  useEffect(() => {
    setIdeas(load());
  }, []);

  const mutate = useCallback((fn: (prev: IdeaCapsule[]) => IdeaCapsule[]) => {
    setIdeas((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const addIdea = useCallback(
    (data: Omit<IdeaCapsule, "id" | "createdAt" | "updatedAt">) => {
      const now = stamp();
      const newIdea: IdeaCapsule = {
        ...data,
        id: `idea-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      mutate((prev) => [newIdea, ...prev]);
    },
    [mutate]
  );

  const updateIdea = useCallback(
    (id: string, patch: Partial<IdeaCapsule>) => {
      mutate((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, ...patch, updatedAt: stamp() } : i
        )
      );
    },
    [mutate]
  );

  const removeIdea = useCallback(
    (id: string) => {
      mutate((prev) => prev.filter((i) => i.id !== id));
    },
    [mutate]
  );

  const moveToProject = useCallback(
    (id: string, projectId: string | undefined) => {
      mutate((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, projectId, updatedAt: stamp() } : i
        )
      );
    },
    [mutate]
  );

  const togglePin = useCallback(
    (id: string) => {
      mutate((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, pinned: !i.pinned, updatedAt: stamp() } : i
        )
      );
    },
    [mutate]
  );

  return (
    <Ctx.Provider value={{ ideas, addIdea, updateIdea, removeIdea, moveToProject, togglePin }}>
      {children}
    </Ctx.Provider>
  );
}

export function useIdeaStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdeaStore must be inside IdeaStoreProvider");
  return ctx;
}
