export type ProjectStage =
  | "concept"
  | "prototype"
  | "production"
  | "polish"
  | "released"
  | "paused";

/** 开发势头：项目当前的推进状态 */
export type DevMomentum = "idle" | "steady" | "active" | "crunch";

export type Platform =
  | "pc"
  | "mac"
  | "linux"
  | "switch"
  | "ps5"
  | "xbox"
  | "ios"
  | "android"
  | "web";

export type ModuleKey = string; // was restricted enum, now open string

export interface ProjectLink {
  label: string;
  url: string;
  icon?: "github" | "steam" | "itch" | "discord" | "youtube" | "twitter" | "web";
}

export interface ProgressModule {
  key: ModuleKey;
  label: string;
  progress: number; // 0-100
  weight: number;
  color?: string;    // optional override; falls back to MODULE_COLORS map
  note?: string;
  isCustom?: boolean;
  updatedAt: string;
}

export interface GameProject {
  id: string;
  slug: string;
  name: string;
  tagline?: string;           // one-liner positioning
  description: string;
  genre: string;
  tags: string[];             // free tags e.g. ["pixel-art","metroidvania"]
  icon?: string;              // emoji or single char
  coverColor: string;

  // Stage & status
  stage: ProjectStage;
  currentVersion: string;
  momentum: DevMomentum;
  overallProgress: number;
  progressModules: ProgressModule[];

  // Platform & tech
  platforms: Platform[];
  engine?: string;
  languages?: string[];       // supported locales

  // Timeline
  startedAt?: string;         // YYYY-MM-DD
  targetReleaseDate?: string; // YYYY-MM-DD
  plannedDurationDays?: number;

  // Team
  teamSize?: number;
  role?: string;              // my role: "Solo Dev" / "Lead Programmer" / ...
  collaborators?: string[];

  // Rich notes
  nextPlan?: string;
  techStackNotes?: string;
  pitch?: string;             // elevator pitch / selling points
  references?: string;        // inspiration & reference works

  // Manual calibration
  manualHoursOffset?: number; // additional hours to add on top of logged time

  // Links
  links: ProjectLink[];

  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DevLogTag =
  | "coding"
  | "art"
  | "design"
  | "bugfix"
  | "balance"
  | "level"
  | "audio"
  | "planning";

export type Mood = "great" | "good" | "neutral" | "tired" | "blocked";

export interface DevLog {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  tags: DevLogTag[];
  completed: string;
  blockers?: string;
  tomorrowPlan?: string;
  mood: Mood;
  durationMinutes: number;
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  order: number;
  createdAt: string;
}

export interface VersionRecord {
  id: string;
  projectId: string;
  version: string;
  title?: string;
  releaseNotes: string;
  releasedAt: string;
  tag?: "alpha" | "beta" | "rc" | "release";
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  targetDate?: string;
  completedAt?: string;
}
