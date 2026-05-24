"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function JoinPage() {
  const router = useRouter();
  const { joinWorkspace } = useWorkspace();

  const [username, setUsername] = useState("");
  const [joinCode, setJoinCode] = useState("backpack-dev-7f3a91");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setError(null);
      setSubmitting(true);
      await joinWorkspace(joinCode, username);
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">加入工作区</h1>

        <div className="space-y-2">
          <label className="text-sm">用户名</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例如：小王"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">工作区码</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          className="w-full rounded-lg px-4 py-2 border"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "加入中..." : "加入工作区"}
        </button>
      </div>
    </main>
  );
}