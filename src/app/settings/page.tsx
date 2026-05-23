"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import GlowCard from "@/components/ui/GlowCard";
import {
  Moon, Sun, Globe, Palette, Database, Info,
  Check, Download, Trash2, RefreshCw,
  Monitor, Gamepad2, History, ChevronDown, Sparkles, Wrench, Bug,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreference } from "@/contexts/PreferenceContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { cn } from "@/lib/cn";
import { APP_VERSION, CHANGELOG, type ChangelogEntry } from "@/lib/changelog";

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

const TYPE_ICON: Record<string, React.ReactNode> = {
  feature: <Sparkles className="h-3 w-3" />,
  improve: <Wrench className="h-3 w-3" />,
  fix:     <Bug className="h-3 w-3" />,
};
const TYPE_COLOR: Record<string, string> = {
  feature: "#3b82f6",
  improve: "#a855f7",
  fix:     "#22c55e",
};
const TYPE_LABEL_ZH: Record<string, string> = {
  feature: "新功能",
  improve: "优化",
  fix:     "修复",
};
const TYPE_LABEL_EN: Record<string, string> = {
  feature: "New",
  improve: "Improved",
  fix:     "Fixed",
};

function ChangelogEntryRow({ entry, lang, defaultOpen }: { entry: ChangelogEntry; lang: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const zh = lang === "zh";

  return (
    <div style={{ borderBottom: "1px solid var(--border-color)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="num text-sm font-bold" style={{ color: "var(--text-1)" }}>
              {entry.version}
            </span>
            {defaultOpen && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
              >
                NEW
              </span>
            )}
            <span className="num text-xs" style={{ color: "var(--text-3)" }}>{entry.date}</span>
          </div>
          {entry.highlight && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-3)" }}>
              {zh ? entry.highlight.zh : entry.highlight.en}
            </p>
          )}
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform"
          style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              {entry.sections.map((sec, si) => (
                <div key={si} className="mb-3 last:mb-0">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span style={{ color: TYPE_COLOR[sec.type] }}>
                      {TYPE_ICON[sec.type]}
                    </span>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: TYPE_COLOR[sec.type] }}
                    >
                      {zh ? TYPE_LABEL_ZH[sec.type] : TYPE_LABEL_EN[sec.type]}
                    </span>
                  </div>
                  <ul className="ml-4 flex flex-col gap-1">
                    {sec.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "var(--text-3)" }} />
                        {zh ? item.zh : item.en}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang } = useLanguage();
  const { accentColor, setAccentColor, compactMode, setCompactMode, animationsEnabled, setAnimationsEnabled, ACCENT_COLORS } = usePreference();
  const { projects } = useProjectStore();
  const { logs } = useLogStore();
  const { tasks } = useTaskStore();
  const zh = lang === "zh";

  const [exportSuccess, setExportSuccess] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  function handleExport() {
    const data = { exportedAt: new Date().toISOString(), projects, logs, tasks };
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

        {/* Accent color — NOW FUNCTIONAL */}
        <SettingRow
          icon={<Palette className="h-4 w-4" />}
          label={zh ? "强调色" : "Accent Color"}
          desc={zh ? "应用于按钮、高亮等处" : "Applied to buttons, highlights and more"}
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

        {/* Compact mode — NOW FUNCTIONAL */}
        <SettingRow
          icon={<Monitor className="h-4 w-4" />}
          label={zh ? "紧凑模式" : "Compact Mode"}
          desc={zh ? "减少卡片内边距，显示更多内容" : "Reduce padding for information density"}
        >
          <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
        </SettingRow>

        {/* Animations — NOW FUNCTIONAL */}
        <SettingRow
          icon={<RefreshCw className="h-4 w-4" />}
          label={zh ? "界面动效" : "Animations"}
          desc={zh ? "页面过渡和元素动画" : "Page transitions and element animations"}
          border={false}
        >
          <Toggle checked={animationsEnabled} onChange={() => setAnimationsEnabled(!animationsEnabled)} />
        </SettingRow>
      </Section>

      {/* ─── 数据 ─── */}
      <Section title={zh ? "数据" : "Data"}>
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

        <SettingRow
          icon={<Download className="h-4 w-4" />}
          label={zh ? "导出数据" : "Export Data"}
          desc={zh ? "下载 JSON 格式的全部数据" : "Download all data as JSON"}
        >
          <button
            onClick={handleExport}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              exportSuccess ? "bg-green-500/20 text-green-400" : "hover:bg-white/8"
            )}
            style={exportSuccess ? {} : { backgroundColor: "var(--bg-raised)", color: "var(--text-2)", border: "1px solid var(--border-color)" }}
          >
            {exportSuccess
              ? <><Check className="h-3.5 w-3.5" />{zh ? "已导出" : "Exported"}</>
              : <><Download className="h-3.5 w-3.5" />{zh ? "导出" : "Export"}</>}
          </button>
        </SettingRow>

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
              <button onClick={() => window.location.reload()} className="rounded px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">
                {zh ? "刷新" : "Refresh"}
              </button>
              <button onClick={() => setClearConfirm(false)} className="rounded px-2 py-1 text-xs hover:bg-white/10" style={{ color: "var(--text-3)" }}>
                {zh ? "取消" : "Cancel"}
              </button>
            </div>
          )}
        </SettingRow>
      </Section>

      {/* ─── 更新日志 ─── */}
      <Section title={zh ? "更新日志" : "Changelog"}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" style={{ color: "var(--text-3)" }} />
            <span className="text-xs" style={{ color: "var(--text-2)" }}>
              {zh ? "版本历史" : "Version history"}
            </span>
          </div>
          <span className="num text-xs font-semibold" style={{ color: "#60a5fa" }}>{APP_VERSION}</span>
        </div>
        <div>
          {CHANGELOG.map((entry, i) => (
            <ChangelogEntryRow
              key={entry.version}
              entry={entry}
              lang={lang}
              defaultOpen={i === 0}
            />
          ))}
        </div>
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
            <span className="num text-xs font-medium" style={{ color: "var(--text-3)" }}>{APP_VERSION}</span>
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
