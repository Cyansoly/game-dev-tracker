"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { IdeaCapsule } from "@/lib/types";

interface IdeaStoreContextValue {
  ideas: IdeaCapsule[];
  addIdea: (idea: Omit<IdeaCapsule, "id" | "createdAt" | "updatedAt">) => void;
  updateIdea: (id: string, patch: Partial<IdeaCapsule>) => void;
  removeIdea: (id: string) => void;
  moveToProject: (id: string, projectId: string | undefined) => void;
  togglePin: (id: string) => void;
}

type IdeaRow = {
  id: string;
  workspace_id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_by_name: string;
  payload: Partial<IdeaCapsule> | null;
  created_at: string;
  updated_at: string;
};

const Ctx = createContext<IdeaStoreContextValue | null>(null);

function makeId() {
  return crypto.randomUUID();
}

function mapIdea(row: IdeaRow): IdeaCapsule {
  const payload = row.payload ?? {};

  return {
    ...payload,
    id: row.id,
    title: row.title,
    content: row.content ?? payload.content ?? "",
    tags: row.tags ?? payload.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByName: row.created_by_name,
  };
}

export function IdeaStoreProvider({ children }: { children: ReactNode }) {
  const { workspaceId, localUserName } = useWorkspace();
  const [ideas, setIdeas] = useState<IdeaCapsule[]>([]);

  const loadIdeas = useCallback(async () => {
    if (!workspaceId) {
      setIdeas([]);
      return;
    }

    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("load ideas failed", error);
      return;
    }

    setIdeas(((data ?? []) as IdeaRow[]).map(mapIdea));
  }, [workspaceId]);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  const addIdea = useCallback(
    (data: Omit<IdeaCapsule, "id" | "createdAt" | "updatedAt">) => {
      if (!workspaceId) {
        console.error("add idea failed: missing workspaceId");
        alert("还没有加入工作区，无法保存灵感。");
        return;
      }

      if (!localUserName) {
        console.error("add idea failed: missing localUserName");
        alert("还没有设置用户名，无法保存灵感。");
        return;
      }

      const now = new Date().toISOString();

      const newIdea: IdeaCapsule = {
        ...data,
        id: makeId(),
        createdAt: now,
        updatedAt: now,
        createdByName: localUserName,
      };

      setIdeas((prev) => [newIdea, ...prev]);

      void (async () => {
        const { error } = await supabase.from("ideas").insert({
          id: newIdea.id,
          workspace_id: workspaceId,
          title: newIdea.title,
          content: newIdea.content,
          tags: newIdea.tags ?? [],
          created_by_name: localUserName,
          payload: newIdea,
        });

        if (error) {
          console.error("add idea failed", error);
          alert(`保存灵感失败：${error.message}`);
          await loadIdeas();
        }
      })();
    },
    [workspaceId, localUserName, loadIdeas]
  );

  const updateIdea = useCallback(
    (id: string, patch: Partial<IdeaCapsule>) => {
      if (!workspaceId) return;

      setIdeas((prev) =>
        prev.map((idea) => {
          if (idea.id !== id) return idea;

          const next: IdeaCapsule = {
            ...idea,
            ...patch,
            updatedAt: new Date().toISOString(),
          };

          void (async () => {
            const { error } = await supabase
              .from("ideas")
              .update({
                title: next.title,
                content: next.content,
                tags: next.tags ?? [],
                payload: next,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("workspace_id", workspaceId);

            if (error) {
              console.error("update idea failed", error);
              alert(`更新灵感失败：${error.message}`);
              await loadIdeas();
            }
          })();

          return next;
        })
      );
    },
    [workspaceId, loadIdeas]
  );

  const removeIdea = useCallback(
    (id: string) => {
      if (!workspaceId) return;

      const prevIdeas = ideas;
      setIdeas((prev) => prev.filter((i) => i.id !== id));

      void (async () => {
        const { error } = await supabase
          .from("ideas")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          console.error("remove idea failed", error);
          alert(`删除灵感失败：${error.message}`);
          setIdeas(prevIdeas);
        }
      })();
    },
    [workspaceId, ideas]
  );

  const moveToProject = useCallback(
    (id: string, projectId: string | undefined) => {
      updateIdea(id, { projectId });
    },
    [updateIdea]
  );

  const togglePin = useCallback(
    (id: string) => {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return;

      updateIdea(id, { pinned: !idea.pinned });
    },
    [ideas, updateIdea]
  );

  return (
    <Ctx.Provider
      value={{
        ideas,
        addIdea,
        updateIdea,
        removeIdea,
        moveToProject,
        togglePin,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useIdeaStore() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useIdeaStore must be inside IdeaStoreProvider");
  }

  return ctx;
}