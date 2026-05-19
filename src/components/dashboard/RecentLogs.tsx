"use client";

import { motion } from "framer-motion";
import type { DevLog } from "@/lib/types";
import { TagChip, MoodBadge } from "@/components/ui/Badge";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { Clock, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function useGetProject() {
  const { projects } = useProjectStore();
  return (projectId: string) => {
    const p = projects.find((p) => p.id === projectId);
    return p ? { name: p.name, color: p.coverColor } : { name: "—", color: "#52525b" };
  };
}

function useFormatDate() {
  const { t } = useLanguage();
  return (dateStr: string): string => {
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 86400000
    );
    if (diff === 0) return t.logs.today;
    if (diff === 1) return t.logs.yesterday;
    if (diff < 7) return `${diff}${t.logs.daysAgo}`;
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };
}

interface RecentLogsProps {
  logs: DevLog[];
  onLogClick?: (log: DevLog) => void;
  limit?: number;
}

export default function RecentLogs({ logs, onLogClick, limit }: RecentLogsProps) {
  const formatDate = useFormatDate();
  const getProject = useGetProject();
  const displayed = limit ? logs.slice(0, limit) : logs;

  return (
    <div className="flex flex-col gap-0">
      {displayed.map((log, i) => {
        const proj = getProject(log.projectId);
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className={`group flex gap-3 border-b py-3.5 last:border-0 ${onLogClick ? "cursor-pointer rounded-lg px-2 -mx-2 transition-colors hover:bg-white/[0.03]" : ""}`}
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => onLogClick?.(log)}
          >
            {/* Color bar */}
            <div
              className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: proj.color, minHeight: "32px" }}
            />

            <div className="min-w-0 flex-1">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold" style={{ color: proj.color }}>
                  {proj.name}
                </span>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>{formatDate(log.date)}</span>
                <div className="ml-auto flex items-center gap-2">
                  <MoodBadge mood={log.mood} />
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                    <Clock className="h-2.5 w-2.5" />
                    {Math.round(log.durationMinutes / 60)}h
                  </span>
                  {onLogClick && (
                    <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" style={{ color: "var(--text-3)" }} />
                  )}
                </div>
              </div>

              {/* Completed text */}
              <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                {log.completed}
              </p>

              {/* Tags */}
              {log.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {log.tags.map((tag) => (
                    <TagChip key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
