"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { mockProjects } from "@/data/mockData";
import type { GameProject, ProgressModule, ProjectLink } from "@/lib/types";

interface ProjectStoreContextValue {
  projects: GameProject[];
  addProject: (p: Omit<GameProject, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, patch: Partial<GameProject>) => void;
  updateProjectField: <K extends keyof GameProject>(id: string, key: K, value: GameProject[K]) => void;
  updateModuleProgress: (projectId: string, moduleKey: string, value: number) => void;
  updateOverallProgress: (projectId: string, value: number) => void;
  addCustomModule: (projectId: string, mod: Omit<ProgressModule, "updatedAt">) => void;
  removeModule: (projectId: string, key: string) => void;
  updateModuleMeta: (projectId: string, key: string, patch: Partial<Pick<ProgressModule, "label" | "weight" | "note" | "color">>) => void;
  addProjectLink: (projectId: string, link: ProjectLink) => void;
  updateProjectLink: (projectId: string, idx: number, link: ProjectLink) => void;
  removeProjectLink: (projectId: string, idx: number) => void;
  addProjectTag: (projectId: string, tag: string) => void;
  removeProjectTag: (projectId: string, tag: string) => void;
}

const Ctx = createContext<ProjectStoreContextValue | null>(null);

function stamp() { return new Date().toISOString().slice(0, 10); }

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<GameProject[]>([...mockProjects]);

  const touch = useCallback((prev: GameProject[], id: string, fn: (p: GameProject) => GameProject) =>
    prev.map((p) => p.id === id ? { ...fn(p), updatedAt: stamp() } : p), []);

  const addProject = useCallback((data: Omit<GameProject, "id" | "createdAt" | "updatedAt">) => {
    const now = stamp();
    const newProject: GameProject = { ...data, id: `proj-${Date.now()}`, createdAt: now, updatedAt: now };
    setProjects((prev) => [newProject, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<GameProject>) => {
    setProjects((prev) => touch(prev, id, (p) => ({ ...p, ...patch })));
  }, [touch]);

  const updateProjectField = useCallback(<K extends keyof GameProject>(id: string, key: K, value: GameProject[K]) => {
    setProjects((prev) => touch(prev, id, (p) => ({ ...p, [key]: value })));
  }, [touch]);

  const updateModuleProgress = useCallback((projectId: string, moduleKey: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setProjects((prev) => touch(prev, projectId, (p) => {
      const mods = p.progressModules.map((m) =>
        m.key === moduleKey ? { ...m, progress: clamped, updatedAt: stamp() } : m
      );
      const totalW = mods.reduce((s, m) => s + m.weight, 0);
      const overall = totalW > 0 ? Math.round(mods.reduce((s, m) => s + m.progress * m.weight, 0) / totalW) : p.overallProgress;
      return { ...p, progressModules: mods, overallProgress: overall };
    }));
  }, [touch]);

  const updateOverallProgress = useCallback((projectId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setProjects((prev) => touch(prev, projectId, (p) => ({ ...p, overallProgress: clamped })));
  }, [touch]);

  const addCustomModule = useCallback((projectId: string, mod: Omit<ProgressModule, "updatedAt">) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p,
      progressModules: [...p.progressModules, { ...mod, updatedAt: stamp(), isCustom: true }],
    })));
  }, [touch]);

  const removeModule = useCallback((projectId: string, key: string) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p,
      progressModules: p.progressModules.filter((m) => m.key !== key),
    })));
  }, [touch]);

  const updateModuleMeta = useCallback((projectId: string, key: string, patch: Partial<Pick<ProgressModule, "label" | "weight" | "note" | "color">>) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p,
      progressModules: p.progressModules.map((m) =>
        m.key === key ? { ...m, ...patch, updatedAt: stamp() } : m
      ),
    })));
  }, [touch]);

  const addProjectLink = useCallback((projectId: string, link: ProjectLink) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({ ...p, links: [...(p.links ?? []), link] })));
  }, [touch]);

  const updateProjectLink = useCallback((projectId: string, idx: number, link: ProjectLink) => {
    setProjects((prev) => touch(prev, projectId, (p) => {
      const links = [...(p.links ?? [])];
      links[idx] = link;
      return { ...p, links };
    }));
  }, [touch]);

  const removeProjectLink = useCallback((projectId: string, idx: number) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p, links: (p.links ?? []).filter((_, i) => i !== idx),
    })));
  }, [touch]);

  const addProjectTag = useCallback((projectId: string, tag: string) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p, tags: p.tags.includes(tag) ? p.tags : [...p.tags, tag],
    })));
  }, [touch]);

  const removeProjectTag = useCallback((projectId: string, tag: string) => {
    setProjects((prev) => touch(prev, projectId, (p) => ({
      ...p, tags: p.tags.filter((t) => t !== tag),
    })));
  }, [touch]);

  return (
    <Ctx.Provider value={{
      projects, addProject, updateProject, updateProjectField,
      updateModuleProgress, updateOverallProgress,
      addCustomModule, removeModule, updateModuleMeta,
      addProjectLink, updateProjectLink, removeProjectLink,
      addProjectTag, removeProjectTag,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProjectStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjectStore must be inside ProjectStoreProvider");
  return ctx;
}
