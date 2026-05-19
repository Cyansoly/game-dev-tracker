"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Settings } from "lucide-react";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMilestones } from "@/contexts/MilestoneContext";
import { getWeeklyBars, getWeeklyDelta } from "@/lib/stats";
import WidgetCard from "../WidgetCard";

export default function WeeklyRhythmWidget() {
  const { logs } = useLogStore();
  const { lang } = useLanguage();
  const { weeklyHoursGoal, setWeeklyHoursGoal } = useMilestones();
  const zh = lang === "zh";
  const [editGoal, setEditGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(weeklyHoursGoal));

  const bars = getWeeklyBars(logs);
  const { thisWeek, delta } = getWeeklyDelta(logs);
  const maxH = Math.max(...bars.map((b) => b.hours), weeklyHoursGoal * 0.5, 1);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <WidgetCard
      id="weekly-rhythm"
      title={zh ? "本周节奏" : "Weekly Rhythm"}
      icon={<Activity className="h-4 w-4" />}
      accentColor="#06b6d4"
      headerRight={
        <button
          onClick={() => { setEditGoal((v) => !v); setDraftGoal(String(weeklyHoursGoal)); }}
          className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/8"
          style={{ color: "var(--text-3)" }}
          title={zh ? "设置目标" : "Set goal"}
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      }
    >
      {/* Goal editor */}
      {editGoal && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: "#06b6d440", backgroundColor: "#06b6d408" }}>
          <span className="text-xs" style={{ color: "var(--text-2)" }}>
            {zh ? "本周目标:" : "Weekly goal:"}
          </span>
          <input
            value={draftGoal}
            onChange={(e) => setDraftGoal(e.target.value)}
            type="number"
            min={1}
            max={80}
            className="num w-14 rounded border px-2 py-0.5 text-sm outline-none"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "#06b6d440", color: "#06b6d4" }}
            autoFocus
          />
          <span className="text-xs" style={{ color: "var(--text-3)" }}>h</span>
          <button
            onClick={() => { setWeeklyHoursGoal(Number(draftGoal) || 20); setEditGoal(false); }}
            className="ml-auto rounded-lg bg-cyan-600 px-3 py-1 text-xs text-white"
          >
            {zh ? "保存" : "Save"}
          </button>
        </div>
      )}

      {/* Summary row */}
      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="num text-2xl font-black" style={{ color: "#06b6d4" }}>{thisWeek}h</span>
          <span className="text-sm" style={{ color: "var(--text-3)" }}>/ {weeklyHoursGoal}h</span>
        </div>
        <span
          className="num text-xs font-medium"
          style={{ color: delta >= 0 ? "#22c55e" : "#ef4444" }}
        >
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}h {zh ? "较上周" : "vs last week"}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {bars.map((bar) => {
          const isToday = bar.date === today;
          const barH = bar.hours > 0 ? Math.max(4, (bar.hours / maxH) * 72) : 2;
          const isOverGoal = bar.hours >= weeklyHoursGoal / 7;
          return (
            <div key={bar.date} className="group flex flex-1 flex-col items-center gap-1">
              {/* Tooltip */}
              <div className="invisible -translate-y-1 rounded px-1.5 py-0.5 text-[10px] font-medium group-hover:visible"
                style={{ backgroundColor: "var(--bg-card)", color: isToday ? "#06b6d4" : "var(--text-2)" }}>
                {bar.hours > 0 ? `${bar.hours}h` : "—"}
              </div>
              <motion.div
                className="w-full rounded-t-md"
                style={{
                  backgroundColor: isToday
                    ? "#06b6d4"
                    : isOverGoal
                      ? "#06b6d480"
                      : bar.hours > 0
                        ? "var(--bg-raised)"
                        : "var(--bg-raised)",
                  opacity: bar.hours > 0 ? 1 : 0.3,
                }}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              />
              <span className="text-[10px]" style={{ color: isToday ? "#06b6d4" : "var(--text-3)" }}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
