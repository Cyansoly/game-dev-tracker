"use client";

import { useState } from "react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import GlowCard from "@/components/ui/GlowCard";
import RecentLogs from "@/components/dashboard/RecentLogs";
import LogModal from "@/components/logs/LogModal";
import { BookOpen, Plus, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import type { DevLog } from "@/lib/types";

export default function LogsPage() {
  const { t, lang } = useLanguage();
  const { logs } = useLogStore();
  const [showModal, setShowModal] = useState(false);
  const [editLog, setEditLog] = useState<DevLog | null>(null);
  const [search, setSearch] = useState("");

  const zh = lang === "zh";
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = search.trim()
    ? sorted.filter((l) =>
        l.completed.toLowerCase().includes(search.toLowerCase()) ||
        l.blockers?.toLowerCase().includes(search.toLowerCase()) ||
        l.tomorrowPlan?.toLowerCase().includes(search.toLowerCase()) ||
        l.date.includes(search)
      )
    : sorted;

  function handleLogClick(log: DevLog) {
    setEditLog(log);
    setShowModal(true);
  }

  function handleClose() {
    setShowModal(false);
    setEditLog(null);
  }

  return (
    <AnimatedPageWrapper className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>{t.logs.title}</h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {sorted.length} {t.logs.entries}
          </p>
        </div>
        <button
          onClick={() => { setEditLog(null); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {t.logs.newLog}
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={zh ? "搜索日志内容、日期…" : "Search logs by content, date…"}
          className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500/50"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-1)",
          }}
        />
      </div>

      <GlowCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
              {t.logs.allEntries}
            </h3>
          </div>
          {search && (
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              {filtered.length} {zh ? "条结果" : "results"}
            </span>
          )}
        </div>

        {filtered.length > 0 ? (
          <RecentLogs logs={filtered} onLogClick={handleLogClick} />
        ) : (
          <div className="py-12 text-center" style={{ color: "var(--text-3)" }}>
            <p className="text-sm">
              {search ? (zh ? "没有匹配的日志" : "No matching logs") : (zh ? "还没有日志，点击「新建日志」开始记录" : "No logs yet. Click 'New Log' to get started.")}
            </p>
          </div>
        )}
      </GlowCard>

      {showModal && (
        <LogModal
          log={editLog}
          onClose={handleClose}
        />
      )}
    </AnimatedPageWrapper>
  );
}
