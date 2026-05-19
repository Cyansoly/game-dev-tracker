"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStreak, getMonthlyRate } from "@/lib/stats";
import WidgetCard from "../WidgetCard";

const MILESTONES = [7, 14, 30, 60, 100, 365];

export default function StreakWidget() {
  const { logs } = useLogStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const streak = getStreak(logs);
  const monthRate = getMonthlyRate(logs);

  const nextTarget = MILESTONES.find((m) => m > streak.current) ?? 365;
  const toNext = nextTarget - streak.current;
  const progressToNext = Math.min(100, (streak.current / nextTarget) * 100);

  return (
    <WidgetCard
      id="streak"
      title={zh ? "连续打卡" : "Streak"}
      icon={<Flame className="h-4 w-4" />}
      accentColor="#f97316"
    >
      {/* Main number */}
      <div className="mb-4 text-center">
        <motion.p
          className="num text-5xl font-black"
          style={{ color: "#f97316" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          {streak.current}
        </motion.p>
        <p className="mt-1 text-xs font-medium" style={{ color: "var(--text-3)" }}>
          {zh ? "天连续打卡" : "day streak"}
        </p>
      </div>

      {/* Progress to next milestone */}
      <div className="mb-3">
        <div className="mb-1.5 flex justify-between text-[10px]" style={{ color: "var(--text-3)" }}>
          <span>{zh ? `距离 ${nextTarget} 天` : `To ${nextTarget}-day`}</span>
          <span className="num">{zh ? `还差 ${toNext} 天` : `${toNext} more`}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-raised)" }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: "#f97316" }}
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl py-2" style={{ backgroundColor: "var(--bg-raised)" }}>
          <p className="num text-sm font-bold" style={{ color: "var(--text-1)" }}>{streak.best}</p>
          <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{zh ? "历史最长" : "Best"}</p>
        </div>
        <div className="rounded-xl py-2" style={{ backgroundColor: "var(--bg-raised)" }}>
          <p className="num text-sm font-bold" style={{ color: "#22c55e" }}>{monthRate}%</p>
          <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{zh ? "本月打卡率" : "Monthly"}</p>
        </div>
      </div>
    </WidgetCard>
  );
}
