"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { SectorAllocation } from "@/lib/types";

interface SectorAllocationProps {
  sectors: SectorAllocation[];
}

export function SectorAllocationCard({ sectors }: SectorAllocationProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-6">
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {sectors.map((sector) => (
            <div
              key={sector.sector}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-sm text-slate-300">{sector.sector}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-200">
                  {sector.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
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
