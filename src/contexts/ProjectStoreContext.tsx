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
import type {
  GameProject,
  ProgressModule,
  ProjectLink,
  Platform,
} from "@/lib/types";

interface ProjectStoreContextValue {
  projects: GameProject[];
  addProject: (p: Omit<GameProject, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, patch: Partial<GameProject>) => void;
  updateProjectField: <K extends keyof GameProject>(
    id: string,
    key: K,
    value: GameProject[K]
  ) => void;
  updateModuleProgress: (
    projectId: string,
    moduleKey: string,
    value: number
  ) => void;
  updateOverallProgress: (projectId: string, value: number) => void;
  addCustomModule: (
    projectId: string,
    mod: Omit<ProgressModule, "updatedAt" | "isCustom">
  ) => void;
  removeModule: (projectId: string, key: string) => void;
  updateModuleMeta: (
    projectId: string,
    key: string,
    patch: Partial<Omit<ProgressModule, "key">>
  ) => void;
  addProjectLink: (projectId: string, link: ProjectLink) => void;
  updateProjectLink: (projectId: string, idx: number, link: ProjectLink) => void;
  removeProjectLink: (projectId: string, idx: number) => void;
  addProjectTag: (projectId: string, tag: string) => void;
  removeProjectTag: (projectId: string, tag: string) => void;
  deleteProject: (id: string) => void;
}

type ProjectRow = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  status: string | null;
  engine: string | null;
  platform: Platform[] | null;
  created_by_name: string | null;
  updated_by_name: string | null;
  payload: Partial<GameProject> | null;
  created_at: string;
  updated_at: string;
};

const Ctx = createContext<ProjectStoreContextValue | null>(null);

function dayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function isoStamp() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

function mapProject(row: ProjectRow): GameProject {
  const payload = row.payload ?? {};

  return {
    ...payload,
    id: row.id,
    name: row.name,
    slug: row.slug,
    stage: (payload.stage ?? row.status ?? "concept") as GameProject["stage"],
    engine: row.engine ?? payload.engine,
    platforms: row.platform ?? payload.platforms ?? [],
    createdByName: row.created_by_name ?? payload.createdByName,
    updatedByName: row.updated_by_name ?? payload.updatedByName,
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
  } as GameProject;
}

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const { workspaceId, localUserName } = useWorkspace();
  const [projects, setProjects] = useState<GameProject[]>([]);

  const loadProjects = useCallback(async () => {
    if (!workspaceId) {
      setProjects([]);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("load projects failed", error);
      return;
    }

    setProjects(((data ?? []) as ProjectRow[]).map(mapProject));
  }, [workspaceId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const saveProject = useCallback(
    async (project: GameProject) => {
      if (!workspaceId) return;

      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          slug: project.slug,
          status: project.stage,
          engine: project.engine ?? null,
          platform: project.platforms ?? [],
          updated_by_name: localUserName,
          payload: project,
          updated_at: isoStamp(),
        })
        .eq("id", project.id)
        .eq("workspace_id", workspaceId);

      if (error) console.error("save project failed", error);
    },
    [workspaceId, localUserName]
  );

  const mutateProject = useCallback(
    (id: string, fn: (p: GameProject) => GameProject) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          const next = {
            ...fn(p),
            updatedAt: dayStamp(),
            updatedByName: localUserName ?? p.updatedByName,
          };

          void saveProject(next);
          return next;
        })
      );
    },
    [saveProject, localUserName]
  );

  const addProject = useCallback(
    (data: Omit<GameProject, "id" | "createdAt" | "updatedAt">) => {
      if (!workspaceId) return;

      const now = dayStamp();

      const newProject: GameProject = {
        ...data,
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        createdByName: localUserName ?? undefined,
        updatedByName: localUserName ?? undefined,
      };

      setProjects((prev) => [newProject, ...prev]);

      void (async () => {
        const { error } = await supabase.from("projects").insert({
          id: newProject.id,
          workspace_id: workspaceId,
          name: newProject.name,
          slug: newProject.slug,
          status: newProject.stage,
          engine: newProject.engine ?? null,
          platform: newProject.platforms ?? [],
          created_by_name: localUserName,
          updated_by_name: localUserName,
          payload: newProject,
        });

        if (error) {
          console.error("add project failed", error);
          await loadProjects();
        }
      })();
    },
    [workspaceId, localUserName, loadProjects]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<GameProject>) => {
      mutateProject(id, (p) => ({ ...p, ...patch }));
    },
    [mutateProject]
  );

  const updateProjectField = useCallback(
    <K extends keyof GameProject>(id: string, key: K, value: GameProject[K]) => {
      mutateProject(id, (p) => ({ ...p, [key]: value }));
    },
    [mutateProject]
  );

  const updateModuleProgress = useCallback(
    (projectId: string, moduleKey: string, value: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(value)));

      mutateProject(projectId, (p) => {
        const mods = p.progressModules.map((m) =>
          m.key === moduleKey
            ? { ...m, progress: clamped, updatedAt: dayStamp() }
            : m
        );

        const totalW = mods.reduce((s, m) => s + m.weight, 0);
        const overall =
          totalW > 0
            ? Math.round(
              mods.reduce((s, m) => s + m.progress * m.weight, 0) / totalW
            )
            : p.overallProgress;

        return {
          ...p,
          progressModules: mods,
          overallProgress: overall,
        };
      });
    },
    [mutateProject]
  );

  const updateOverallProgress = useCallback(
    (projectId: string, value: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(value)));
      mutateProject(projectId, (p) => ({ ...p, overallProgress: clamped }));
    },
    [mutateProject]
  );

  const addCustomModule = useCallback(
    (
      projectId: string,
      mod: Omit<ProgressModule, "updatedAt" | "isCustom">
    ) => {
      mutateProject(projectId, (p) => ({
        ...p,
        progressModules: [
          ...p.progressModules,
          {
            ...mod,
            updatedAt: dayStamp(),
            isCustom: true,
          },
        ],
      }));
    },
    [mutateProject]
  );

  const removeModule = useCallback(
    (projectId: string, key: string) => {
      mutateProject(projectId, (p) => ({
        ...p,
        progressModules: p.progressModules.filter((m) => m.key !== key),
      }));
    },
    [mutateProject]
  );

  const updateModuleMeta = useCallback(
    (
      projectId: string,
      key: string,
      patch: Partial<Omit<ProgressModule, "key">>
    ) => {
      mutateProject(projectId, (p) => ({
        ...p,
        progressModules: p.progressModules.map((m) =>
          m.key === key ? { ...m, ...patch, updatedAt: dayStamp() } : m
        ),
      }));
    },
    [mutateProject]
  );

  const addProjectLink = useCallback(
    (projectId: string, link: ProjectLink) => {
      mutateProject(projectId, (p) => ({
        ...p,
        links: [...(p.links ?? []), link],
      }));
    },
    [mutateProject]
  );

  const updateProjectLink = useCallback(
    (projectId: string, idx: number, link: ProjectLink) => {
      mutateProject(projectId, (p) => {
        const links = [...(p.links ?? [])];
        links[idx] = link;
        return { ...p, links };
      });
    },
    [mutateProject]
  );

  const deleteProject = useCallback(
    (id: string) => {
      if (!workspaceId) return;

      const prevProjects = projects;

      setProjects((prev) => prev.filter((p) => p.id !== id));

      void (async () => {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          console.error("delete project failed", error);
          alert(`删除项目失败：${error.message}`);
          setProjects(prevProjects);
        }
      })();
    },
    [workspaceId, projects]
  );

  const removeProjectLink = useCallback(
    (projectId: string, idx: number) => {
      mutateProject(projectId, (p) => ({
        ...p,
        links: (p.links ?? []).filter((_, i) => i !== idx),
      }));
    },
    [mutateProject]
  );

  const addProjectTag = useCallback(
    (projectId: string, tag: string) => {
      mutateProject(projectId, (p) => ({
        ...p,
        tags: p.tags.includes(tag) ? p.tags : [...p.tags, tag],
      }));
    },
    [mutateProject]
  );

  const removeProjectTag = useCallback(
    (projectId: string, tag: string) => {
      mutateProject(projectId, (p) => ({
        ...p,
        tags: p.tags.filter((t) => t !== tag),
      }));
    },
    [mutateProject]
  );

  return (
    <Ctx.Provider
      value={{
        projects,
        addProject,
        updateProject,
        updateProjectField,
        updateModuleProgress,
        updateOverallProgress,
        addCustomModule,
        removeModule,
        updateModuleMeta,
        addProjectLink,
        updateProjectLink,
        removeProjectLink,
        addProjectTag,
        removeProjectTag,
        deleteProject,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProjectStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjectStore must be inside ProjectStoreProvider");
  return ctx;
}