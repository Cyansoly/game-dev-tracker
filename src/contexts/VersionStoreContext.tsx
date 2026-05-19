"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { mockVersions } from "@/data/mockData";
import type { VersionRecord } from "@/lib/types";

interface VersionStoreContextValue {
  versions: VersionRecord[];
  addVersion: (v: Omit<VersionRecord, "id">) => void;
  updateVersion: (id: string, patch: Partial<VersionRecord>) => void;
  deleteVersion: (id: string) => void;
  getByProject: (projectId: string) => VersionRecord[];
}

const Ctx = createContext<VersionStoreContextValue | null>(null);

export function VersionStoreProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<VersionRecord[]>(() =>
    [...mockVersions].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
  );

  const addVersion = useCallback((data: Omit<VersionRecord, "id">) => {
    const newVer: VersionRecord = { ...data, id: `ver-${Date.now()}` };
    setVersions((prev) =>
      [newVer, ...prev].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    );
  }, []);

  const updateVersion = useCallback((id: string, patch: Partial<VersionRecord>) => {
    setVersions((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const deleteVersion = useCallback((id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const getByProject = useCallback((projectId: string) =>
    versions.filter((v) => v.projectId === projectId), [versions]);

  return (
    <Ctx.Provider value={{ versions, addVersion, updateVersion, deleteVersion, getByProject }}>
      {children}
    </Ctx.Provider>
  );
}

export function useVersionStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVersionStore must be inside VersionStoreProvider");
  return ctx;
}
