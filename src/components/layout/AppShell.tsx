"use client";

import { useEffect } from "react";
import GridBackground from "./GridBackground";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import CommandPalette from "@/components/search/CommandPalette";
import { useSearch } from "@/contexts/SearchContext";

function GlobalKeyListener() {
  const { openPalette, closePalette, open } = useSearch();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) closePalette(); else openPalette();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette, closePalette]);
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <GlobalKeyListener />
      <GridBackground />
      <Sidebar />
      <div className="relative ml-[220px] flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
