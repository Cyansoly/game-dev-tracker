"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Achievement } from "@/lib/stats";

interface MilestoneToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function MilestoneToast({ achievement, onDismiss }: MilestoneToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (achievement) {
      timerRef.current = setTimeout(onDismiss, 5000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed left-1/2 top-4 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            border: "1px solid #fbbf2460",
            minWidth: 280,
          }}
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
        >
          {/* Confetti shimmer overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />

          <span className="text-2xl leading-none">{achievement.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-amber-950">🎉 成就解锁！{achievement.label}</p>
            <p className="text-xs text-amber-800">{achievement.desc}</p>
          </div>
          <button
            onClick={onDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-amber-950/10"
          >
            <X className="h-3.5 w-3.5 text-amber-900" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
