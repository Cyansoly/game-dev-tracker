"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { GameProject } from "@/lib/types";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface ProjectListRowProps {
  project: GameProject;
  index: number;
}

export default function ProjectListRow({ project, index }: ProjectListRowProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/projects/${project.slug}`} className="group block">
        <div
          className={cn(
            "flex items-center gap-4 rounded-xl border px-4 py-3 transition-all",
            "hover:border-blue-500/30 hover:bg-white/[0.02]"
          )}
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
        >
          {/* Color dot + Name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="h-8 w-1 flex-shrink-0 rounded-full"
              style={{ backgroundColor: project.coverColor }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                  {project.name}
                </span>
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" style={{ color: "var(--text-3)" }} />
              </div>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{project.genre}</span>
            </div>
          </div>

          {/* Stage */}
          <div className="hidden w-28 sm:block">
            <StageBadge stage={project.stage} />
          </div>

          {/* Version */}
          <div className="hidden w-16 text-center sm:block">
            <span className="num text-xs font-medium" style={{ color: "var(--text-2)" }}>
              {project.currentVersion}
            </span>
          </div>

          {/* Progress bar */}
          <div className="hidden w-32 md:block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{t.detail.overall}</span>
              <span className="num text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {project.overallProgress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
              <motion.div
                className="h-1.5 rounded-full"
                style={{ backgroundColor: project.coverColor }}
                initial={{ width: 0 }}
                animate={{ width: `${project.overallProgress}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Momentum */}
          <div className="hidden w-24 lg:block">
            <MomentumBadge momentum={project.momentum} />
          </div>

          {/* Updated */}
          <div className="hidden w-24 text-right lg:block">
            <span className="num text-xs" style={{ color: "var(--text-3)" }}>
              {project.updatedAt.slice(5)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
