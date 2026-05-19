"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useMilestones } from "@/contexts/MilestoneContext";
import { useLanguage } from "@/contexts/LanguageContext";
import WidgetCard from "../WidgetCard";

export default function AchievementsWidget() {
  const { achievements } = useMilestones();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <WidgetCard
      id="achievements"
      title={zh ? "成就墙" : "Achievements"}
      icon={<Trophy className="h-4 w-4" />}
      accentColor="#eab308"
      headerRight={
        <span className="num text-xs" style={{ color: "var(--text-3)" }}>
          {unlocked.length}/{achievements.length}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.id}
            className="group relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all"
            style={{
              borderColor: ach.unlocked ? "#eab30840" : "var(--border-color)",
              backgroundColor: ach.unlocked ? "#eab30808" : "var(--bg-raised)",
              opacity: ach.unlocked ? 1 : 0.55,
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: ach.unlocked ? 1 : 0.55, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className={ach.unlocked ? "text-2xl" : "grayscale text-2xl opacity-40"}>
              {ach.emoji}
            </span>
            <p className="text-[11px] font-semibold leading-tight" style={{ color: ach.unlocked ? "var(--text-1)" : "var(--text-3)" }}>
              {ach.label}
            </p>
            {!ach.unlocked && ach.progress !== undefined && (
              <div className="w-full">
                <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${ach.progress}%`, backgroundColor: "#eab308" }}
                  />
                </div>
                <p className="num mt-0.5 text-[9px]" style={{ color: "var(--text-3)" }}>{ach.progress}%</p>
              </div>
            )}
            {/* Tooltip on hover */}
            <div className="pointer-events-none invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] shadow-lg group-hover:visible"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-2)" }}>
              {ach.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </WidgetCard>
  );
}
