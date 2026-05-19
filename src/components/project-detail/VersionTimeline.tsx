"use client";

import { motion } from "framer-motion";
import type { VersionRecord } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";

const tagStyle: Record<string, string> = {
  alpha:   "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  beta:    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  rc:      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  release: "bg-green-500/10 text-green-400 border border-green-500/20",
};

interface VersionTimelineProps {
  versions: VersionRecord[];
  accentColor?: string;
}

export default function VersionTimeline({ versions, accentColor = "#3b82f6" }: VersionTimelineProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="relative pl-4">
      <div
        className="absolute left-0 top-2 bottom-2 w-[1px]"
        style={{ backgroundColor: `${accentColor}20` }}
      />
      <div className="flex flex-col gap-5">
        {versions.map((ver, i) => (
          <motion.div
            key={ver.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: i * 0.07 }}
            className="relative"
          >
            <div
              className="absolute -left-[17px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950"
              style={{ backgroundColor: i === 0 ? accentColor : "#3f3f46" }}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="num text-sm font-bold"
                  style={{ color: i === 0 ? accentColor : "#a1a1aa" }}
                >
                  {ver.version}
                </span>
                {ver.tag && (
                  <span className={cn("badge text-[10px]", tagStyle[ver.tag])}>
                    {t.versionTags[ver.tag as keyof typeof t.versionTags]}
                  </span>
                )}
                {ver.title && <span className="text-sm text-zinc-300">{ver.title}</span>}
                <span className="ml-auto text-xs text-zinc-600">
                  {new Date(ver.releasedAt).toLocaleDateString(
                    lang === "zh" ? "zh-CN" : "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">{ver.releaseNotes}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
