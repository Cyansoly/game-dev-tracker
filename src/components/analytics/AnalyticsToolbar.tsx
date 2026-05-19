"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GameProject } from "@/lib/types";

export type DaysFilter = 7 | 30 | 90 | 0;

interface AnalyticsToolbarProps {
  projects: GameProject[];
  projectFilter: string;
  onProjectChange: (id: string) => void;
  days: DaysFilter;
  onDaysChange: (d: DaysFilter) => void;
}

export default function AnalyticsToolbar({
  projects,
  projectFilter,
  onProjectChange,
  days,
  onDaysChange,
}: AnalyticsToolbarProps) {
  const { t } = useLanguage();
  const a = t.analytics;

  const dayOptions: { value: DaysFilter; label: string }[] = [
    { value: 7,  label: a.days7 },
    { value: 30, label: a.days30 },
    { value: 90, label: a.days90 },
    { value: 0,  label: a.allTime },
  ];

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {/* Project selector */}
      <select
        value={projectFilter}
        onChange={(e) => onProjectChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500/50"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--text-1)",
        }}
      >
        <option value="all">{a.allProjects}</option>
        {projects.filter((p) => !p.isArchived).map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Time range segmented control */}
      <div
        className="flex items-center gap-0.5 rounded-lg p-1"
        style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}
      >
        {dayOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onDaysChange(value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              days === value
                ? "bg-blue-600 text-white shadow-sm"
                : "transition-colors hover:bg-white/8"
            )}
            style={days === value ? {} : { color: "var(--text-3)" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
