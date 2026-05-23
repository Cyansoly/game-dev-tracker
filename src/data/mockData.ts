import type { GameProject, DevLog, Task, VersionRecord, IdeaCapsule } from "@/lib/types";

/* ── 上线版本：全部数据清空，用户自己填充 ── */
export const mockProjects: GameProject[] = [];
export const mockDevLogs: DevLog[] = [];
export const mockTasks: Task[] = [];
export const mockVersions: VersionRecord[] = [];
export const mockIdeas: IdeaCapsule[] = [];

/* ─────────── 查询工具函数 ─────────── */
export function getProjectBySlug(slug: string): GameProject | undefined {
  return mockProjects.find((p) => p.slug === slug);
}

export function getLogsByProject(projectId: string): DevLog[] {
  return mockDevLogs
    .filter((l) => l.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTasksByProject(projectId: string): Task[] {
  return mockTasks.filter((t) => t.projectId === projectId);
}

export function getVersionsByProject(projectId: string): VersionRecord[] {
  return mockVersions
    .filter((v) => v.projectId === projectId)
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
}

export function getRecentLogs(count = 5): DevLog[] {
  return [...mockDevLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

export function getTodayTasks(): Task[] {
  return mockTasks.filter(
    (t) => t.status === "todo" || t.status === "in_progress"
  );
}

export function getTotalStats() {
  const totalMinutes = mockDevLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const done = mockTasks.filter((t) => t.status === "done").length;

  return {
    totalProjects: mockProjects.length,
    activeProjects: mockProjects.filter(
      (p) => p.stage !== "paused" && p.stage !== "released"
    ).length,
    totalDevHours: Math.round(totalMinutes / 60),
    totalLogs: mockDevLogs.length,
    taskCompletionRate: mockTasks.length > 0 ? Math.round((done / mockTasks.length) * 100) : 0,
    currentStreak: 0,
  };
}
