"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Clock, Calendar, TrendingUp, Flame } from "lucide-react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import StatsCard from "@/components/ui/StatsCard";
import AnalyticsToolbar, { type DaysFilter } from "@/components/analytics/AnalyticsToolbar";
import ProjectCompareBars from "@/components/analytics/ProjectCompareBars";

/* Recharts components require browser environment — disable SSR */
const DailyTrendChart = dynamic(() => import("@/components/analytics/DailyTrendChart"), { ssr: false });
const TagDistributionChart = dynamic(() => import("@/components/analytics/TagDistributionChart"), { ssr: false });
const ModuleRadarChart = dynamic(() => import("@/components/analytics/ModuleRadarChart"), { ssr: false });
import { useLanguage } from "@/contexts/LanguageContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import {
  computeKPIs,
  computeDailyDuration,
  computeTagDistribution,
  computeModuleAverages,
  computeProjectComparison,
} from "@/lib/analytics";

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const a = t.analytics;
  const { logs: allLogs } = useLogStore();
  const { projects } = useProjectStore();

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [days, setDays] = useState<DaysFilter>(30);

  /* ─── Filtered logs ─── */
  const filteredLogs = useMemo(() => {
    const byProject =
      projectFilter === "all"
        ? allLogs
        : allLogs.filter((l) => l.projectId === projectFilter);
    if (days === 0) return byProject;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return byProject.filter((l) => l.date >= cutoffStr);
  }, [allLogs, projectFilter, days]);

  /* ─── KPIs ─── */
  const kpis = useMemo(() => computeKPIs(filteredLogs), [filteredLogs]);

  /* ─── Chart data ─── */
  const dailyData = useMemo(
    () => computeDailyDuration(filteredLogs, days),
    [filteredLogs, days]
  );

  const tagData = useMemo(
    () => computeTagDistribution(filteredLogs),
    [filteredLogs]
  );

  const radarData = useMemo(
    () => computeModuleAverages(projects, projectFilter),
    [projects, projectFilter]
  );

  const compareData = useMemo(
    () => computeProjectComparison(projects),
    [projects]
  );

  const selectedProject =
    projectFilter !== "all"
      ? projects.find((p) => p.id === projectFilter)
      : undefined;

  /* ─── Animation stagger ─── */
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0 },
  };

  return (
    <AnimatedPageWrapper className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
          {a.title}
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
          {a.desc}
        </p>
      </div>

      {/* Toolbar */}
      <AnalyticsToolbar
        projects={projects}
        projectFilter={projectFilter}
        onProjectChange={setProjectFilter}
        days={days}
        onDaysChange={setDays}
      />

      {/* ─── Row 1: KPI cards ─── */}
      <motion.div
        className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants}>
          <StatsCard
            label={a.kpiTotalHours}
            value={kpis.totalHours}
            unit={a.kpiHoursUnit}
            icon={<Clock className="h-3.5 w-3.5" />}
            accentColor="#3b82f6"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatsCard
            label={a.kpiActiveDays}
            value={kpis.activeDays}
            unit={a.kpiDaysUnit}
            icon={<Calendar className="h-3.5 w-3.5" />}
            accentColor="#a855f7"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatsCard
            label={a.kpiAvgHours}
            value={kpis.avgHoursPerDay}
            unit={a.kpiHoursUnit}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            accentColor="#22c55e"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatsCard
            label={a.kpiStreak}
            value={kpis.currentStreak}
            unit={a.kpiStreakUnit}
            icon={<Flame className="h-3.5 w-3.5" />}
            accentColor="#f97316"
            trend={
              kpis.longestStreak > 0
                ? { value: kpis.longestStreak, label: "best" }
                : undefined
            }
          />
        </motion.div>
      </motion.div>

      {/* ─── Row 2: Trend (2/3) + Donut (1/3) ─── */}
      <motion.div
        className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3"
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <DailyTrendChart data={dailyData} />
        </motion.div>
        <motion.div variants={cardVariants}>
          <TagDistributionChart data={tagData} />
        </motion.div>
      </motion.div>

      {/* ─── Row 3: Radar (1/3) + Project compare (2/3) ─── */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.28 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants}>
          <ModuleRadarChart
            data={radarData}
            projectName={selectedProject?.name}
          />
        </motion.div>
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <ProjectCompareBars data={compareData} />
        </motion.div>
      </motion.div>
    </AnimatedPageWrapper>
  );
}
