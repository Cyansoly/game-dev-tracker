"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChartCardProps {
  title: string;
  desc?: string;
  className?: string;
  children: ReactNode;
  right?: ReactNode;
  minH?: number;
}

export default function ChartCard({ title, desc, className, children, right, minH = 280 }: ChartCardProps) {
  return (
    <div
      className={cn("glow-card flex flex-col", className)}
      style={{ padding: 0 }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            {title}
          </h3>
          {desc && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-3)" }}>
              {desc}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0 ml-3">{right}</div>}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3" style={{ minHeight: minH }}>
        {children}
      </div>
    </div>
  );
}
