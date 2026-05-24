"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  computeAchievements,
  getStreak,
  getTotalHours,
  type Achievement,
} from "@/lib/stats";
import { useLogStore } from "./LogStoreContext";
import { useProjectStore } from "./ProjectStoreContext";
import { useTaskStore } from "./TaskStoreContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface MilestoneContextValue {
  achievements: Achievement[];
  newlyUnlocked: Achievement | null;
  dismissNew: () => void;
  weeklyHoursGoal: number;
  setWeeklyHoursGoal: (h: number) => void;
  trackingStartDate: string;
  setTrackingStartDate: (d: string) => void;
}

const Ctx = createContext<MilestoneContextValue | null>(null);

function keyFor(
  workspaceId: string | null,
  viewingUserName: string | null,
  suffix: string
) {
  return `devtracker_${workspaceId ?? "none"}_${viewingUserName ?? "none"}_${suffix}`;
}

function loadSeen(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeen(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch { }
}

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const { workspaceId, viewingUserName } = useWorkspace();
  const { logs } = useLogStore();
  const { projects } = useProjectStore();
  const { personalTasks } = useTaskStore();

  const [weeklyHoursGoal, setWeeklyHoursGoalState] = useState(20);
  const [trackingStartDate, setTrackingStartDateState] = useState("");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  const goalKey = keyFor(workspaceId, viewingUserName, "weekly_goal");
  const startKey = keyFor(workspaceId, viewingUserName, "tracking_start");
  const seenKey = keyFor(workspaceId, viewingUserName, "seen_achievements");

  useEffect(() => {
    const g = localStorage.getItem(goalKey);
    setWeeklyHoursGoalState(g ? Number(g) : 20);

    const s = localStorage.getItem(startKey);
    setTrackingStartDateState(s ?? "");

    setSeenIds(loadSeen(seenKey));
    setNewlyUnlocked(null);
  }, [goalKey, startKey, seenKey]);

  const streak = useMemo(() => getStreak(logs), [logs]);

  const totalHours = useMemo(
    () => getTotalHours(logs, projects),
    [logs, projects]
  );

  const achievements = useMemo(
    () => computeAchievements(logs, projects, personalTasks, totalHours, streak),
    [logs, projects, personalTasks, totalHours, streak]
  );

  useEffect(() => {
    const unlocked = achievements.filter((a) => a.unlocked && !seenIds.has(a.id));

    if (unlocked.length > 0) {
      setNewlyUnlocked(unlocked[0]);

      const next = new Set([
        ...seenIds,
        ...unlocked.map((a) => a.id),
      ]);

      setSeenIds(next);
      saveSeen(seenKey, next);
    }
  }, [achievements, seenIds, seenKey]);

  const dismissNew = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const setWeeklyHoursGoal = useCallback(
    (h: number) => {
      setWeeklyHoursGoalState(h);
      localStorage.setItem(goalKey, String(h));
    },
    [goalKey]
  );

  const setTrackingStartDate = useCallback(
    (d: string) => {
      setTrackingStartDateState(d);
      localStorage.setItem(startKey, d);
    },
    [startKey]
  );

  return (
    <Ctx.Provider
      value={{
        achievements,
        newlyUnlocked,
        dismissNew,
        weeklyHoursGoal,
        setWeeklyHoursGoal,
        trackingStartDate,
        setTrackingStartDate,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useMilestones() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMilestones must be inside MilestoneProvider");
  return ctx;
}