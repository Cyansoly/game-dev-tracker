"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GameProject, Platform } from "@/lib/types";
import ProgressRing from "@/components/ui/ProgressRing";
import HPBar from "@/components/ui/HPBar";
import { StageBadge, MomentumBadge } from "@/components/ui/Badge";
import { CalendarDays, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PLATFORM_EMOJI: Record<Platform, string> = {
  pc: "🖥️", mac: "🍎", linux: "🐧", switch: "🎮",
  ps5: "🎮", xbox: "🎮", ios: "📱", android: "📱", web: "🌐",
};
const PLATFORM_SHORT: Record<Platform, string> = {
  pc: "PC", mac: "Mac", linux: "Linux", switch: "NSW",
  ps5: "PS5", xbox: "XBX", ios: "iOS", android: "APK", web: "Web",
};

interface ProjectCardProps {
  project: GameProject;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t, lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/projects/${project.slug}`}>
        <article className="glow-card cursor-pointer overflow-hidden p-0">
          {/* Top color bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: `linear-gradient(90deg, ${project.coverColor}, transparent)` }}
          />
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {project.icon && (
                    <span className="text-base leading-none">{project.icon}</span>
                  )}
                  <h3 className="truncate text-base font-bold" style={{ color: "var(--text-1)" }}>{project.name}</h3>
                  <span
                    className="num shrink-0 rounded-md border px-1.5 py-0.5 text-[11px]"
                    style={{ color: "var(--text-3)", borderColor: `${project.coverColor}30` }}
                  >
                    {project.currentVersion}
                  </span>
                </div>

                {/* Tagline */}
                {project.tagline && (
                  <p className="mb-1 text-xs" style={{ color: project.coverColor + "cc" }}>
                    {project.tagline}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                  <Tag className="h-3 w-3" />
                  <span>{project.genre}</span>
                  {/* Platforms */}
                  {project.platforms && project.platforms.length > 0 && (
                    <>
                      <span className="opacity-30">·</span>
                      <span className="flex items-center gap-0.5">
                        {project.platforms.slice(0, 3).map((p) => (
                          <span key={p} className="text-[10px]" title={PLATFORM_SHORT[p]}>
                            {PLATFORM_EMOJI[p]}
                          </span>
                        ))}
                        {project.platforms.length > 3 && (
                          <span className="text-[10px]">+{project.platforms.length - 3}</span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ProgressRing
                progress={project.overallProgress}
                size={60}
                strokeWidth={5}
                color={project.coverColor}
                showLabel
                labelSize="sm"
              />
            </div>

            {/* Description */}
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
              {project.description}
            </p>

            {/* Module Bars — HP Bar style, read-only */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {project.progressModules.slice(0, 4).map((mod) => (
                <div key={mod.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                      {t.modules[mod.key as keyof typeof t.modules] ?? mod.label}
                    </span>
                    <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>
                      {mod.progress}%
                    </span>
                  </div>
                  <HPBar
                    value={mod.progress}
                    color={project.coverColor}
                    readOnly
                    height={5}
                    glowOnFull={false}
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StageBadge stage={project.stage} />
                <MomentumBadge momentum={project.momentum} />
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {project.targetReleaseDate && (
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-3)" }}>
                    <span>🎯</span>
                    <span className="num">
                      {new Date(project.targetReleaseDate).toLocaleDateString(
                        lang === "zh" ? "zh-CN" : "en-US",
                        { year: "numeric", month: "short" }
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                  <CalendarDays className="h-3 w-3" />
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString(
                      lang === "zh" ? "zh-CN" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
