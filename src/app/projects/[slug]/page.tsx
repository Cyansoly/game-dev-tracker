"use client";

import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import AnimatedPageWrapper from "@/components/ui/AnimatedPageWrapper";
import ProjectHeader from "@/components/project-detail/ProjectHeader";
import ProjectDetailTabs from "@/components/project-detail/ProjectDetailTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjectStore } from "@/contexts/ProjectStoreContext";
import { useLogStore } from "@/contexts/LogStoreContext";
import { useTaskStore } from "@/contexts/TaskStoreContext";
import { useVersionStore } from "@/contexts/VersionStoreContext";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { t, lang } = useLanguage();
  const d = t.detail;
  const { projects } = useProjectStore();
  const { logs: allLogs } = useLogStore();
  const { tasks: allTasks } = useTaskStore();
  const { getByProject } = useVersionStore();

  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const logs = [...allLogs]
    .filter((l) => l.projectId === project.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const tasks = allTasks.filter((t) => t.projectId === project.id);
  const versions = getByProject(project.id);

  return (
    <AnimatedPageWrapper className="p-6">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 transition-colors hover:opacity-80"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {d.backToProjects}
        </Link>
        <span style={{ color: "var(--text-3)" }}>/</span>
        <span style={{ color: "var(--text-2)" }}>{project.name}</span>
      </div>

      {/* Fully-editable project header */}
      <ProjectHeader project={project} />

      {/* Tabs */}
      <ProjectDetailTabs project={project} logs={logs} tasks={tasks} versions={versions} />
    </AnimatedPageWrapper>
  );
}
