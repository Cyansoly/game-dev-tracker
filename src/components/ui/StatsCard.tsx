"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/cn";

interface StatsCardProps {
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  trend?: { value: number; label: string };
  className?: string;
}

function AnimatedNumber({ to, suffix = "" }: { to: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(count, to, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [to, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatsCard({
  label,
  value,
  unit,
  suffix = "",
  icon,
  accentColor = "#3b82f6",
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "glow-card p-5 flex flex-col gap-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>{label}</span>
        {icon && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="num text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          <AnimatedNumber to={value} suffix={suffix} />
        </span>
        {unit && (
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-medium",
              trend.value >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span style={{ color: "var(--text-3)" }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
