"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PortfolioHistoryPoint } from "@/lib/api";
import { useTheme } from "next-themes";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PerformanceHistoryChartProps {
  data: PortfolioHistoryPoint[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const { formatCurrency } = useCurrency();

  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-lg p-3 shadow-lg border ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-200"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceHistoryChart({
  data,
}: PerformanceHistoryChartProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const { formatCompact, convertAmount } = useCurrency();

  // Format data for chart with currency conversion
  const chartData = data.map((point) => ({
    date: point.date,
    invested: convertAmount(parseFloat(point.totalInvested)),
    value: convertAmount(parseFloat(point.currentValue)),
    companies: point.companyCount,
  }));

  const formatYAxis = (value: number) => formatCompact(value);

  return (
    <Card className="p-6 card-base">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Portfolio Performance Over Time
        </h3>
        <div className="text-sm text-muted-foreground">
          {chartData.length > 0 &&
            `${chartData[0]?.companies || 0} → ${
              chartData[chartData.length - 1]?.companies || 0
            } companies`}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#e2e8f0"}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
              axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
              axisLine={{ stroke: isDark ? "#475569" : "#cbd5e1" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) =>
                value === "invested" ? "Total Invested" : "Current Value"
              }
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#3b82f6"
              fill="url(#colorInvested)"
              strokeWidth={2}
              name="invested"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              fill="url(#colorValue)"
              strokeWidth={2}
              name="value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
