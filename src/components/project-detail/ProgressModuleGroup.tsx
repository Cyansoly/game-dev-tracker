"use client";

import { motion } from "framer-motion";
import type { ProgressModule } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";
import { useLanguage } from "@/contexts/LanguageContext";

const moduleColors: Record<string, string> = {
  art:       "#a855f7",
  code:      "#3b82f6",
  level:     "#06b6d4",
  audio:     "#22c55e",
  narrative: "#f97316",
  qa:        "#eab308",
};

interface ProgressModuleGroupProps {
  modules: ProgressModule[];
  projectColor: string;
}

export default function ProgressModuleGroup({ modules, projectColor }: ProgressModuleGroupProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      {modules.map((mod, i) => {
        const color = moduleColors[mod.key] ?? projectColor;
        const label = t.modules[mod.key as keyof typeof t.modules] ?? mod.label;

        return (
          <motion.div
            key={mod.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-zinc-300">{label}</span>
              </div>
              <div className="flex items-center gap-3">
                {mod.note && (
                  <span className="hidden max-w-[200px] truncate text-[11px] text-zinc-600 md:block">
                    {mod.note}
                  </span>
                )}
                <span className="num text-sm font-semibold" style={{ color }}>
                  {mod.progress}%
                </span>
              </div>
            </div>
            <ProgressBar progress={mod.progress} height={6} color={color} delay={i * 0.08} />
            {mod.note && (
              <p className="mt-1.5 text-[11px] text-zinc-600 md:hidden">{mod.note}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
