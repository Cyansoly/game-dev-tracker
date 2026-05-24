"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function WorkspaceUserSwitcher() {
  const {
    workspaceName,
    localUserName,
    viewingUserName,
    participants,
    setViewingUserName,
  } = useWorkspace();

  if (!localUserName) return null;

  return (
    <div className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 text-xs md:flex"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div className="flex flex-col leading-tight">
        <span style={{ color: "var(--text-3)" }}>
          {workspaceName ?? "工作区"}
        </span>
        <span style={{ color: "var(--text-1)" }}>
          当前用户：{localUserName}
        </span>
      </div>

      <select
        value={viewingUserName ?? localUserName}
        onChange={(e) => setViewingUserName(e.target.value)}
        className="rounded-lg border px-2 py-1 text-xs outline-none"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-1)",
        }}
      >
        {(participants.length > 0 ? participants : [localUserName]).map(
          (name) => (
            <option key={name} value={name}>
              查看：{name}
            </option>
          )
        )}
      </select>
    </div>
  );
}