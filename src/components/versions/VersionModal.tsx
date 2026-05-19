"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, GitBranch } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

const VERSION_TAGS = ["alpha", "beta", "rc", "release"] as const;
type VersionTag = typeof VERSION_TAGS[number];

interface VersionModalProps {
  projectId: string;
  defaultVersion?: string;
  onClose: () => void;
  onSave: (data: {
    projectId: string;
    version: string;
    title: string;
    releaseNotes: string;
    releasedAt: string;
    tag: VersionTag;
  }) => void;
}

const tagColors: Record<VersionTag, string> = {
  alpha:   "bg-purple-500/15 text-purple-300 border border-purple-500/25",
  beta:    "bg-blue-500/15 text-blue-300 border border-blue-500/25",
  rc:      "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
  release: "bg-green-500/15 text-green-300 border border-green-500/25",
};

export default function VersionModal({ projectId, defaultVersion = "", onClose, onSave }: VersionModalProps) {
  const { t, lang } = useLanguage();
  const zh = lang === "zh";
  const today = new Date().toISOString().slice(0, 10);

  const [version, setVersion] = useState(defaultVersion);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(today);
  const [tag, setTag] = useState<VersionTag>("alpha");

  function handleSave() {
    if (!version.trim()) return;
    onSave({ projectId, version: version.trim(), title: title.trim(), releaseNotes: notes, releasedAt: date, tag });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl shadow-2xl"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" style={{ color: "var(--text-3)" }} />
              <span className="font-semibold" style={{ color: "var(--text-1)" }}>
                {zh ? "记录新版本" : "New Version"}
              </span>
            </div>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/8" style={{ color: "var(--text-3)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5">
            {/* Version + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "版本号 *" : "Version *"}
                </label>
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v0.8.0"
                  className="num w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  {zh ? "发布日期" : "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="num w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
                />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "版本标签" : "Tag"}
              </label>
              <div className="flex gap-2">
                {VERSION_TAGS.map((vt) => (
                  <button
                    key={vt}
                    onClick={() => setTag(vt)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-medium transition-all",
                      tagColors[vt],
                      tag === vt && "ring-2 ring-blue-500/40 ring-offset-1 ring-offset-transparent"
                    )}
                  >
                    {t.versionTags[vt]}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "版本标题" : "Title"}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={zh ? "简短描述这个版本" : "Brief version description"}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              />
            </div>

            {/* Release Notes */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                {zh ? "更新说明" : "Release Notes"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder={zh ? "这个版本修复了什么？新增了什么功能？" : "What's new in this version?"}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border-color)" }}>
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/8" style={{ color: "var(--text-2)" }}>
              {zh ? "取消" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={!version.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              {zh ? "保存版本" : "Save Version"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
