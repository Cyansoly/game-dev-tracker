"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RadarPoint } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMounted } from "@/hooks/useMounted";
import ChartCard from "./ChartCard";

const MODULE_ZH: Record<string, string> = {
  art:       "美术",
  code:      "程序",
  level:     "关卡",
  audio:     "音效",
  narrative: "剧情",
  qa:        "测试",
};

interface ModuleRadarChartProps {
  data: RadarPoint[];
  projectName?: string;
}

export default function ModuleRadarChart({ data, projectName }: ModuleRadarChartProps) {
  const { t, lang } = useLanguage();
  const a = t.analytics;
  const zh = lang === "zh";
  const mounted = useMounted();

  const getLabel = (key: string) => zh ? (MODULE_ZH[key] ?? key) : key;

  const chartData = data.map((d) => ({
    ...d,
    subject: getLabel(d.key),
  }));

  const hasData = data.some((d) => d.value > 0);

  return (
    <ChartCard
      title={a.radarTitle}
      desc={a.radarDesc}
      minH={260}
      right={
        projectName ? (
          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--bg-raised)", color: "var(--text-3)" }}>
            {projectName}
          </span>
        ) : undefined
      }
    >
      {!hasData ? (
        <div className="flex h-full flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{a.radarNoData}</p>
        </div>
      ) : !mounted ? (
        <div style={{ height: 240 }} />
      ) : (
        <div style={{ width: "100%", height: 240, overflow: "hidden" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
            <PolarGrid stroke="var(--border-color)" strokeOpacity={0.7} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--text-3)", fontSize: 11 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "var(--text-3)", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickCount={4}
              tickFormatter={(v) => `${v}%`}
            />
            <Radar
              name={zh ? "进度" : "Progress"}
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.18}
              strokeWidth={1.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as RadarPoint & { subject: string };
                return (
                  <div className="rounded-xl px-3 py-2 text-xs shadow-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="font-semibold" style={{ color: "var(--text-1)" }}>{d.subject}</span>
                    </div>
                    <div className="num mt-1" style={{ color: "var(--text-2)" }}>{d.value}%</div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
