"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  delay?: number;
  className?: string;
}

export default function ProgressBar({
  progress,
  color = "#3b82f6",
  height = 5,
  showLabel = false,
  label,
  delay = 0,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-zinc-400">{label}</span>}
          {showLabel && (
            <span className="num text-zinc-500">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div
        className="progress-track w-full"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className="progress-fill h-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay,
          }}
        />
      </div>
    </div>
  );
}
