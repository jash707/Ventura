"use client";

import { useState, useCallback } from "react";
import { fetchDeals, updateDealStage } from "@/lib/api";
import { Deal, DealStage } from "@/lib/types";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { AddDealModal } from "@/components/deals/add-deal-modal";
import { ConvertToPortfolioModal } from "@/components/deals/convert-to-portfolio-modal";
import { LossReasonModal } from "@/components/deals/loss-reason-modal";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import {
  LayoutGrid,
  Plus,
  Archive,
  Briefcase,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuthenticatedEffect } from "@/hooks/useAuthenticatedQuery";
import { Badge } from "@/components/ui/badge";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [archivedDeals, setArchivedDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "history">("active");

  // Modal states for close/lose
  const [pendingDeal, setPendingDeal] = useState<Deal | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);

  const loadDeals = useCallback(async () => {
    try {
      setLoading(true);
      const [activeData, archivedData] = await Promise.all([
        fetchDeals(false),
        fetchDeals(true),
      ]);
      setDeals(activeData);
      setArchivedDeals(archivedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
      console.error("Deals error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useAuthenticatedEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleDealStageChange = async (dealId: number, newStage: DealStage) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // Intercept close and lost stages to show modals
    if (newStage === "closed") {
      setPendingDeal(deal);
      setShowCloseModal(true);
      return;
    }

    if (newStage === "lost") {
      setPendingDeal(deal);
      setShowLoseModal(true);
      return;
    }

    // Normal stage update
    await updateDealStage(dealId, newStage);
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)),
    );
  };

  const handleDealCreated = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev]);
  };

  const handleCloseComplete = (companyId?: number) => {
    if (pendingDeal) {
      // Remove from active, add to archived
      setDeals((prev) => prev.filter((d) => d.id !== pendingDeal.id));
      setArchivedDeals((prev) => [
        {
          ...pendingDeal,
          stage: "closed" as DealStage,
          archivedAt: new Date().toISOString(),
          convertedCompanyId: companyId,
        },
        ...prev,
      ]);
    }
    setShowCloseModal(false);
    setPendingDeal(null);
  };

  const handleLoseComplete = () => {
    if (pendingDeal) {
      // Remove from active, add to archived
      setDeals((prev) => prev.filter((d) => d.id !== pendingDeal.id));
      setArchivedDeals((prev) => [
        {
          ...pendingDeal,
          stage: "lost" as DealStage,
          archivedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setShowLoseModal(false);
    setPendingDeal(null);
  };

  const handleCloseModalClose = () => {
    setShowCloseModal(false);
    setPendingDeal(null);
  };

  const handleLoseModalClose = () => {
    setShowLoseModal(false);
    setPendingDeal(null);
  };

  const getLossReasonLabel = (reason?: string) => {
    const labels: Record<string, string> = {
      passed: "Passed",
      valuation_too_high: "Valuation Too High",
      competitor_won: "Competitor Won",
      founder_declined: "Founder Declined",
      deal_fell_through: "Deal Fell Through",
      other: "Other",
    };
    return reason ? labels[reason] || reason : "Unknown";
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                  Deal Flow
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors">
                  Manage your investment pipeline
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setViewMode("active")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Active Pipeline
                <Badge variant="secondary" className="ml-1">
                  {deals.length}
                </Badge>
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "history"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Archive className="h-4 w-4" />
                Deal History
                <Badge variant="secondary" className="ml-1">
                  {archivedDeals.length}
                </Badge>
              </button>
            </div>
          </div>
          {viewMode === "active" && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Deal
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600 dark:text-slate-400 text-lg transition-colors">
              Loading deals...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-red-700 dark:text-red-400 transition-colors">
              ⚠️ {error}
            </p>
            <p className="text-sm text-red-600 dark:text-slate-400 mt-2 transition-colors">
              Make sure the backend is running on http://localhost:8080
            </p>
          </div>
        )}

        {/* Active Pipeline View */}
        {!loading && !error && viewMode === "active" && (
          <>
            <KanbanBoard
              deals={deals}
              onDealStageChange={handleDealStageChange}
            />

            {/* Empty State */}
            {deals.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                <LayoutGrid className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No active deals
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Get started by adding your first deal to the pipeline
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Deal
                </button>
              </div>
            )}
          </>
        )}

        {/* Deal History View */}
        {!loading && !error && viewMode === "history" && (
          <div className="space-y-4">
            {archivedDeals.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <Archive className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No archived deals
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Closed and lost deals will appear here
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Reason / Conversion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Archived
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {archivedDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {deal.companyName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {deal.roundStage}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {deal.sector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {deal.stage === "closed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Won
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              <XCircle className="h-3 w-3" />
                              Lost
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {deal.stage === "closed" ? (
                            deal.convertedCompanyId ? (
                              <span className="text-green-600 dark:text-green-400">
                                → Portfolio Company #{deal.convertedCompanyId}
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Not converted
                              </span>
                            )
                          ) : (
                            getLossReasonLabel(deal.lossReason)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {deal.archivedAt
                            ? new Date(deal.archivedAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDealCreated={handleDealCreated}
      />

      <ConvertToPortfolioModal
        isOpen={showCloseModal}
        deal={pendingDeal}
        onClose={handleCloseModalClose}
        onConvert={handleCloseComplete}
      />

      <LossReasonModal
        isOpen={showLoseModal}
        deal={pendingDeal}
        onClose={handleLoseModalClose}
        onLose={handleLoseComplete}
      />

      {/* Footer */}
      <Footer />
    </AppLayout>
  );
}
