"use client";

import { Flame } from "lucide-react";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStreak, getTodayHours } from "@/lib/stats";
import HeatmapCalendar from "@/components/dashboard/HeatmapCalendar";
import WidgetCard from "../WidgetCard";

export default function HeatmapWidget() {
  const { logs } = useLogStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const streak = getStreak(logs);
  const todayH = getTodayHours(logs);

  return (
    <WidgetCard
      id="heatmap"
      title={zh ? "开发热力图" : "Activity Heatmap"}
      icon={<Flame className="h-4 w-4" />}
      accentColor="#f97316"
      headerRight={
        <div className="flex items-center gap-3">
          <span className="num rounded-lg bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
            🔥 {streak.current}{zh ? " 天" : "d"} {zh ? "连续" : "streak"}
          </span>
          {todayH > 0 && (
            <span className="num text-xs font-medium" style={{ color: "#22c55e" }}>
              ✅ {zh ? `今日 ${todayH}h` : `${todayH}h today`}
            </span>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <HeatmapCalendar logs={logs} weeks={24} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]" style={{ color: "var(--text-3)" }}>
        <span>{zh ? "活跃天数" : "Active days"}: <span className="num font-bold" style={{ color: "var(--text-2)" }}>{streak.activeDays}</span></span>
        <div className="flex items-center gap-1">
          <span>{zh ? "少" : "Less"}</span>
          {["rgba(34,197,94,0.1)", "rgba(34,197,94,0.3)", "rgba(34,197,94,0.55)", "rgba(34,197,94,0.8)", "rgb(34,197,94)"].map((c, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>{zh ? "多" : "More"}</span>
        </div>
      </div>
    </WidgetCard>
  );
}
