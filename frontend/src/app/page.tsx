"use client";

import { useEffect, useState } from "react";
import { AUMCard } from "@/components/dashboard/aum-card";
import { PerformanceMetricsCard } from "@/components/dashboard/performance-metrics";
import { SectorAllocationCard } from "@/components/dashboard/sector-allocation";
import { PortfolioHealthCard } from "@/components/dashboard/portfolio-health";
import { fetchDashboardData, DashboardData } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                  Ventura Capital
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors">
                  Investment Dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/portfolio")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
                >
                  View Portfolio
                </button>
                <button
                  onClick={() => router.push("/deals")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-purple-500/20"
                >
                  View Deals
                </button>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                    Logged in as
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                    {user?.email}
                  </p>
                </div>
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
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

              {/* Sector Allocation - Spans 1 column */}
              <div className="lg:col-span-1">
                <SectorAllocationCard
                  sectors={data.sectorAllocation.map((s) => ({
                    sector: s.sector,
                    value: parseFloat(s.value),
                    percentage: s.percentage,
                    color: getColorForSector(s.sector),
                  }))}
                />
              </div>

              {/* Portfolio Health - Spans 2 columns */}
              <div className="lg:col-span-2">
                <PortfolioHealthCard
                  green={data.portfolioHealth.green}
                  yellow={data.portfolioHealth.yellow}
                  red={data.portfolioHealth.red}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
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
