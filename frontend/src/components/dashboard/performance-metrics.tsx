"use client";

import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PerformanceMetrics } from "@/lib/types";
import { useTheme } from "next-themes";

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
}

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-lg p-3 shadow-lg border ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-200"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <p className="text-sm">Portfolio Value</p>
        <p
          className={`font-bold ${
            isDark ? "text-emerald-400" : "text-emerald-600"
          }`}
        >
          ${payload[0].value}M
        </p>
      </div>
    );
  }
  return null;
};

const mockTimeSeriesData = [
  { month: "Jan", value: 18 },
  { month: "Feb", value: 22 },
  { month: "Mar", value: 28 },
  { month: "Apr", value: 35 },
  { month: "May", value: 48 },
  { month: "Jun", value: 62 },
  { month: "Jul", value: 75 },
  { month: "Aug", value: 85 },
  { month: "Sep", value: 95 },
];

export function PerformanceMetricsCard({ metrics }: PerformanceMetricsProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">
        Performance Metrics
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Internal Rate of Return
          </p>
          <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
            {metrics.irr.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Annualized</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Multiple on Invested Capital
          </p>
          <p className="text-2xl font-bold text-violet-500 dark:text-violet-400">
            {metrics.moic.toFixed(2)}x
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total Return Multiple
          </p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockTimeSeriesData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
