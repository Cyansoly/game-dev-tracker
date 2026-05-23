"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, Pin } from "lucide-react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import IdeaCard from "@/components/inspirations/IdeaCard";
import IdeaModal from "@/components/inspirations/IdeaModal";
import QuickCaptureBar from "@/components/inspirations/QuickCaptureBar";
import { useIdeaStore } from "@/contexts/IdeaStoreContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { IdeaCapsule } from "@/lib/types";

interface ProjectGroup {
  projectId: string | undefined;
  label: string;
  color: string;
  ideas: IdeaCapsule[];
}

function CollapsibleGroup({
  group, defaultOpen,
}: {
  group: ProjectGroup;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: group.color }}
        />
        <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
          {group.label}
        </span>
        <span
          className="num rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: "rgba(128,128,128,0.1)", color: "var(--text-3)" }}
        >
          {group.ideas.length}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 transition-transform"
          style={{ color: "var(--text-3)", transform: open ? "none" : "rotate(-90deg)" }}
        />
      </button>

      {/* Ideas grid */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {group.ideas.map((idea, i) => (
                  <IdeaCard key={idea.id} idea={idea} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InspirationsPage() {
  const { ideas } = useIdeaStore();
  const { projects } = useProjectStore();
  const { lang } = useLanguage();
  const zh = lang === "zh";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Ctrl+I global shortcut
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  // Filter
  const filtered = ideas.filter(
    (i) =>
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase())
  );

  // Pinned
  const pinned = filtered.filter((i) => i.pinned);

  // Group by project
  const unpinned = filtered.filter((i) => !i.pinned);
  const groups: ProjectGroup[] = [];

  // Projects with ideas
  const projectsWithIdeas = projects.filter(
    (p) => !p.isArchived && unpinned.some((i) => i.projectId === p.id)
  );
  for (const p of projectsWithIdeas) {
    groups.push({
      projectId: p.id,
      label: p.name,
      color: p.coverColor,
      ideas: unpinned
        .filter((i) => i.projectId === p.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  }

  // Uncategorized
  const uncatIdeas = unpinned.filter((i) => !i.projectId);
  if (uncatIdeas.length > 0) {
    groups.push({
      projectId: undefined,
      label: zh ? "未归类" : "Uncategorized",
      color: "var(--text-3)",
      ideas: uncatIdeas.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  }

  return (
    <AnimatedPageWrapper className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
            {zh ? "灵感库" : "Idea Vault"}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-3)" }}>
            {zh ? `共 ${ideas.length} 条灵感` : `${ideas.length} idea${ideas.length !== 1 ? "s" : ""} captured`}
            {" · "}
            <kbd className="num rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-3)", border: "1px solid var(--border-color)" }}>
              Ctrl+I
            </kbd>
            {" "}
            {zh ? "快速记录" : "quick capture"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={zh ? "搜索灵感…" : "Search ideas…"}
            className="hidden rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-blue-500/40 sm:block"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-color)", color: "var(--text-1)", width: 160 }}
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {zh ? "新建灵感" : "New Idea"}
          </button>
        </div>
      </div>

      {/* Quick capture bar */}
      <div className="mb-5">
        <QuickCaptureBar onExpand={() => setShowModal(true)} />
      </div>

      {/* Empty state */}
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lightbulb className="mb-4 h-10 w-10" style={{ color: "var(--text-3)" }} />
          <h3 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>
            {zh ? "灵感库是空的" : "No ideas yet"}
          </h3>
          <p className="mt-1.5 max-w-xs text-sm" style={{ color: "var(--text-3)" }}>
            {zh ? "想到点子先丢进来，之后再慢慢归类整理" : "Capture ideas quickly, organize them later"}
          </p>
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <Pin className="h-3 w-3" style={{ color: "#eab308" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                  {zh ? "已置顶" : "Pinned"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {pinned.map((idea, i) => (
                    <IdeaCard key={idea.id} idea={idea} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Grouped sections */}
          {groups.map((group, gi) => (
            <CollapsibleGroup key={group.projectId ?? "uncat"} group={group} defaultOpen={gi < 3} />
          ))}

          {/* Search no-result */}
          {filtered.length === 0 && search && (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                {zh ? `没有找到包含"${search}"的灵感` : `No ideas matching "${search}"`}
              </p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <IdeaModal onClose={() => setShowModal(false)} />
      )}
    </AnimatedPageWrapper>
  );
}
