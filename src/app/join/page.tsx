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
            console.error(err);
            setError(err instanceof Error ? err.message : "加入工作区失败");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                backgroundColor: "var(--bg-page)",
                color: "var(--text-1)",
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl border p-6 shadow-sm"
                style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-card)",
                }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">加入工作区</h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
                        输入你的用户名和工作区码，进入团队共享空间。
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">用户名</label>
                        <input
                            className="w-full rounded-lg border px-3 py-2 outline-none"
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--input-bg)",
                                color: "var(--text-1)",
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="例如：小王"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">工作区码</label>
                        <input
                            className="w-full rounded-lg border px-3 py-2 outline-none"
                            style={{
                                borderColor: "var(--border-color)",
                                backgroundColor: "var(--input-bg)",
                                color: "var(--text-1)",
                            }}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="例如：backpack-dev-7f3a91"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                        style={{
                            backgroundColor: "var(--accent)",
                            color: "white",
                        }}
                    >
                        {submitting ? "加入中..." : "加入工作区"}
                    </button>
                </div>
            </div>
        </main>
    );
}