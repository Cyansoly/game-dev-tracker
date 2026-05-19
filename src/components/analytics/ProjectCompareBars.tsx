"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ProjectCompareRow } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { StageBadge } from "@/components/ui/Badge";
import ChartCard from "./ChartCard";

interface ProjectCompareBarsProps {
  data: ProjectCompareRow[];
}

const MODULE_ZH: Record<string, string> = {
  art:       "美术",
  code:      "程序",
  level:     "关卡",
  audio:     "音效",
  narrative: "剧情",
  qa:        "测试",
};

export default function ProjectCompareBars({ data }: ProjectCompareBarsProps) {
  const { t, lang } = useLanguage();
  const a = t.analytics;
  const zh = lang === "zh";

  return (
    <ChartCard title={a.compareTitle} desc={a.compareDesc} minH={0}>
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{a.compareNoData}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-1">
          {data.map((proj, pi) => (
            <Link
              key={proj.id}
              href={`/projects/${(proj as ProjectCompareRow & { slug: string }).slug ?? ""}`}
              className="group block rounded-xl p-3 transition-all hover:bg-white/[0.025]"
              style={{ border: "1px solid var(--border-color)" }}
            >
              {/* Top row: name + stage + overall % */}
              <div className="mb-2 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                <span className="flex-1 truncate text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                  {proj.name}
                </span>
                <StageBadge stage={proj.stage as never} />
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40 flex-shrink-0" style={{ color: "var(--text-3)" }} />
              </div>

              {/* Overall bar */}
              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {zh ? "综合进度" : "Overall"}
                  </span>
                  <span className="num text-xs font-semibold" style={{ color: "var(--text-1)" }}>
                    {proj.overall}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: proj.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${proj.overall}%` }}
                    transition={{ delay: pi * 0.08 + 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Module mini-bars */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                {proj.modules.map((mod) => (
                  <div key={mod.key} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                        {zh ? (MODULE_ZH[mod.key] ?? mod.label) : mod.key}
                      </span>
                      <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>{mod.progress}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-raised)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: mod.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${mod.progress}%` }}
                        transition={{ delay: pi * 0.08 + 0.25, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Updated date */}
              <div className="mt-2 text-right">
                <span className="num text-[10px]" style={{ color: "var(--text-3)" }}>
                  {zh ? "更新于" : "Updated"} {proj.updatedAt}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ChartCard>
  );
}
