"use client";

import { useState } from "react";
import { Search, Plus, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearch } from "@/contexts/SearchContext";
import LogModal from "@/components/logs/LogModal";
import NotificationPanel from "./NotificationPanel";

export default function TopNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { openPalette } = useSearch();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const pages = t.topNav.pages as Record<string, { title: string; desc: string }>;
  const matched = Object.entries(pages)
    .filter(([k]) => (k === "/" ? pathname === "/" : pathname.startsWith(k)))
    .sort((a, b) => b[0].length - a[0].length)[0];
  const info = matched?.[1] ?? { title: t.appName, desc: "" };

  return (
    <>
      <header
        className="sticky top-0 z-20 flex h-14 items-center justify-between px-6 backdrop-blur-md"
        style={{
          backgroundColor: "var(--bg-overlay)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            {info.title}
          </h1>
          {info.desc && (
            <>
              <span style={{ color: "var(--text-3)" }}>/</span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{info.desc}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={openPalette}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:border-blue-500/30 hover:bg-blue-500/5"
            style={{ borderColor: "var(--border-color)", backgroundColor: "rgba(128,128,128,0.04)", color: "var(--text-3)" }}
          >
            <Search className="h-3 w-3" />
            <span>{t.topNav.search}</span>
            <kbd className="ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ backgroundColor: "rgba(128,128,128,0.08)", color: "var(--text-3)" }}>
              Ctrl+K
            </kbd>
          </button>

          {/* Quick log */}
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.topNav.newLog}
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif((v) => !v)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${showNotif ? "bg-blue-500/10" : "hover:bg-white/8"}`}
              style={{ color: showNotif ? "#60a5fa" : "var(--text-3)" }}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
            </button>
            <NotificationPanel open={showNotif} onClose={() => setShowNotif(false)} />
          </div>
        </div>
      </header>

      {/* Quick Log Modal */}
      {showLogModal && (
        <LogModal onClose={() => setShowLogModal(false)} />
      )}
    </>
  );
}
