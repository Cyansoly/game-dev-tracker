"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Gamepad2, BookOpen, CheckSquare, Lightbulb,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  const items = [
    { href: "/projects",     label: lang === "zh" ? "项目"  : "Projects", icon: Gamepad2 },
    { href: "/inspirations", label: lang === "zh" ? "灵感库" : "Ideas",    icon: Lightbulb },
    { href: "/dashboard",    label: lang === "zh" ? "概览"  : "Dashboard", icon: LayoutDashboard },
    { href: "/logs",         label: lang === "zh" ? "日志"  : "Logs",      icon: BookOpen },
    { href: "/tasks",        label: lang === "zh" ? "任务"  : "Tasks",     icon: CheckSquare },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch md:hidden"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderTop: "1px solid var(--border-color)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
              isActive ? "text-blue-500" : "text-[var(--text-3)]"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-blue-500")} />
            <span
              className="text-[9px] font-medium leading-none"
              style={{ color: isActive ? "#3b82f6" : "var(--text-3)" }}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-10 rounded-full bg-blue-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
