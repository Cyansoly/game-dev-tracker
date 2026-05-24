import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferenceProvider } from "@/contexts/PreferenceContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProjectStoreProvider } from "@/contexts/ProjectStoreContext";
import { TaskStoreProvider } from "@/contexts/TaskStoreContext";
import { LogStoreProvider } from "@/contexts/LogStoreContext";
import { IdeaStoreProvider } from "@/contexts/IdeaStoreContext";
import { VersionStoreProvider } from "@/contexts/VersionStoreContext";
import { MilestoneProvider } from "@/contexts/MilestoneContext";
import { LayoutStoreProvider } from "@/contexts/LayoutStoreContext";
import { SearchProvider } from "@/contexts/SearchContext";
import WorkspaceGate from "@/components/workspace/WorkspaceGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "开发追踪器 — 游戏开发工作室",
  description: "记录游戏开发进度、每日日志与里程碑。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>
          <ThemeProvider>
            <PreferenceProvider>
              <WorkspaceProvider>
                <ProjectStoreProvider>
                  <TaskStoreProvider>
                    <LogStoreProvider>
                      <IdeaStoreProvider>
                        <VersionStoreProvider>
                          <MilestoneProvider>
                            <LayoutStoreProvider>
                              <SearchProvider>
                                <WorkspaceGate>{children}</WorkspaceGate>
                              </SearchProvider>
                            </LayoutStoreProvider>
                          </MilestoneProvider>
                        </VersionStoreProvider>
                      </IdeaStoreProvider>
                    </LogStoreProvider>
                  </TaskStoreProvider>
                </ProjectStoreProvider>
              </WorkspaceProvider>
            </PreferenceProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}