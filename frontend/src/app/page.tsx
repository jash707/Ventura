"use client";

import { useEffect, useState } from "react";
import { AUMCard } from "@/components/dashboard/aum-card";
import { PerformanceMetricsCard } from "@/components/dashboard/performance-metrics";
import { SectorAllocationCard } from "@/components/dashboard/sector-allocation";
import { PortfolioHealthCard } from "@/components/dashboard/portfolio-health";
import { PerformanceHistoryChart } from "@/components/dashboard/performance-history-chart";
import { SectorComparisonChart } from "@/components/dashboard/sector-comparison-chart";
import { InvestmentTimeline } from "@/components/dashboard/investment-timeline";
import MissingUpdatesAlert from "@/components/dashboard/missing-updates-alert";
import {
  fetchDashboardData,
  fetchDashboardHistory,
  DashboardData,
  DashboardHistoryData,
} from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Footer } from "@/components/Footer";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { Search } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [historyData, setHistoryData] = useState<DashboardHistoryData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    isOpen: isSearchOpen,
    open: openSearch,
    close: closeSearch,
  } = useCommandPalette();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashboardData, history] = await Promise.all([
          fetchDashboardData(),
          fetchDashboardHistory(),
        ]);
        setData(dashboardData);
        setHistoryData(history);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                Investment Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors">
                Overview of your portfolio performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors text-sm border border-slate-200 dark:border-slate-700"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">
                  ⌘K
                </kbd>
              </button>
              <CurrencySelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600 dark:text-slate-400 text-lg transition-colors">
              Loading dashboard...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-red-700 dark:text-red-400 transition-colors">
              ⚠️ {error}
            </p>
            <p className="text-sm text-red-600 dark:text-slate-400 mt-2 transition-colors">
              Make sure the backend is running on http://localhost:8080
            </p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-8">
            {/* Missing Updates Alert */}
            <MissingUpdatesAlert />

            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AUM Card - Spans 1 column */}
              <div className="lg:col-span-1">
                <AUMCard
                  totalDeployed={parseFloat(data.aum.totalDeployed)}
                  currentValuation={parseFloat(data.aum.currentValuation)}
                  unrealizedGains={parseFloat(data.aum.unrealizedGains)}
                />
              </div>

              {/* Performance Metrics - Spans 2 columns */}
              <div className="lg:col-span-2">
                <PerformanceMetricsCard
                  metrics={{
                    irr: data.performance.irr,
                    moic: parseFloat(data.performance.moic),
                    totalDeployed: parseFloat(data.performance.totalDeployed),
                    currentValue: parseFloat(data.performance.currentValue),
                    distributions: data.performance.distributions,
                  }}
                />
              </div>

              {/* Left Column - Sector Allocation + Investment Timeline */}
              <div className="lg:col-span-1 space-y-6">
                <SectorAllocationCard
                  sectors={(data.sectorAllocation || []).map((s) => ({
                    sector: s.sector,
                    value: parseFloat(s.value),
                    percentage: s.percentage,
                    color: getColorForSector(s.sector),
                  }))}
                />
                {historyData && (
                  <InvestmentTimeline
                    data={historyData.investmentTimeline || []}
                  />
                )}
              </div>

              {/* Portfolio Health - Spans 2 columns */}
              <div className="lg:col-span-2">
                <PortfolioHealthCard
                  green={data.portfolioHealth?.green || []}
                  yellow={data.portfolioHealth?.yellow || []}
                  red={data.portfolioHealth?.red || []}
                />
              </div>
            </div>

            {/* Charts Section */}
            {historyData && (
              <>
                {/* Performance History - Full Width */}
                <div>
                  <PerformanceHistoryChart
                    data={historyData.portfolioHistory || []}
                  />
                </div>

                {/* Sector Comparison - Full Width */}
                <div>
                  <SectorComparisonChart
                    data={historyData.sectorComparison || []}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={closeSearch} />
    </AppLayout>
  );
}

// Helper to assign colors to sectors
function getColorForSector(sector: string): string {
  const colors: Record<string, string> = {
    SaaS: "#3b82f6",
    Fintech: "#8b5cf6",
    AI: "#ec4899",
    BioTech: "#10b981",
  };
  return colors[sector] || "#64748b";
}
