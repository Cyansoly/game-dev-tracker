"use client";

import { cn } from "@/lib/cn";
import type { ProjectStage, DevMomentum } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

/* ──── Stage Badge ──── */
const stageStyle: Record<ProjectStage, string> = {
  concept:    "bg-zinc-800 text-zinc-400 border border-zinc-700",
  prototype:  "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  production: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  polish:     "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  released:   "bg-green-500/10 text-green-400 border border-green-500/20",
  paused:     "bg-zinc-800 text-zinc-500 border border-zinc-700",
};

export function StageBadge({ stage }: { stage: ProjectStage }) {
  const { t } = useLanguage();
  return (
    <span className={cn("badge", stageStyle[stage])}>
      {t.stages[stage]}
    </span>
  );
}

/* ──── Momentum Badge ──── */
const momentumConfig: Record<DevMomentum, { dot: string; text: string; emoji: string }> = {
  idle:   { dot: "bg-zinc-500",   text: "text-zinc-400",   emoji: "🌙" },
  steady: { dot: "bg-blue-400",   text: "text-blue-400",   emoji: "🌊" },
  active: { dot: "bg-green-400",  text: "text-green-400",  emoji: "⚡" },
  crunch: { dot: "bg-orange-400", text: "text-orange-400", emoji: "🔥" },
};

export function MomentumBadge({ momentum }: { momentum: DevMomentum }) {
  const { t } = useLanguage();
  const cfg = momentumConfig[momentum];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium", cfg.text)}>
      <span>{cfg.emoji}</span>
      {t.momentum[momentum]}
    </span>
  );
}

/* ──── Priority Badge ──── */
const priorityStyle: Record<string, string> = {
  low:    "bg-zinc-800 text-zinc-500 border border-zinc-700",
  medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  high:   "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  urgent: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useLanguage();
  const label = t.priority[priority as keyof typeof t.priority] ?? priority;
  return (
    <span className={cn("badge", priorityStyle[priority] ?? priorityStyle.medium)}>
      {label}
    </span>
  );
}

/* ──── Tag Chip ──── */
const tagColors: Record<string, string> = {
  coding:   "bg-blue-500/8 text-blue-400 border-blue-500/15",
  bugfix:   "bg-red-500/8 text-red-400 border-red-500/15",
  art:      "bg-purple-500/8 text-purple-400 border-purple-500/15",
  design:   "bg-pink-500/8 text-pink-400 border-pink-500/15",
  level:    "bg-cyan-500/8 text-cyan-400 border-cyan-500/15",
  audio:    "bg-green-500/8 text-green-400 border-green-500/15",
  balance:  "bg-orange-500/8 text-orange-400 border-orange-500/15",
  planning: "bg-zinc-700/40 text-zinc-400 border-zinc-700/50",
};

export function TagChip({ tag }: { tag: string }) {
  const { t } = useLanguage();
  const label = t.tags[tag as keyof typeof t.tags] ?? tag;
  const colorClass = tagColors[tag] ?? "bg-zinc-800 text-zinc-500 border-zinc-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

/* ──── Mood Badge ──── */
const moodEmoji: Record<string, string> = {
  great:   "🚀",
  good:    "😊",
  neutral: "😐",
  tired:   "😴",
  blocked: "🚧",
};
const moodColor: Record<string, string> = {
  great:   "text-green-400",
  good:    "text-blue-400",
  neutral: "text-zinc-400",
  tired:   "text-orange-400",
  blocked: "text-red-400",
};

export function MoodBadge({ mood }: { mood: string }) {
  const { t } = useLanguage();
  const label = t.mood[mood as keyof typeof t.mood] ?? mood;
  return (
    <span className={cn("flex items-center gap-1 text-xs", moodColor[mood] ?? "text-zinc-400")}>
      <span>{moodEmoji[mood] ?? "😐"}</span>
      <span>{label}</span>
    </span>
  );
}
