"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2 } from "lucide-react";
import type { DevLog, DevLogTag, Mood } from "@/lib/types";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollPicker from "@/components/ui/ScrollPicker";
import { cn } from "@/lib/cn";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const ALL_TAGS: DevLogTag[] = ["coding", "art", "design", "bugfix", "balance", "level", "audio", "planning"];
const MOODS: { value: Mood; emoji: string; label: string; labelEn: string }[] = [
  { value: "great",   emoji: "🔥", label: "很棒",  labelEn: "Great" },
  { value: "good",    emoji: "😊", label: "良好",  labelEn: "Good" },
  { value: "neutral", emoji: "😐", label: "一般",  labelEn: "OK" },
  { value: "tired",   emoji: "😴", label: "疲惫",  labelEn: "Tired" },
  { value: "blocked", emoji: "🚧", label: "阻塞",  labelEn: "Blocked" },
];

const TAG_LABELS: Record<DevLogTag, { zh: string; en: string }> = {
  coding:   { zh: "代码", en: "Coding" },
  art:      { zh: "美术", en: "Art" },
  design:   { zh: "设计", en: "Design" },
  bugfix:   { zh: "修Bug", en: "Bugfix" },
  balance:  { zh: "平衡", en: "Balance" },
  level:    { zh: "关卡", en: "Level" },
  audio:    { zh: "音效", en: "Audio" },
  planning: { zh: "规划", en: "Planning" },
};

interface LogModalProps {
  log?: DevLog | null;
  defaultProjectId?: string;
  onClose: () => void;
}

export default function LogModal({ log, defaultProjectId, onClose }: LogModalProps) {
  const { addLog, updateLog, deleteLog } = useLogStore();
  const { projects } = useProjectStore();
  const { t, lang } = useLanguage();
  const isEdit = !!log;

  const today = new Date().toISOString().slice(0, 10);
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [tags, setTags] = useState<DevLogTag[]>([]);
  const [completed, setCompleted] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [mood, setMood] = useState<Mood>("good");
  const [durationHours, setDurationHours] = useState(1);
  const [durationMins, setDurationMins] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (log) {
      setProjectId(log.projectId);
      setDate(log.date);
      setTags(log.tags);
      setCompleted(log.completed);
      setBlockers(log.blockers ?? "");
      setTomorrowPlan(log.tomorrowPlan ?? "");
      setMood(log.mood);
      const totalMins = log.durationMinutes;
      setDurationHours(Math.floor(totalMins / 60));
      setDurationMins(Math.round(totalMins % 60 / 5) * 5);
    }
  }, [log]);

  function toggleTag(tag: DevLogTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSave() {
    if (!completed.trim()) return;
    const data = {
      projectId,
      date,
      tags,
      completed: completed.trim(),
      blockers: blockers.trim() || undefined,
      tomorrowPlan: tomorrowPlan.trim() || undefined,
      mood,
      durationMinutes: durationHours * 60 + durationMins,
    };
    if (isEdit && log) {
      updateLog(log.id, data);
    } else {
      addLog(data);
    }
    onClose();
  }

  function handleDelete() {
    if (log) {
      deleteLog(log.id);
      onClose();
    }
  }

  const zh = lang === "zh";

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl rounded-2xl shadow-2xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <span className="font-semibold" style={{ color: "var(--text-1)" }}>
              {isEdit ? (zh ? "编辑日志" : "Edit Log") : (zh ? "新建日志" : "New Log")}
            </span>
            <div className="flex items-center gap-2">
              {isEdit && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-red-500/10 hover:text-red-400"
                  style={{ color: "var(--text-3)" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              {showDeleteConfirm && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-400">{zh ? "确认删除？" : "Delete?"}</span>
                  <button onClick={handleDelete} className="rounded px-2 py-0.5 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    {zh ? "删除" : "Yes"}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="rounded px-2 py-0.5 text-xs hover:bg-white/10" style={{ color: "var(--text-3)" }}>
                    {zh ? "取消" : "No"}
                  </button>
                </div>
              )}
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/8" style={{ color: "var(--text-3)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[72vh] overflow-y-auto px-5 py-5 flex flex-col gap-4">
            {/* Row 1: Project + Date + Duration + Mood */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Project */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "所属项目" : "Project"}
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "日期" : "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="num w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                />
              </div>

              {/* Duration - scroll picker */}
              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "开发时长" : "Duration"}
                </label>
                <div
                  className="flex items-center justify-center gap-2 rounded-xl p-3"
                  style={{ backgroundColor: "var(--bg-raised)", border: "1px solid var(--border-color)" }}
                >
                  <ScrollPicker
                    values={HOURS}
                    selected={durationHours}
                    onChange={(v) => setDurationHours(Number(v))}
                  />
                  <span className="text-lg font-bold" style={{ color: "var(--text-2)" }}>:</span>
                  <ScrollPicker
                    values={MINUTES}
                    selected={durationMins}
                    onChange={(v) => setDurationMins(Number(v))}
                  />
                  <div className="flex flex-col gap-1 text-xs ml-1" style={{ color: "var(--text-3)" }}>
                    <span>{zh ? "时" : "hr"}</span>
                    <span className="mt-6">{zh ? "分" : "min"}</span>
                  </div>
                </div>
                <p className="mt-1.5 text-center text-xs" style={{ color: "var(--text-3)" }}>
                  {zh
                    ? `共 ${durationHours} 小时 ${durationMins} 分钟`
                    : `Total: ${durationHours}h ${durationMins}m`}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "标签（可多选）" : "Tags"}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        active
                          ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                          : "border-transparent bg-white/5 hover:bg-white/10"
                      )}
                      style={active ? {} : { color: "var(--text-3)" }}
                    >
                      {zh ? TAG_LABELS[tag].zh : TAG_LABELS[tag].en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "当日状态" : "Mood"}
              </label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 transition-all",
                      mood === m.value
                        ? "border-blue-500/40 bg-blue-500/10"
                        : "border-transparent hover:bg-white/5"
                    )}
                    style={{ borderColor: mood === m.value ? undefined : "var(--border-color)" }}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span className="text-[10px]" style={{ color: mood === m.value ? "var(--text-1)" : "var(--text-3)" }}>
                      {zh ? m.label : m.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "今日完成 *" : "Today's Work *"}
              </label>
              <textarea
                value={completed}
                onChange={(e) => setCompleted(e.target.value)}
                rows={3}
                placeholder={zh ? "今天完成了什么…" : "What I accomplished today..."}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              />
            </div>

            {/* Blockers + Tomorrow */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "遇到的问题" : "Blockers"}
                </label>
                <textarea
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  rows={3}
                  placeholder={zh ? "遇到了哪些困难…" : "What blocked you..."}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "明日计划" : "Tomorrow's Plan"}
                </label>
                <textarea
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  rows={3}
                  placeholder={zh ? "明天打算做什么…" : "Plans for tomorrow..."}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-5 py-4"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-2)" }}
            >
              {zh ? "取消" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={!completed.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              {isEdit ? (zh ? "保存" : "Save") : (zh ? "新建日志" : "Create")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
