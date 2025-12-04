"use client";

import { AUMCard } from "@/components/dashboard/aum-card";
import { PerformanceMetricsCard } from "@/components/dashboard/performance-metrics";
import { SectorAllocationCard } from "@/components/dashboard/sector-allocation";
import { PortfolioHealthCard } from "@/components/dashboard/portfolio-health";
import { mockDashboardData } from "@/lib/mock-data";

export default function DashboardPage() {
  const { aum, performance, sectorAllocation, portfolioHealth } =
    mockDashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Ventura Capital</h1>
              <p className="text-slate-400 mt-1">Investment Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Last updated</p>
              <p className="text-sm font-semibold text-slate-200">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AUM Card - Spans 1 column */}
          <div className="lg:col-span-1">
            <AUMCard
              totalDeployed={aum.totalDeployed}
              currentValuation={aum.currentValuation}
              unrealizedGains={aum.unrealizedGains}
            />
          </div>

          {/* Performance Metrics - Spans 2 columns */}
          <div className="lg:col-span-2">
            <PerformanceMetricsCard metrics={performance} />
          </div>

          {/* Sector Allocation - Spans 1 column */}
          <div className="lg:col-span-1">
            <SectorAllocationCard sectors={sectorAllocation} />
          </div>

          {/* Portfolio Health - Spans 2 columns */}
          <div className="lg:col-span-2">
            <PortfolioHealthCard
              green={portfolioHealth.green}
              yellow={portfolioHealth.yellow}
              red={portfolioHealth.red}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
