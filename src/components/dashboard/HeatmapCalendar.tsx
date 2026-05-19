"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeatmapCalendarProps {
  logs: { date: string; durationMinutes: number }[];
  weeks?: number;
}

const DAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const DAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 60)  return 1;
  if (minutes < 120) return 2;
  if (minutes < 240) return 3;
  return 4;
}

const intensityColors = [
  "bg-zinc-800/60",
  "bg-blue-900/60",
  "bg-blue-700/60",
  "bg-blue-500/70",
  "bg-blue-400",
];

export default function HeatmapCalendar({
  logs,
  weeks = 16,
}: HeatmapCalendarProps) {
  const { lang, t } = useLanguage();
  const DAYS = lang === "zh" ? DAYS_ZH : DAYS_EN;

  const cells = useMemo(() => {
    const logMap = new Map<string, number>();
    for (const l of logs) {
      logMap.set(l.date, (logMap.get(l.date) ?? 0) + l.durationMinutes);
    }

    const today = new Date();
    const totalDays = weeks * 7;
    const result: { date: string; minutes: number; intensity: number }[][] = [];
    let col: { date: string; minutes: number; intensity: number }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const minutes = logMap.get(dateStr) ?? 0;
      col.unshift({ date: dateStr, minutes, intensity: getIntensity(minutes) });
      if (col.length === 7) {
        result.push(col);
        col = [];
      }
    }
    if (col.length) result.push(col);
    return result;
  }, [logs, weeks]);

  return (
    <div>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-0">
          {DAYS.map((d, i) => (
            <span key={i} className="flex h-3 w-3 items-center text-[9px] text-zinc-700">
              {i % 2 === 0 ? d : ""}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {cells.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <motion.div
                  key={cell.date}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: (wi * 7 + di) * 0.004 }}
                  title={`${cell.date}: ${Math.round(cell.minutes / 60)}h`}
                  className={cn(
                    "h-3 w-3 cursor-default rounded-[2px] transition-opacity hover:opacity-80",
                    intensityColors[cell.intensity]
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-zinc-700">{t.dashboard.heatmapLess}</span>
        {intensityColors.map((c, i) => (
          <div key={i} className={cn("h-2.5 w-2.5 rounded-[2px]", c)} />
        ))}
        <span className="text-[10px] text-zinc-700">{t.dashboard.heatmapMore}</span>
      </div>
    </div>
  );
}
