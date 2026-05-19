"use client";

import { useState } from "react";
import { BookOpen, ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DevLog } from "@/lib/types";
import { MoodBadge, TagChip } from "@/components/ui/Badge";
import LogModal from "@/components/logs/LogModal";
import WidgetCard from "../WidgetCard";

export default function RecentLogsWidget() {
  const { logs } = useLogStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const [editLog, setEditLog] = useState<DevLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const getProject = (id: string) => projects.find((p) => p.id === id);

  function relativeDate(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return zh ? "今天" : "Today";
    if (diff === 1) return zh ? "昨天" : "Yesterday";
    return zh ? `${diff} 天前` : `${diff}d ago`;
  }

  return (
    <>
      <WidgetCard
        id="recent-logs"
        title={zh ? "最近日志" : "Recent Logs"}
        icon={<BookOpen className="h-4 w-4" />}
        accentColor="#a855f7"
        headerRight={
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditLog(null); setShowModal(true); }}
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: "#a855f7" }}>
              <Plus className="h-3 w-3" />{zh ? "记录" : "Log"}
            </button>
            <Link href="/logs" className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-3)" }}>
              {zh ? "全部" : "All"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {recent.map((log, i) => {
            const proj = getProject(log.projectId);
            return (
              <motion.button
                key={log.id}
                onClick={() => { setEditLog(log); setShowModal(true); }}
                className="group flex gap-3 rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md"
                style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Color bar */}
                <div
                  className="mt-0.5 h-auto w-[3px] shrink-0 rounded-full"
                  style={{ backgroundColor: proj?.coverColor ?? "#52525b" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium" style={{ color: "var(--text-1)" }}>
                      {log.completed.slice(0, 60)}{log.completed.length > 60 ? "…" : ""}
                    </span>
                    <span className="num shrink-0 text-[10px]" style={{ color: "var(--text-3)" }}>
                      {relativeDate(log.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {proj && (
                      <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{proj.name}</span>
                    )}
                    <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>
                      {Math.round(log.durationMinutes / 60 * 10) / 10}h
                    </span>
                    <MoodBadge mood={log.mood} />
                    {log.tags.slice(0, 2).map((tag) => (
                      <TagChip key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
          {recent.length === 0 && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 py-8 text-xs"
              style={{ color: "var(--text-3)" }}>
              <Plus className="h-3.5 w-3.5" />
              {zh ? "记录第一条日志" : "Log your first entry"}
            </button>
          )}
        </div>
      </WidgetCard>
      {showModal && <LogModal log={editLog} onClose={() => { setShowModal(false); setEditLog(null); }} />}
    </>
  );
}
