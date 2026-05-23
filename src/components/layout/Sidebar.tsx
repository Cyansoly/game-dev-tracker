"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Gamepad2, BookOpen, BarChart3,
  CheckSquare, Settings, Zap, Languages, Sun, Moon,
  Trophy, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { APP_VERSION } from "@/lib/changelog";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t, lang, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();

  const navItems = [
    { href: "/dashboard",    label: t.nav.dashboard,     icon: LayoutDashboard },
    { href: "/projects",     label: t.nav.projects,      icon: Gamepad2 },
    { href: "/inspirations", label: lang === "zh" ? "灵感库"    : "Idea Vault",      icon: Lightbulb },
    { href: "/logs",         label: t.nav.devLogs,       icon: BookOpen },
    { href: "/tasks",        label: t.nav.tasks,         icon: CheckSquare },
    { href: "/milestones",   label: lang === "zh" ? "开发里程碑" : "Dev Milestones",  icon: Trophy },
    { href: "/analytics",    label: t.nav.analytics,     icon: BarChart3 },
  ];

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 flex h-screen w-[220px] flex-col backdrop-blur-sm",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:z-30",
      ].join(" ")}
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center justify-between px-4"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-blue-500/30">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-1)" }}>
              {t.appName}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{t.appSub}</p>
          </div>
        </div>
        <span
          className="num rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: "rgba(59,130,246,0.1)",
            color: "#60a5fa",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          {APP_VERSION}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" style={{ minHeight: 0 }}>
        <p
          className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-3)" }}
        >
          {t.nav.workspace}
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn("sidebar-item", isActive && "active")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col gap-1 p-3" style={{ borderTop: "1px solid var(--border-color)" }}>
        <button
          onClick={toggleTheme}
          className="sidebar-item justify-between"
          title={theme === "dark" ? "切换白天模式" : "切换夜晚模式"}
        >
          <span className="flex items-center gap-2.5">
            {theme === "dark"
              ? <Moon className="h-4 w-4 shrink-0" />
              : <Sun className="h-4 w-4 shrink-0 text-yellow-400" />}
            <span style={{ color: "var(--text-2)" }}>
              {theme === "dark"
                ? (lang === "zh" ? "夜晚模式" : "Night")
                : (lang === "zh" ? "白天模式" : "Day")}
            </span>
          </span>
          <div
            className="flex h-5 w-9 items-center rounded-full px-0.5 transition-all duration-300"
            style={{
              backgroundColor: theme === "dark"
                ? "rgba(59,130,246,0.3)"
                : "rgba(234,179,8,0.3)",
              justifyContent: theme === "dark" ? "flex-end" : "flex-start",
            }}
          >
            <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </div>
        </button>

        <button
          onClick={toggleLang}
          className="sidebar-item justify-between"
          title={lang === "zh" ? "Switch to English" : "切换为中文"}
        >
          <span className="flex items-center gap-2.5">
            <Languages className="h-4 w-4 shrink-0" />
            <span>{lang === "zh" ? "中文" : "English"}</span>
          </span>
          <span
            className="num rounded border px-1.5 py-0.5 text-[11px]"
            style={{ borderColor: "var(--border-color)", color: "var(--text-3)" }}
          >
            {lang === "zh" ? "EN" : "中"}
          </span>
        </button>

        <Link href="/settings" className="sidebar-item" onClick={onClose}>
          <Settings className="h-4 w-4 shrink-0" />
          <span>{t.nav.settings}</span>
        </Link>
      </div>
    </aside>
  );
}
