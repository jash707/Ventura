"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SectorAllocation } from "@/lib/types";
import { useTheme } from "next-themes";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SectorAllocationProps {
  sectors: SectorAllocation[];
}

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
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
        <p className="font-medium">{payload[0].name}</p>
        <p className={isDark ? "text-emerald-400" : "text-emerald-600"}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function SectorAllocationCard({ sectors }: SectorAllocationProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">
        Sector Allocation
      </h3>

      <div className="flex items-center justify-between">
        <div className="h-48 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectors}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {sectors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {sectors.map((sector, index) => (
            <div
              key={`${sector.sector}-${index}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-sm text-card-foreground">
                  {sector.sector}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
                  {(sector.percentage ?? 0).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(sector.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
