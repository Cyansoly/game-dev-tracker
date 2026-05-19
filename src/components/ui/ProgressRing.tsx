"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  labelSize?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color = "#3b82f6",
  trackColor,
  showLabel = true,
  labelSize = "md",
  className,
}: ProgressRingProps) {
  // Use CSS variable so track adapts to theme
  const resolvedTrack = trackColor ?? "var(--bg-raised)";
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedTrack}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn("absolute num font-semibold", labelSizes[labelSize])}
          style={{ color: "var(--text-1)" }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
