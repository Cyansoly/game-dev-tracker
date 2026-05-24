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

const LS_WORKSPACE_ID = "devtracker_workspace_id";
const LS_WORKSPACE_NAME = "devtracker_workspace_name";
const LS_LOCAL_USERNAME = "devtracker_local_username";
const LS_VIEWING_USERNAME = "devtracker_viewing_username";

type JoinWorkspaceResult = {
  result_workspace_id: string;
  result_workspace_name: string;
  result_username: string;
};

type WorkspaceContextValue = {
  workspaceId: string | null;
  workspaceName: string | null;
  localUserName: string | null;
  viewingUserName: string | null;
  participants: string[];
  joinWorkspace: (joinCode: string, username: string) => Promise<void>;
  setViewingUserName: (username: string) => void;
  changeLocalUserName: (username: string) => Promise<void>;
  refreshParticipants: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [viewingUserNameState, setViewingUserNameState] = useState<
    string | null
  >(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const refreshParticipants = useCallback(async () => {
    const id = localStorage.getItem(LS_WORKSPACE_ID);

    if (!id) {
      setParticipants([]);
      return;
    }

    const { data, error } = await supabase
      .from("participants")
      .select("username")
      .eq("workspace_id", id)
      .order("username", { ascending: true });

    if (error) {
      console.error("refresh participants failed", error);
      throw error;
    }

    const names = Array.from(
      new Set((data ?? []).map((item) => item.username).filter(Boolean))
    );

    setParticipants(names);
  }, []);

  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem(LS_WORKSPACE_ID);
    const savedWorkspaceName = localStorage.getItem(LS_WORKSPACE_NAME);
    const savedLocalUserName = localStorage.getItem(LS_LOCAL_USERNAME);
    const savedViewingUserName = localStorage.getItem(LS_VIEWING_USERNAME);

    setWorkspaceId(savedWorkspaceId);
    setWorkspaceName(savedWorkspaceName);
    setLocalUserName(savedLocalUserName);
    setViewingUserNameState(savedViewingUserName || savedLocalUserName);

    if (savedWorkspaceId) {
      refreshParticipants().catch(console.error);
    }
  }, [refreshParticipants]);

  const joinWorkspace = useCallback(
    async (joinCode: string, username: string) => {
      const cleanJoinCode = joinCode.trim();
      const cleanUsername = username.trim();

      if (!cleanJoinCode) {
        throw new Error("请输入工作区码");
      }

      if (!cleanUsername) {
        throw new Error("请输入用户名");
      }

      const { data: sessionResult, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionResult.session) {
        const { error } = await supabase.auth.signInAnonymously();

        if (error) {
          throw error;
        }
      }

      const { data, error } = await supabase
        .rpc("join_workspace", {
          p_join_code: cleanJoinCode,
          p_username: cleanUsername,
        })
        .single();

      if (error) {
        throw error;
      }

      const result = data as JoinWorkspaceResult;

      localStorage.setItem(LS_WORKSPACE_ID, result.result_workspace_id);
      localStorage.setItem(LS_WORKSPACE_NAME, result.result_workspace_name);
      localStorage.setItem(LS_LOCAL_USERNAME, cleanUsername);
      localStorage.setItem(LS_VIEWING_USERNAME, cleanUsername);

      setWorkspaceId(result.result_workspace_id);
      setWorkspaceName(result.result_workspace_name);
      setLocalUserName(cleanUsername);
      setViewingUserNameState(cleanUsername);

      await refreshParticipants();
    },
    [refreshParticipants]
  );

  const setViewingUserName = useCallback((username: string) => {
    const cleanUsername = username.trim();

    if (!cleanUsername) return;

    localStorage.setItem(LS_VIEWING_USERNAME, cleanUsername);
    setViewingUserNameState(cleanUsername);
  }, []);

  const changeLocalUserName = useCallback(
    async (username: string) => {
      const cleanUsername = username.trim();

      if (!cleanUsername) {
        throw new Error("请输入用户名");
      }

      if (!workspaceId) {
        throw new Error("请先加入工作区");
      }

      const oldLocalUserName =
        localUserName ?? localStorage.getItem(LS_LOCAL_USERNAME);
      const currentViewingUserName =
        viewingUserNameState ?? localStorage.getItem(LS_VIEWING_USERNAME);

      const { data: sessionResult, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const authUserId = sessionResult.session?.user.id;

      if (!authUserId) {
        throw new Error("当前浏览器还没有匿名身份，请重新加入工作区");
      }

      const { error } = await supabase
        .from("participants")
        .update({
          username: cleanUsername,
          last_seen_at: new Date().toISOString(),
        })
        .eq("workspace_id", workspaceId)
        .eq("auth_user_id", authUserId);

      if (error) {
        throw error;
      }

      localStorage.setItem(LS_LOCAL_USERNAME, cleanUsername);
      setLocalUserName(cleanUsername);

      if (
        !currentViewingUserName ||
        currentViewingUserName === oldLocalUserName
      ) {
        localStorage.setItem(LS_VIEWING_USERNAME, cleanUsername);
        setViewingUserNameState(cleanUsername);
      }

      await refreshParticipants();
    },
    [
      workspaceId,
      localUserName,
      viewingUserNameState,
      refreshParticipants,
    ]
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspaceName,
      localUserName,
      viewingUserName: viewingUserNameState,
      participants,
      joinWorkspace,
      setViewingUserName,
      changeLocalUserName,
      refreshParticipants,
    }),
    [
      workspaceId,
      workspaceName,
      localUserName,
      viewingUserNameState,
      participants,
      joinWorkspace,
      setViewingUserName,
      changeLocalUserName,
      refreshParticipants,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}