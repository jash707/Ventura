"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SectorComparisonData } from "@/lib/api";
import { useTheme } from "next-themes";

interface SectorComparisonChartProps {
  data: SectorComparisonData[];
}

const SECTOR_COLORS: Record<string, string> = {
  SaaS: "#3b82f6",
  Fintech: "#8b5cf6",
  AI: "#ec4899",
  BioTech: "#10b981",
  Healthcare: "#06b6d4",
  "E-commerce": "#f59e0b",
  CleanTech: "#22c55e",
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      sector: string;
      invested: number;
      value: number;
      moic: number;
      companies: number;
    };
  }>;
}) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  };

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className={`rounded-lg p-3 shadow-lg border ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-200"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <p className="font-semibold mb-2">{data.sector}</p>
        <p className="text-sm text-blue-500">
          Invested: {formatCurrency(data.invested)}
        </p>
        <p className="text-sm text-emerald-500">
          Value: {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-purple-500">MOIC: {data.moic.toFixed(2)}x</p>
        <p className="text-sm text-slate-400">
          {data.companies} {data.companies === 1 ? "company" : "companies"}
        </p>
      </div>
    );
  }
  return null;
};

export function SectorComparisonChart({ data }: SectorComparisonChartProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Format data for chart
  const chartData = data
    .map((item) => ({
      sector: item.sector,
      invested: parseFloat(item.totalInvested),
      value: parseFloat(item.currentValue),
      moic: parseFloat(item.moic),
      companies: item.companyCount,
    }))
    .sort((a, b) => b.value - a.value);

  const formatXAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Sector Comparison
        </h3>
        <div className="text-sm text-muted-foreground">
          By Current Valuation
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#e2e8f0"}
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tickFormatter={formatXAxis}
              tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
              axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
            />
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
              axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SECTOR_COLORS[entry.sector] || "#64748b"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MOIC Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {chartData.map((item) => (
          <div key={item.sector} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: SECTOR_COLORS[item.sector] || "#64748b",
              }}
            />
            <span className="text-muted-foreground">{item.sector}</span>
            <span className="font-semibold text-card-foreground">
              {item.moic.toFixed(2)}x
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
