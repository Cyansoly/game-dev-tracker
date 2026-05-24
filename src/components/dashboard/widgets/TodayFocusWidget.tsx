"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckSquare, Clock, Flame, Plus } from "lucide-react";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTodayHours, getStreak } from "@/lib/stats";
import WidgetCard from "../WidgetCard";
import LogModal from "@/components/logs/LogModal";
import InlineText from "@/components/inline/InlineText";

function StatPill({
  value, unit, label, color, onClick,
}: {
  value: string | number; unit?: string; label: string;
  color: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}
    >
      <div className="flex items-baseline gap-0.5">
        <span className="num text-2xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-xs font-medium" style={{ color: `${color}99` }}>{unit}</span>}
      </div>
      <span className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>{label}</span>
    </button>
  );
}

export default function TodayFocusWidget() {
  const { logs } = useLogStore();
  const { personalTasks: tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const [showLogModal, setShowLogModal] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayHours = getTodayHours(logs);
  const todayLogs = logs.filter((l) => l.date === today).length;
  const activeTasks = tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length;
  const streak = getStreak(logs);

  // Greeting
  const hour = new Date().getHours();
  const greeting = zh
    ? hour < 5 ? "深夜好" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好"
    : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const firstProject = projects.find((p) => !p.isArchived);

  // Total tracking days — from earliest log or first project startedAt
  const allDates = logs.map((l) => l.date).sort();
  const firstDate = allDates[0] ?? firstProject?.startedAt ?? today;
  const totalDays = Math.max(1, Math.floor((Date.now() - new Date(firstDate).getTime()) / 86400000) + 1);

  const dateStr = new Date().toLocaleDateString(zh ? "zh-CN" : "en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <>
      <WidgetCard
        id="today-focus"
        title={zh ? "今日焦点" : "Today's Focus"}
        icon={<Flame className="h-4 w-4" />}
        accentColor="#f97316"
        headerRight={
          <span className="num text-xs font-medium" style={{ color: "var(--text-3)" }}>
            {dateStr}
          </span>
        }
      >
        {/* Greeting row */}
        <div className="mb-5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
              {greeting}
            </h2>
            <span className="num text-sm font-medium" style={{ color: "var(--text-3)" }}>
              · {zh ? `开发追踪第 ` : "Tracking Day "}<span style={{ color: "#f97316" }}>{totalDays}</span>{zh ? " 天" : ""}
            </span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
            {streak.current > 0
              ? (zh ? `已连续打卡 ${streak.current} 天 🔥` : `${streak.current}-day streak 🔥`)
              : (zh ? "今天还没有记录，来开始吧！" : "No logs yet today — let's start!")}
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2">
          <StatPill
            value={todayHours || "0"}
            unit={zh ? "h" : "h"}
            label={zh ? "今日时长" : "Today"}
            color="#f97316"
            onClick={() => setShowLogModal(true)}
          />
          <StatPill
            value={todayLogs}
            label={zh ? "今日日志" : "Logs"}
            color="#a855f7"
            onClick={() => setShowLogModal(true)}
          />
          <StatPill
            value={activeTasks}
            label={zh ? "进行中任务" : "Active Tasks"}
            color="#3b82f6"
          />
          <StatPill
            value={streak.current}
            label={zh ? "连续天数" : "Streak"}
            color="#22c55e"
          />
        </div>

        {/* Quick capture */}
        <button
          onClick={() => setShowLogModal(true)}
          className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-all hover:bg-orange-500/5 hover:border-orange-500/30"
          style={{ borderColor: "var(--border-color)", color: "var(--text-3)" }}
        >
          <Plus className="h-4 w-4" style={{ color: "#f97316" }} />
          <span>{zh ? "+ 快速记录今日开发" : "+ Quick log today's work"}</span>
        </button>
      </WidgetCard>

      {showLogModal && <LogModal onClose={() => setShowLogModal(false)} />}
    </>
  );
}
