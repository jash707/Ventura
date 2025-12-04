"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, TrendingDown } from "lucide-react";

interface AUMCardProps {
  totalDeployed: number;
  currentValuation: number;
  unrealizedGains: number;
}

export function AUMCard({
  totalDeployed,
  currentValuation,
  unrealizedGains,
}: AUMCardProps) {
  const returnPercentage = ((unrealizedGains / totalDeployed) * 100).toFixed(1);
  const isPositive = unrealizedGains >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 transition-colors">
          Total AUM
        </h3>
        <DollarSign className="h-5 w-5 text-emerald-500 dark:text-emerald-400 transition-colors" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 transition-colors">
            Current Valuation
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
            {formatCurrency(currentValuation)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">
              Deployed Capital
            </p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 transition-colors">
              {formatCurrency(totalDeployed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">
              Unrealized Gains
            </p>
            <div className="flex items-center gap-1">
              <p
                className={`text-lg font-semibold transition-colors ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(unrealizedGains)}
              </p>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-colors" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 transition-colors" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              Return
            </span>
            <span
              className={`text-sm font-semibold transition-colors ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {returnPercentage}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
