"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { useState } from "react";
import type { TagDistPoint } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMounted } from "@/hooks/useMounted";
import ChartCard from "./ChartCard";

const TAG_ZH: Record<string, string> = {
  coding:   "编程",
  art:      "美术",
  design:   "设计",
  bugfix:   "修复",
  balance:  "平衡",
  level:    "关卡",
  audio:    "音效",
  planning: "规划",
};

interface TagDistributionChartProps {
  data: TagDistPoint[];
}

/* Active sector with highlight */
function renderActiveShape(props: Record<string, unknown>) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number;
    startAngle: number; endAngle: number; fill: string;
  };
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={(outerRadius as number) + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.9} />
    </g>
  );
}

export default function TagDistributionChart({ data }: TagDistributionChartProps) {
  const { t, lang } = useLanguage();
  const a = t.analytics;
  const zh = lang === "zh";
  const mounted = useMounted();
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);
  const totalH = (totalMinutes / 60).toFixed(1);

  const getLabel = (tag: string) => zh ? (TAG_ZH[tag] ?? tag) : tag;

  return (
    <ChartCard title={a.tagTitle} desc={a.tagDesc} minH={260}>
      {data.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 py-12">
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{a.tagNoData}</p>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center gap-3">
          {!mounted ? <div style={{ height: 200 }} /> :
          <div className="relative w-full" style={{ height: 200, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="minutes"
                  nameKey="tag"
                  activeIndex={activeIdx}
                  activeShape={renderActiveShape as never}
                  onMouseEnter={(_, idx) => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(undefined)}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.tag} fill={entry.color} opacity={activeIdx === undefined || data.indexOf(entry) === activeIdx ? 1 : 0.45} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as TagDistPoint;
                    return (
                      <div className="rounded-xl px-3 py-2 text-xs shadow-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="font-semibold" style={{ color: "var(--text-1)" }}>{getLabel(d.tag)}</span>
                        </div>
                        <div className="num" style={{ color: "var(--text-2)" }}>{(d.minutes / 60).toFixed(1)}h · {d.percent}%</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-xl font-bold" style={{ color: "var(--text-1)" }}>{totalH}h</span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{a.tagCenter}</span>
            </div>
          </div>}


          {/* Legend */}
          <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-1.5">
            {data.map((d, i) => (
              <div
                key={d.tag}
                className="flex cursor-pointer items-center gap-1.5 transition-opacity"
                style={{ opacity: activeIdx === undefined || i === activeIdx ? 1 : 0.4 }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(undefined)}
              >
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs" style={{ color: "var(--text-2)" }}>{getLabel(d.tag)}</span>
                <span className="num text-xs" style={{ color: "var(--text-3)" }}>{d.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
