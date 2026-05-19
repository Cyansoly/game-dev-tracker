"use client";

import { useState } from "react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import GlowCard from "@/components/ui/GlowCard";
import {
  Moon, Sun, Globe, Palette, Database, Info,
  Check, ChevronRight, Download, Trash2, RefreshCw,
  Monitor, Gamepad2
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { cn } from "@/lib/cn";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
        {title}
      </h3>
      <GlowCard padding={false}>
        {children}
      </GlowCard>
    </div>
  );
}

function SettingRow({
  icon, label, desc, children, border = true,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  children?: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-4"
      style={border ? { borderBottom: "1px solid var(--border-color)" } : {}}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-2)" }}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{label}</div>
          {desc && <div className="mt-0.5 text-xs" style={{ color: "var(--text-3)" }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-blue-600" : "bg-zinc-600")}
    >
      <div
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang } = useLanguage();
  const { projects } = useProjectStore();
  const { logs } = useLogStore();
  const { tasks } = useTaskStore();
  const zh = lang === "zh";

  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const ACCENT_COLORS = [
    "#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#ec4899",
  ];

  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      projects,
      logs,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gamedev-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  }

  return (
    <AnimatedPageWrapper className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
          {zh ? "设置" : "Settings"}
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
          {zh ? "偏好设置与数据管理" : "Preferences & data management"}
        </p>
      </div>

      {/* ─── 外观 ─── */}
      <Section title={zh ? "外观" : "Appearance"}>
        {/* Theme */}
        <SettingRow
          icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          label={zh ? "界面主题" : "Theme"}
          desc={zh ? (theme === "dark" ? "夜晚模式" : "白天模式") : (theme === "dark" ? "Dark mode" : "Light mode")}
        >
          <div className="flex items-center gap-2 rounded-lg p-1" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all", theme === "dark" ? "bg-zinc-700 text-white" : "text-zinc-500")}
            >
              <Moon className="h-3 w-3" />
              {zh ? "夜晚" : "Dark"}
            </button>
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all", theme === "light" ? "bg-white text-zinc-800" : "text-zinc-500")}
            >
              <Sun className="h-3 w-3" />
              {zh ? "白天" : "Light"}
            </button>
          </div>
        </SettingRow>

        {/* Language */}
        <SettingRow
          icon={<Globe className="h-4 w-4" />}
          label={zh ? "界面语言" : "Language"}
          desc={zh ? "中文简体 / English" : "Chinese Simplified / English"}
        >
          <div className="flex items-center gap-2 rounded-lg p-1" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}>
            <button
              onClick={() => lang !== "zh" && toggleLang()}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-all", lang === "zh" ? "bg-blue-600 text-white" : "text-zinc-500")}
            >
              中文
            </button>
            <button
              onClick={() => lang !== "en" && toggleLang()}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-all", lang === "en" ? "bg-blue-600 text-white" : "text-zinc-500")}
            >
              English
            </button>
          </div>
        </SettingRow>

        {/* Accent color */}
        <SettingRow
          icon={<Palette className="h-4 w-4" />}
          label={zh ? "强调色" : "Accent Color"}
          desc={zh ? "界面主要高亮颜色" : "Primary highlight color"}
        >
          <div className="flex items-center gap-1.5">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-transform hover:scale-110", accentColor === c ? "border-white" : "border-transparent")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </SettingRow>

        {/* Compact mode */}
        <SettingRow
          icon={<Monitor className="h-4 w-4" />}
          label={zh ? "紧凑模式" : "Compact Mode"}
          desc={zh ? "减少卡片内边距，显示更多内容" : "Reduce padding for information density"}
        >
          <Toggle checked={compactMode} onChange={() => setCompactMode((v) => !v)} />
        </SettingRow>

        {/* Animations */}
        <SettingRow
          icon={<RefreshCw className="h-4 w-4" />}
          label={zh ? "界面动效" : "Animations"}
          desc={zh ? "页面过渡和元素动画" : "Page transitions and element animations"}
          border={false}
        >
          <Toggle checked={animationsEnabled} onChange={() => setAnimationsEnabled((v) => !v)} />
        </SettingRow>
      </Section>

      {/* ─── 数据 ─── */}
      <Section title={zh ? "数据" : "Data"}>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-px" style={{ borderBottom: "1px solid var(--border-color)" }}>
          {[
            { label: zh ? "项目" : "Projects", value: projects.length, icon: <Gamepad2 className="h-4 w-4" /> },
            { label: zh ? "日志" : "Logs",     value: logs.length,     icon: <Database className="h-4 w-4" /> },
            { label: zh ? "任务" : "Tasks",    value: tasks.length,    icon: <Check className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-5" style={{ backgroundColor: "var(--bg-raised)" }}>
              <div style={{ color: "var(--text-3)" }}>{s.icon}</div>
              <span className="num text-2xl font-bold" style={{ color: "var(--text-1)" }}>{s.value}</span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Export */}
        <SettingRow
          icon={<Download className="h-4 w-4" />}
          label={zh ? "导出数据" : "Export Data"}
          desc={zh ? "下载 JSON 格式的全部数据" : "Download all data as JSON"}
        >
          <button
            onClick={handleExport}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              exportSuccess
                ? "bg-green-500/20 text-green-400"
                : "hover:bg-white/8"
            )}
            style={exportSuccess ? {} : { backgroundColor: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border-color)" }}
          >
            {exportSuccess ? <><Check className="h-3.5 w-3.5" />{zh ? "已导出" : "Exported"}</> : <><Download className="h-3.5 w-3.5" />{zh ? "导出" : "Export"}</>}
          </button>
        </SettingRow>

        {/* Clear */}
        <SettingRow
          icon={<Trash2 className="h-4 w-4" />}
          label={zh ? "重置数据" : "Reset Data"}
          desc={zh ? "清除所有会话数据，恢复示例内容" : "Clear session data and restore examples"}
          border={false}
        >
          {!clearConfirm ? (
            <button
              onClick={() => setClearConfirm(true)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
              style={{ border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {zh ? "重置" : "Reset"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">{zh ? "刷新页面即可重置" : "Refresh page to reset"}</span>
              <button onClick={() => { window.location.reload(); }} className="rounded px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">
                {zh ? "刷新" : "Refresh"}
              </button>
              <button onClick={() => setClearConfirm(false)} className="rounded px-2 py-1 text-xs hover:bg-white/10" style={{ color: "var(--text-3)" }}>
                {zh ? "取消" : "Cancel"}
              </button>
            </div>
          )}
        </SettingRow>
      </Section>

      {/* ─── 关于 ─── */}
      <Section title={zh ? "关于" : "About"}>
        <SettingRow
          icon={<Gamepad2 className="h-4 w-4" />}
          label={zh ? "开发追踪器" : "DevTracker"}
          desc={zh ? "游戏开发进度记录工具" : "Game development progress tracker"}
          border={false}
        >
          <div className="text-right">
            <span className="num text-xs font-medium" style={{ color: "var(--text-3)" }}>v0.1.0</span>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>Next.js 16 · Tailwind 4</div>
          </div>
        </SettingRow>

        <div className="px-5 pb-4 pt-0">
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}>
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                {zh ? "技术栈" : "Tech Stack"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion", "@dnd-kit"].map((tech) => (
                <span
                  key={tech}
                  className="num rounded px-2 py-0.5 text-[11px]"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-2)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </AnimatedPageWrapper>
  );
}
