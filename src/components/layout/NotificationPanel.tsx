"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BookOpen, CheckSquare, Gamepad2, X } from "lucide-react";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string, zh: boolean): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return zh ? "刚刚" : "just now";
  if (diff < 60) return zh ? `${diff} 分钟前` : `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return zh ? `${h} 小时前` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return zh ? `${d} 天前` : `${d}d ago`;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { logs } = useLogStore();
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    function onClickOut(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      setTimeout(() => document.addEventListener("mousedown", onClickOut), 10);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOut);
    };
  }, [open, onClose]);

  const getProject = (id: string) => projects.find((p) => p.id === id);

  // Derive notifications from recent activity
  type Notif = { id: string; icon: React.ReactNode; text: string; sub: string; time: string; color: string };
  const items: Notif[] = [];

  // Recent logs
  [...logs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
    .forEach((l) => {
      const proj = getProject(l.projectId);
      items.push({
        id: `log-${l.id}`,
        icon: <BookOpen className="h-3.5 w-3.5" />,
        text: zh ? `新增开发日志` : "New dev log",
        sub: `${proj?.name ?? "—"} · ${l.completed.slice(0, 30)}${l.completed.length > 30 ? "…" : ""}`,
        time: timeAgo(l.createdAt, zh),
        color: proj?.coverColor ?? "#a855f7",
      });
    });

  // Recent done tasks
  [...tasks]
    .filter((t) => t.status === "done")
    .slice(0, 3)
    .forEach((t) => {
      const proj = getProject(t.projectId);
      items.push({
        id: `task-${t.id}`,
        icon: <CheckSquare className="h-3.5 w-3.5" />,
        text: zh ? "任务已完成" : "Task completed",
        sub: t.title,
        time: timeAgo(t.createdAt, zh),
        color: "#22c55e",
      });
    });

  // Projects
  [...projects]
    .slice(0, 1)
    .forEach((p) => {
      items.push({
        id: `proj-${p.id}`,
        icon: <Gamepad2 className="h-3.5 w-3.5" />,
        text: zh ? "项目进行中" : "Project active",
        sub: `${p.name} · ${p.overallProgress}% complete`,
        time: timeAgo(p.updatedAt, zh),
        color: p.coverColor,
      });
    });

  // Sort by "recent" (just keep order)
  const displayed = items.slice(0, 6);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl shadow-2xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" style={{ color: "var(--text-2)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>
                {zh ? "最新动态" : "Activity"}
              </span>
            </div>
            <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/8" style={{ color: "var(--text-3)" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2" style={{ color: "var(--text-3)" }}>
                <Bell className="h-5 w-5 opacity-30" />
                <span className="text-xs">{zh ? "暂无动态" : "No activity yet"}</span>
              </div>
            ) : (
              displayed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: item.color + "22", color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium" style={{ color: "var(--text-1)" }}>{item.text}</span>
                      <span className="num shrink-0 text-[10px]" style={{ color: "var(--text-3)" }}>{item.time}</span>
                    </div>
                    <p className="truncate text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{item.sub}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border-color)" }}>
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>
              {zh ? "数据来自当前会话" : "From current session"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
