"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Gamepad2, BookOpen, CheckSquare, ArrowRight, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useSearch } from "@/contexts/SearchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

type ResultItem =
  | { type: "project"; id: string; title: string; subtitle: string; href: string; color: string }
  | { type: "log";     id: string; title: string; subtitle: string; href: string; color: string }
  | { type: "task";    id: string; title: string; subtitle: string; href: string; color: string };

const STATUS_COLORS: Record<string, string> = {
  todo:        "#71717a",
  in_progress: "#3b82f6",
  review:      "#f59e0b",
  done:        "#22c55e",
};

export default function CommandPalette() {
  const { open, closePalette } = useSearch();
  const { projects } = useProjectStore();
  const { logs } = useLogStore();
  const { tasks } = useTaskStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results: ResultItem[] = (() => {
    const q = query.toLowerCase().trim();
    const items: ResultItem[] = [];

    projects
      .filter((p) => !p.isArchived && (!q || p.name.toLowerCase().includes(q) || p.genre.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
      .slice(0, 4)
      .forEach((p) => items.push({ type: "project", id: p.id, title: p.name, subtitle: p.genre + " · " + p.currentVersion, href: `/projects/${p.slug}`, color: p.coverColor }));

    logs
      .filter((l) => !q || l.completed.toLowerCase().includes(q) || l.date.includes(q))
      .slice(0, 3)
      .forEach((l) => {
        const proj = projects.find((p) => p.id === l.projectId);
        items.push({ type: "log", id: l.id, title: l.completed.slice(0, 55) + (l.completed.length > 55 ? "…" : ""), subtitle: (proj?.name ?? "—") + " · " + l.date, href: `/logs`, color: proj?.coverColor ?? "#a855f7" });
      });

    tasks
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => {
        const proj = projects.find((p) => p.id === t.projectId);
        items.push({ type: "task", id: t.id, title: t.title, subtitle: (proj?.name ?? "—") + " · " + t.status, href: `/tasks`, color: STATUS_COLORS[t.status] ?? "#71717a" });
      });

    return items;
  })();

  const safeActive = Math.max(0, Math.min(active, results.length - 1));

  const go = useCallback((href: string) => {
    closePalette();
    router.push(href);
  }, [closePalette, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { closePalette(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && results[safeActive]) { go(results[safeActive].href); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, safeActive, go, closePalette]);

  useEffect(() => {
    function onGlobal(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) closePalette(); else import("@/contexts/SearchContext");
      }
    }
    window.addEventListener("keydown", onGlobal);
    return () => window.removeEventListener("keydown", onGlobal);
  }, [open, closePalette]);

  useEffect(() => { setActive(0); }, [query]);

  const groupLabels: Record<string, string> = {
    project: zh ? "项目" : "Projects",
    log:     zh ? "日志" : "Dev Logs",
    task:    zh ? "任务" : "Tasks",
  };

  const TypeIcon = {
    project: Gamepad2,
    log:     BookOpen,
    task:    CheckSquare,
  };

  let lastType = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closePalette}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-3)" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={zh ? "搜索项目、日志、任务…" : "Search projects, logs, tasks…"}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-1)" }}
              />
              <kbd
                className="num rounded px-1.5 py-0.5 text-[11px]"
                style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-3)", border: "1px solid var(--border-color)" }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Hash className="h-5 w-5" style={{ color: "var(--text-3)" }} />
                  <span className="text-sm" style={{ color: "var(--text-3)" }}>
                    {query ? (zh ? "没有找到结果" : "No results found") : (zh ? "输入关键词开始搜索" : "Type to search")}
                  </span>
                </div>
              ) : (
                results.map((item, idx) => {
                  const showGroup = item.type !== lastType;
                  lastType = item.type;
                  const Icon = TypeIcon[item.type];
                  const isActive = idx === safeActive;

                  return (
                    <div key={item.id}>
                      {showGroup && (
                        <div
                          className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest"
                          style={{ color: "var(--text-3)" }}
                        >
                          {groupLabels[item.type]}
                        </div>
                      )}
                      <button
                        onClick={() => go(item.href)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg mx-2 px-3 py-2.5 text-left transition-colors",
                          isActive ? "bg-blue-600/15 text-blue-300" : ""
                        )}
                        style={{
                          width: "calc(100% - 16px)",
                          color: isActive ? undefined : "var(--text-1)",
                          backgroundColor: isActive ? undefined : undefined,
                        }}
                      >
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: item.color + "22", border: `1px solid ${item.color}40` }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium" style={{ color: isActive ? "#93c5fd" : "var(--text-1)" }}>
                            {item.title}
                          </div>
                          <div className="truncate text-xs" style={{ color: "var(--text-3)" }}>
                            {item.subtitle}
                          </div>
                        </div>
                        {isActive && <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center gap-4 px-4 py-2 text-[11px]"
              style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-3)" }}
            >
              <span>↑↓ {zh ? "导航" : "navigate"}</span>
              <span>↵ {zh ? "跳转" : "go"}</span>
              <span>ESC {zh ? "关闭" : "close"}</span>
              <span className="ml-auto num">Ctrl+K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
