"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function GridBackground() {
  const { isDark } = useTheme();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="grid-bg absolute inset-0" />
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-60 -right-20 h-[500px] w-[500px] rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
