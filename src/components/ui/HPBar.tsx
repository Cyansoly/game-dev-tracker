"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const SEGMENTS = 10;

function segmentColor(filledCount: number, total: number, projectColor?: string): string {
  if (projectColor) return projectColor;
  const ratio = filledCount / total;
  if (ratio <= 0.3) return "#ef4444";
  if (ratio <= 0.5) return "#f97316";
  if (ratio <= 0.7) return "#eab308";
  return "#22c55e";
}

interface HPBarProps {
  value: number;           // 0-100
  color?: string;          // override: project color
  onChange?: (v: number) => void;
  readOnly?: boolean;
  height?: number;         // px per segment height
  showValue?: boolean;
  className?: string;
  glowOnFull?: boolean;
}

export default function HPBar({
  value,
  color,
  onChange,
  readOnly = false,
  height = 8,
  showValue = false,
  className,
  glowOnFull = true,
}: HPBarProps) {
  const filled = Math.round((value / 100) * SEGMENTS);
  const isFull = value >= 100;
  const [hoverSeg, setHoverSeg] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  function getSegFromX(clientX: number): number {
    if (!barRef.current) return filled;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * SEGMENTS);
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (readOnly || !onChange) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSwiping(true);
    const seg = getSegFromX(e.clientX);
    onChange(Math.round((seg / SEGMENTS) * 100));
  }, [readOnly, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isSwiping || readOnly || !onChange) return;
    const seg = getSegFromX(e.clientX);
    onChange(Math.round((seg / SEGMENTS) * 100));
  }, [isSwiping, readOnly, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsSwiping(false);
  }, []);

  const activeCount = hoverSeg !== null && !readOnly ? hoverSeg : filled;
  const activeColor = segmentColor(activeCount, SEGMENTS, color);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        ref={barRef}
        className={cn(
          "flex flex-1 gap-[2px]",
          !readOnly && "cursor-pointer"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { setHoverSeg(null); setIsSwiping(false); }}
        onMouseMove={(e) => {
          if (!readOnly) setHoverSeg(getSegFromX(e.clientX));
        }}
        onMouseLeave={() => setHoverSeg(null)}
        role={readOnly ? undefined : "slider"}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={readOnly ? -1 : 0}
        onKeyDown={(e) => {
          if (readOnly || !onChange) return;
          const step = e.shiftKey ? 10 : 1;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(100, value + step));
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - step));
        }}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const segIdx = i + 1;
          const isFilled = segIdx <= activeCount;
          const isLastFilled = segIdx === activeCount;

          return (
            <motion.div
              key={i}
              className="flex-1 rounded-[2px] overflow-hidden"
              style={{ height }}
              animate={{
                backgroundColor: isFilled ? activeColor : "var(--bg-raised)",
                opacity: isFilled ? 1 : 0.35,
              }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
              {/* Subtle shimmer on the last filled segment */}
              {isLastFilled && !readOnly && (
                <motion.div
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-100% 0"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 100% gold glow pulse */}
      {isFull && glowOnFull && (
        <motion.div
          className="absolute inset-0 rounded pointer-events-none"
          animate={{ boxShadow: ["0 0 0px #fbbf24", "0 0 8px #fbbf2460", "0 0 0px #fbbf24"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {showValue && (
        <span className="num shrink-0 text-xs font-semibold w-8 text-right" style={{ color: activeColor }}>
          {value}%
        </span>
      )}
    </div>
  );
}
