import type { DevLog, GameProject, Task, DevLogTag } from "./types";

/* ─── Tag 配色（与日志标签保持一致）─── */
export const TAG_COLORS: Record<DevLogTag, string> = {
  coding:   "#3b82f6",
  art:      "#a855f7",
  design:   "#06b6d4",
  bugfix:   "#ef4444",
  balance:  "#f97316",
  level:    "#22c55e",
  audio:    "#eab308",
  planning: "#8b5cf6",
};

/* ─── 模块配色 ─── */
export const MODULE_COLORS: Record<string, string> = {
  art:       "#a855f7",
  code:      "#3b82f6",
  level:     "#22c55e",
  audio:     "#f97316",
  narrative: "#ec4899",
  qa:        "#06b6d4",
};

/* ─── KPI ─── */
export interface AnalyticsKPIs {
  totalHours: number;
  activeDays: number;
  avgHoursPerDay: number;
  currentStreak: number;
  longestStreak: number;
}

export function computeKPIs(logs: DevLog[]): AnalyticsKPIs {
  const totalMinutes = logs.reduce((s, l) => s + l.durationMinutes, 0);
  const dates = [...new Set(logs.map((l) => l.date))].sort();
  const activeDays = dates.length;

  // streak calculation
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  const dateSet = new Set(dates);

  // current streak (backwards from today)
  let cursor = new Date();
  while (true) {
    const d = cursor.toISOString().slice(0, 10);
    if (dateSet.has(d)) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // longest streak
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(dates[i - 1]);
      prev.setDate(prev.getDate() + 1);
      if (prev.toISOString().slice(0, 10) === dates[i]) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return {
    totalHours: Math.round(totalMinutes / 60),
    activeDays,
    avgHoursPerDay: activeDays > 0 ? Math.round((totalMinutes / 60 / activeDays) * 10) / 10 : 0,
    currentStreak,
    longestStreak,
  };
}

/* ─── 每日时长趋势 ─── */
export interface DailyPoint {
  date: string;       // YYYY-MM-DD
  label: string;      // MM/DD
  minutes: number;
  logCount: number;
  topTag: string;
  ma7?: number;       // 7-day moving average (minutes)
}

export function computeDailyDuration(logs: DevLog[], days: number): DailyPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days > 0 ? days - 1 : 364));
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Filter and group by date
  const filtered = days > 0 ? logs.filter((l) => l.date >= cutoffStr) : logs;
  const byDate: Record<string, { minutes: number; count: number; tags: Record<string, number> }> = {};

  for (const l of filtered) {
    if (!byDate[l.date]) byDate[l.date] = { minutes: 0, count: 0, tags: {} };
    byDate[l.date].minutes += l.durationMinutes;
    byDate[l.date].count++;
    for (const tag of l.tags) {
      byDate[l.date].tags[tag] = (byDate[l.date].tags[tag] ?? 0) + l.durationMinutes;
    }
  }

  // Build full date range
  const points: DailyPoint[] = [];
  const endDate = new Date();
  const startDate = new Date(cutoff);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const data = byDate[key];
    const topTag = data
      ? Object.entries(data.tags).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
      : "";
    points.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      minutes: data?.minutes ?? 0,
      logCount: data?.count ?? 0,
      topTag,
    });
  }

  // 7-day moving average
  for (let i = 0; i < points.length; i++) {
    const slice = points.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.reduce((s, p) => s + p.minutes, 0) / slice.length;
    points[i].ma7 = Math.round(avg);
  }

  return points;
}

/* ─── 工作类型分布 ─── */
export interface TagDistPoint {
  tag: DevLogTag;
  label: string;
  minutes: number;
  color: string;
  percent: number;
}

export function computeTagDistribution(logs: DevLog[]): TagDistPoint[] {
  const acc: Partial<Record<DevLogTag, number>> = {};
  for (const l of logs) {
    const perTag = l.durationMinutes / Math.max(l.tags.length, 1);
    for (const tag of l.tags) {
      acc[tag] = (acc[tag] ?? 0) + perTag;
    }
  }
  const total = Object.values(acc).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  return (Object.entries(acc) as [DevLogTag, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([tag, minutes]) => ({
      tag,
      label: tag,
      minutes: Math.round(minutes),
      color: TAG_COLORS[tag],
      percent: Math.round((minutes / total) * 100),
    }));
}

/* ─── 模块雷达图 ─── */
export interface RadarPoint {
  subject: string;
  key: string;
  value: number;
  color: string;
  fullMark: number;
}

export function computeModuleAverages(
  projects: GameProject[],
  projectId: string
): RadarPoint[] {
  const MODULE_ORDER = ["art", "code", "level", "audio", "narrative", "qa"] as const;
  const targetProjects =
    projectId === "all"
      ? projects.filter((p) => !p.isArchived)
      : projects.filter((p) => p.id === projectId);

  return MODULE_ORDER.map((key) => {
    let total = 0;
    let count = 0;
    for (const p of targetProjects) {
      const mod = p.progressModules.find((m) => m.key === key);
      if (mod) { total += mod.progress; count++; }
    }
    return {
      subject: key,
      key,
      value: count > 0 ? Math.round(total / count) : 0,
      color: MODULE_COLORS[key],
      fullMark: 100,
    };
  });
}

/* ─── 项目进度对比 ─── */
export interface ProjectCompareRow {
  id: string;
  name: string;
  color: string;
  overall: number;
  modules: { key: string; label: string; progress: number; color: string }[];
  updatedAt: string;
  stage: string;
}

export function computeProjectComparison(projects: GameProject[]): ProjectCompareRow[] {
  return projects
    .filter((p) => !p.isArchived)
    .sort((a, b) => b.overallProgress - a.overallProgress)
    .map((p) => ({
      id: p.id,
      name: p.name,
      color: p.coverColor,
      overall: p.overallProgress,
      modules: p.progressModules.map((m) => ({
        key: m.key,
        label: m.label,
        progress: m.progress,
        color: MODULE_COLORS[m.key] ?? "#71717a",
      })),
      updatedAt: p.updatedAt,
      stage: p.stage,
      slug: p.slug,
    }));
}
