"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import ProgressRing from "@/components/ui/ProgressRing";
import { useMilestones } from "@/contexts/MilestoneContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTotalHours, getStreak } from "@/lib/stats";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import type { Achievement } from "@/lib/stats";
import { cn } from "@/lib/cn";

type TabId = "all" | "unlocked" | "locked";

function AchievementCard({ ach, index }: { ach: Achievement; index: number }) {
  return (
    <motion.div
      className="relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all"
      style={{
        borderColor: ach.unlocked ? "#eab30840" : "var(--border-color)",
        backgroundColor: ach.unlocked ? "#eab30808" : "var(--bg-raised)",
      }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: ach.unlocked ? 1 : 0.45, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Emoji */}
      <span
        className={cn("text-3xl", !ach.unlocked && "grayscale opacity-40")}
        role="img"
        aria-label={ach.label}
      >
        {ach.emoji}
      </span>

      {/* Name */}
      <p
        className="text-xs font-semibold leading-tight"
        style={{ color: ach.unlocked ? "var(--text-1)" : "var(--text-3)" }}
      >
        {ach.label}
      </p>

      {/* Desc */}
      <p className="text-[10px] leading-tight" style={{ color: "var(--text-3)" }}>
        {ach.desc}
      </p>

      {/* Unlock date or progress bar */}
      {ach.unlocked ? (
        <span
          className="num rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{ backgroundColor: "#eab30818", color: "#eab308" }}
        >
          ✓ {ach.unlockedAt ?? "已解锁"}
        </span>
      ) : ach.progress !== undefined ? (
        <div className="w-full">
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--border-color)" }}
          >
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: "#eab308" }}
              initial={{ width: 0 }}
              animate={{ width: `${ach.progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          <p className="num mt-1 text-[9px]" style={{ color: "var(--text-3)" }}>
            {ach.progress}%
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

export default function MilestonesPage() {
  const { achievements } = useMilestones();
  const { lang } = useLanguage();
  const { logs } = useLogStore();
  const { projects } = useProjectStore();
  const zh = lang === "zh";
  const [tab, setTab] = useState<TabId>("all");

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const totalHours = getTotalHours(logs, projects);
  const streak = getStreak(logs);
  const pct = Math.round((unlocked.length / achievements.length) * 100);

  const displayed =
    tab === "all"      ? achievements :
    tab === "unlocked" ? unlocked :
    locked;

  const TABS: { id: TabId; zh: string; en: string; count: number }[] = [
    { id: "all",      zh: "全部",   en: "All",      count: achievements.length },
    { id: "unlocked", zh: "已解锁", en: "Unlocked",  count: unlocked.length },
    { id: "locked",   zh: "未解锁", en: "Locked",    count: locked.length },
  ];

  return (
    <AnimatedPageWrapper className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
            {zh ? "开发里程碑" : "Dev Milestones"}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {zh
              ? `已解锁 ${unlocked.length} / ${achievements.length} 个成就`
              : `${unlocked.length} / ${achievements.length} achievements unlocked`}
          </p>
        </div>

        {/* Progress ring + stats */}
        <div className="flex items-center gap-5">
          <ProgressRing
            progress={pct}
            size={72}
            strokeWidth={6}
            color="#eab308"
            showLabel
            labelSize="md"
          />
          <div className="flex flex-col gap-2">
            {[
              { label: zh ? "累计时长" : "Total Hours", value: `${totalHours}h`, color: "#3b82f6" },
              { label: zh ? "当前连击" : "Current Streak", value: `${streak.current}d`, color: "#f97316" },
              { label: zh ? "历史最长" : "Best Streak",    value: `${streak.best}d`,    color: "#a855f7" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="num text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="mb-5 flex gap-0.5 rounded-xl border p-1"
        style={{ borderColor: "var(--border-color)", backgroundColor: "rgba(128,128,128,0.04)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: tab === t.id ? "var(--text-1)" : "var(--text-3)" }}
          >
            {tab === t.id && (
              <motion.div
                layoutId="ms-tab-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: "var(--bg-raised)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              {zh ? t.zh : t.en}
              <span
                className="num rounded-full px-1.5 py-0 text-[10px]"
                style={{ backgroundColor: "rgba(128,128,128,0.12)", color: "var(--text-3)" }}
              >
                {t.count}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {displayed.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayed.map((ach, i) => (
                <AchievementCard key={ach.id} ach={ach} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="mb-3 text-4xl grayscale opacity-40">🏆</span>
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "暂无解锁的里程碑" : "No milestones unlocked yet"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                {zh ? "记录日志、完成任务来解锁成就！" : "Log dev sessions and complete tasks to unlock achievements!"}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AnimatedPageWrapper>
  );
}
