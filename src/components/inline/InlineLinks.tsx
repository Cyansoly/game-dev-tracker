"use client";

import { useState } from "react";
import { Plus, X, ExternalLink, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectLink } from "@/lib/types";

function LinkIcon({ icon }: { icon?: ProjectLink["icon"] }) {
  if (icon === "github") return <span className="text-sm">⚙</span>;
  if (icon === "steam") return <span className="text-sm">🎮</span>;
  if (icon === "itch") return <span className="text-sm">🕹</span>;
  if (icon === "discord") return <span className="text-sm">💬</span>;
  if (icon === "youtube") return <span className="text-sm">▶</span>;
  if (icon === "twitter") return <span className="text-sm">✕</span>;
  return <Globe className="h-3.5 w-3.5" />;
}

function detectIcon(url: string): ProjectLink["icon"] {
  if (url.includes("github")) return "github";
  if (url.includes("store.steampowered")) return "steam";
  if (url.includes("itch.io")) return "itch";
  if (url.includes("discord")) return "discord";
  if (url.includes("youtube")) return "youtube";
  if (url.includes("twitter") || url.includes("x.com")) return "twitter";
  return "web";
}

interface InlineLinksProps {
  links: ProjectLink[];
  onChange: (links: ProjectLink[]) => void;
  accentColor?: string;
  readOnly?: boolean;
}

export default function InlineLinks({ links, onChange, accentColor, readOnly = false }: InlineLinksProps) {
  const [adding, setAdding] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  function commitAdd() {
    if (!draftUrl.trim()) { setAdding(false); return; }
    const url = draftUrl.trim().startsWith("http") ? draftUrl.trim() : `https://${draftUrl.trim()}`;
    onChange([...links, { label: draftLabel.trim() || url, url, icon: detectIcon(url) }]);
    setDraftLabel(""); setDraftUrl(""); setAdding(false);
  }

  function remove(idx: number) {
    onChange(links.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {links.map((link, idx) => (
          <motion.div
            key={idx}
            className="group flex items-center gap-2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <span style={{ color: accentColor ?? "var(--text-3)" }}>
              <LinkIcon icon={link.icon} />
            </span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
              style={{ color: accentColor ?? "var(--text-2)" }}
            >
              {link.label}
              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
            </a>
            {!readOnly && (
              <button
                onClick={() => remove(idx)}
                className="opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
                style={{ color: "var(--text-3)" }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {!readOnly && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
          style={{ color: "var(--text-3)" }}
        >
          <Plus className="h-3 w-3" />
          添加链接
        </button>
      )}

      {adding && (
        <motion.div
          className="flex flex-col gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            autoFocus
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setAdding(false); }}
            placeholder="标签（可留空）"
            className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-1)" }}
          />
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="https://..."
            className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--input-bg)", borderColor: accentColor ?? "var(--border-color)", color: "var(--text-1)" }}
          />
          <div className="flex gap-1.5">
            <button onClick={commitAdd} className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500">添加</button>
            <button onClick={() => setAdding(false)} className="rounded-lg px-3 py-1 text-xs hover:bg-white/8" style={{ color: "var(--text-3)" }}>取消</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
