"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { computeAchievements, getStreak, getTotalHours, type Achievement } from "@/lib/stats";
import { useLogStore } from "./LogStoreContext";
import { useProjectStore } from "./ProjectStoreContext";
import { useTaskStore } from "./TaskStoreContext";

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

const LS_GOAL   = "devtracker_weekly_goal";
const LS_START  = "devtracker_tracking_start";
const LS_SEEN   = "devtracker_seen_achievements";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_SEEN);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveSeen(ids: Set<string>) {
  try { localStorage.setItem(LS_SEEN, JSON.stringify([...ids])); } catch {}
}

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const { logs } = useLogStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();

  const [weeklyHoursGoal, setWeeklyHoursGoalState] = useState(20);
  const [trackingStartDate, setTrackingStartDateState] = useState("");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    const g = localStorage.getItem(LS_GOAL);
    if (g) setWeeklyHoursGoalState(Number(g));
    const s = localStorage.getItem(LS_START);
    if (s) setTrackingStartDateState(s);
    setSeenIds(loadSeen());
  }, []);

  const streak = useMemo(() => getStreak(logs), [logs]);
  const totalHours = useMemo(() => getTotalHours(logs, projects), [logs, projects]);
  const achievements = useMemo(
    () => computeAchievements(logs, projects, tasks, totalHours, streak),
    [logs, projects, tasks, totalHours, streak]
  );

  // Detect newly unlocked achievements
  useEffect(() => {
    const unlocked = achievements.filter((a) => a.unlocked && !seenIds.has(a.id));
    if (unlocked.length > 0) {
      setNewlyUnlocked(unlocked[0]);
      const next = new Set([...seenIds, ...unlocked.map((a) => a.id)]);
      setSeenIds(next);
      saveSeen(next);
    }
  }, [achievements]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissNew = useCallback(() => setNewlyUnlocked(null), []);

  const setWeeklyHoursGoal = useCallback((h: number) => {
    setWeeklyHoursGoalState(h);
    localStorage.setItem(LS_GOAL, String(h));
  }, []);

  const setTrackingStartDate = useCallback((d: string) => {
    setTrackingStartDateState(d);
    localStorage.setItem(LS_START, d);
  }, []);

  return (
    <Ctx.Provider value={{
      achievements, newlyUnlocked, dismissNew,
      weeklyHoursGoal, setWeeklyHoursGoal,
      trackingStartDate, setTrackingStartDate,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMilestones() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMilestones must be inside MilestoneProvider");
  return ctx;
}
