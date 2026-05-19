import type { GameProject, DevLog, Task } from "./types";

/* ─── Day N ─── */
export function getDayN(project: GameProject): number {
  const start = project.startedAt ?? project.createdAt;
  const diff = Date.now() - new Date(start).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

/* ─── Project cumulative hours (logs + manual offset) ─── */
export function getProjectHours(
  project: GameProject,
  logs: DevLog[]
): number {
  const logMinutes = logs
    .filter((l) => l.projectId === project.id)
    .reduce((s, l) => s + l.durationMinutes, 0);
  const offset = (project.manualHoursOffset ?? 0) * 60;
  return Math.round((logMinutes + offset) / 60 * 10) / 10;
}

/* ─── Global cumulative hours ─── */
export function getTotalHours(logs: DevLog[], projects: GameProject[]): number {
  const logMinutes = logs.reduce((s, l) => s + l.durationMinutes, 0);
  const offsetMinutes = projects.reduce((s, p) => s + (p.manualHoursOffset ?? 0) * 60, 0);
  return Math.round((logMinutes + offsetMinutes) / 60 * 10) / 10;
}

/* ─── Today's hours ─── */
export function getTodayHours(logs: DevLog[]): number {
  const today = new Date().toISOString().slice(0, 10);
  const mins = logs
    .filter((l) => l.date === today)
    .reduce((s, l) => s + l.durationMinutes, 0);
  return Math.round(mins / 60 * 10) / 10;
}

/* ─── Streak (consecutive days with at least one log) ─── */
export function getStreak(logs: DevLog[]): { current: number; best: number; activeDays: number } {
  if (logs.length === 0) return { current: 0, best: 0, activeDays: 0 };

  const dates = [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    let cursor = new Date(dates[0]);
    for (const d of dates) {
      const dd = new Date(d);
      const diff = Math.round((cursor.getTime() - dd.getTime()) / 86400000);
      if (diff <= 1) { current++; cursor = dd; }
      else break;
    }
  }

  // Best streak
  let best = 0, run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
    );
    if (diff === 1) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  best = Math.max(best, current, dates.length > 0 ? 1 : 0);

  return { current, best, activeDays: dates.length };
}

/* ─── Weekly hours (last 7 days bar data) ─── */
export function getWeeklyBars(logs: DevLog[]): { date: string; label: string; hours: number }[] {
  const days: { date: string; label: string; hours: number }[] = [];
  const DAY_ZH = ["日", "一", "二", "三", "四", "五", "六"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const date = d.toISOString().slice(0, 10);
    const mins = logs
      .filter((l) => l.date === date)
      .reduce((s, l) => s + l.durationMinutes, 0);
    days.push({ date, label: DAY_ZH[d.getDay()], hours: Math.round(mins / 60 * 10) / 10 });
  }
  return days;
}

/* ─── This-week vs last-week delta ─── */
export function getWeeklyDelta(logs: DevLog[]): { thisWeek: number; lastWeek: number; delta: number } {
  const now = Date.now();
  const thisWeekStart = now - 7 * 86400000;
  const lastWeekStart = now - 14 * 86400000;

  const thisWeek = logs
    .filter((l) => new Date(l.date).getTime() >= thisWeekStart)
    .reduce((s, l) => s + l.durationMinutes, 0) / 60;
  const lastWeek = logs
    .filter((l) => {
      const t = new Date(l.date).getTime();
      return t >= lastWeekStart && t < thisWeekStart;
    })
    .reduce((s, l) => s + l.durationMinutes, 0) / 60;

  return {
    thisWeek: Math.round(thisWeek * 10) / 10,
    lastWeek: Math.round(lastWeek * 10) / 10,
    delta: Math.round((thisWeek - lastWeek) * 10) / 10,
  };
}

/* ─── Project 7-day hours ─── */
export function getProjectWeekHours(projectId: string, logs: DevLog[]): number {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const mins = logs
    .filter((l) => l.projectId === projectId && l.date >= weekAgo)
    .reduce((s, l) => s + l.durationMinutes, 0);
  return Math.round(mins / 60 * 10) / 10;
}

/* ─── Last activity date for project ─── */
export function getLastActivity(projectId: string, logs: DevLog[]): string | null {
  const sorted = logs
    .filter((l) => l.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0]?.date ?? null;
}

/* ─── Days since last activity ─── */
export function getDaysSinceActivity(projectId: string, logs: DevLog[]): number | null {
  const last = getLastActivity(projectId, logs);
  if (!last) return null;
  return Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
}

/* ─── Days until target release ─── */
export function getDaysUntilRelease(project: GameProject): number | null {
  if (!project.targetReleaseDate) return null;
  return Math.ceil(
    (new Date(project.targetReleaseDate).getTime() - Date.now()) / 86400000
  );
}

/* ─── Monthly activity rate ─── */
export function getMonthlyRate(logs: DevLog[]): number {
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const activeDays = new Set(
    logs.filter((l) => l.date >= monthStart).map((l) => l.date)
  ).size;
  return Math.round((activeDays / daysInMonth) * 100);
}

/* ─── Achievement definitions ─── */
export type AchievementId =
  | "first_log"
  | "hours_50" | "hours_100" | "hours_500"
  | "streak_7" | "streak_30" | "streak_100"
  | "logs_10" | "logs_50"
  | "first_version"
  | "projects_3"
  | "day_100" | "day_365";

export interface Achievement {
  id: AchievementId;
  emoji: string;
  label: string;
  desc: string;
  unlocked: boolean;
  progress?: number; // 0-100 for locked ones
  unlockedAt?: string;
}

export function computeAchievements(
  logs: DevLog[],
  projects: GameProject[],
  _tasks: Task[],
  totalHours: number,
  streak: ReturnType<typeof getStreak>
): Achievement[] {
  const totalLogs = logs.length;
  const hasVersion = projects.some((p) => p.currentVersion !== "v0.1.0");
  const maxDayN = projects.reduce((m, p) => Math.max(m, getDayN(p)), 0);

  const def = (
    id: AchievementId,
    emoji: string,
    label: string,
    desc: string,
    current: number,
    target: number
  ): Achievement => ({
    id,
    emoji,
    label,
    desc,
    unlocked: current >= target,
    progress: Math.min(100, Math.round((current / target) * 100)),
    unlockedAt: current >= target ? new Date().toISOString().slice(0, 10) : undefined,
  });

  return [
    def("first_log",     "📝", "破冰",       "记录第一条开发日志",     totalLogs,     1),
    def("hours_50",      "⏱",  "50 小时",    "累计开发时长达到 50h",   totalHours,   50),
    def("hours_100",     "🏅", "百小时开发者","累计开发时长达到 100h",  totalHours,  100),
    def("hours_500",     "🏆", "五百小时",   "累计开发时长达到 500h",  totalHours,  500),
    def("streak_7",      "🔥", "一周不断",   "连续打卡 7 天",          streak.current, 7),
    def("streak_30",     "🌙", "月度坚守",   "连续打卡 30 天",         streak.best,   30),
    def("streak_100",    "💫", "百日坚持",   "连续打卡 100 天",        streak.best,  100),
    def("logs_10",       "📖", "初具规模",   "记录 10 条日志",         totalLogs,    10),
    def("logs_50",       "📚", "日志达人",   "记录 50 条日志",         totalLogs,    50),
    def("first_version", "🚀", "首次发版",   "记录第一个版本号",       hasVersion ? 1 : 0, 1),
    def("projects_3",    "🎮", "多线并行",   "同时推进 3 个以上项目",  projects.filter(p => !p.isArchived).length, 3),
    def("day_100",       "📅", "百日项目",   "某个项目开发超过 100 天", maxDayN,    100),
    def("day_365",       "🎂", "周年纪念",   "某个项目坚持整整一年",   maxDayN,    365),
  ];
}

/* ─── Next milestone (streak / hours) ─── */
export function getNextMilestone(totalHours: number, streak: { current: number; best: number }): string | null {
  const hourTargets = [50, 100, 200, 500, 1000];
  const streakTargets = [7, 14, 30, 60, 100, 365];
  const nextHour = hourTargets.find((t) => t > totalHours);
  const nextStreak = streakTargets.find((t) => t > streak.current);
  if (!nextHour && !nextStreak) return null;
  const parts: string[] = [];
  if (nextHour) parts.push(`${nextHour}h 时长 (差 ${Math.ceil(nextHour - totalHours)}h)`);
  if (nextStreak) parts.push(`${nextStreak} 天连续 (差 ${nextStreak - streak.current} 天)`);
  return parts[0];
}
