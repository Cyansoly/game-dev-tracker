"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GameProject } from "@/lib/types";
import ProgressRing from "@/components/ui/ProgressRing";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";

interface ProjectMiniCardProps {
  project: GameProject;
  index?: number;
}

export default function ProjectMiniCard({ project, index = 0 }: ProjectMiniCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="glow-card cursor-pointer p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.coverColor }}
                />
                <h3 className="truncate text-sm font-semibold text-zinc-100">
                  {project.name}
                </h3>
              </div>
              <p className="text-xs text-zinc-500">{project.genre}</p>
            </div>
            <ProgressRing
              progress={project.overallProgress}
              size={48}
              strokeWidth={4}
              color={project.coverColor}
              showLabel
              labelSize="sm"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StageBadge stage={project.stage} />
            <div className="flex items-center gap-3">
              <span className="num text-[11px] text-zinc-600">{project.currentVersion}</span>
              <MomentumBadge momentum={project.momentum} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
