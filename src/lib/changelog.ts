export type ChangeType = "feature" | "improve" | "fix";

export interface ChangeItem {
  zh: string;
  en: string;
}

export interface ChangeSection {
  type: ChangeType;
  items: ChangeItem[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  highlight?: { zh: string; en: string };
  sections: ChangeSection[];
}

export const APP_VERSION = "v1.1.0";

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v1.1.0",
    date: "2026-05-23",
    highlight: {
      zh: "灵感库、开发里程碑独立页面、设置真正生效",
      en: "Idea Vault, standalone Milestones page, settings now functional",
    },
    sections: [
      {
        type: "feature",
        items: [
          { zh: "新增「灵感库」功能：随时记录制作灵感，支持按项目归类与折叠展示", en: "Idea Vault: capture ideas anytime, organize by project with collapsible groups" },
          { zh: "开发里程碑升级为独立一级页面，已完成/未完成里程碑清晰区分", en: "Dev Milestones is now a standalone page with completed/pending distinction" },
          { zh: "设置中新增「更新日志」板块，可查看每次版本迭代内容", en: "Changelog section added to Settings — browse all version updates" },
          { zh: "强调色、紧凑模式、界面动效现在真正生效并持久化", en: "Accent color, compact mode, and animation toggle are now fully functional" },
          { zh: "全局快捷键 Ctrl+I 快速打开灵感捕获弹窗", en: "Global shortcut Ctrl+I to open quick idea capture" },
          { zh: "项目详情页新增「灵感」Tab，查看项目专属灵感", en: "Project detail now has an Ideas tab for project-specific inspiration" },
        ],
      },
      {
        type: "improve",
        items: [
          { zh: "侧边栏移除嵌入式里程碑组件，导航更简洁", en: "Sidebar cleaned up — embedded milestones moved to dedicated page" },
          { zh: "侧边栏 Logo 区显示当前版本号", en: "Sidebar logo area now shows the current app version" },
          { zh: "顶部「+ 新建」改为下拉菜单，同时支持记录日志和新建灵感", en: "Top bar '+' button is now a dropdown supporting both Log and Idea creation" },
        ],
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-05-01",
    highlight: {
      zh: "首个正式版本发布",
      en: "First official release",
    },
    sections: [
      {
        type: "feature",
        items: [
          { zh: "项目管理：网格/列表双视图，阶段与势头标签", en: "Project management with grid/list views, stage and momentum tags" },
          { zh: "开发日志：每日记录，含心情、时长、标签", en: "Dev logs with mood, duration, and tag tracking" },
          { zh: "任务看板：四列 Kanban，优先级与拖拽排序", en: "4-column Kanban board with priority and drag-to-sort" },
          { zh: "数据分析：趋势图、标签分布、项目对比", en: "Analytics with trend chart, tag distribution, and project comparison" },
          { zh: "自定义仪表盘：9 个可隐藏/调整大小的小组件", en: "Customizable dashboard with 9 resizable/hideable widgets" },
          { zh: "开发里程碑与成就系统（嵌入侧边栏）", en: "Dev milestones and achievement system (embedded in sidebar)" },
          { zh: "暗色/亮色主题、中英文切换", en: "Dark/light theme and Chinese/English language toggle" },
          { zh: "Ctrl+K 全局搜索命令面板", en: "Ctrl+K global search command palette" },
        ],
      },
    ],
  },
];
