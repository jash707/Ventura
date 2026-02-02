"use client";

import { useEffect, useState } from "react";
import { fetchDeals, updateDealStage } from "@/lib/api";
import { Deal, DealStage } from "@/lib/types";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { AddDealModal } from "@/components/deals/add-deal-modal";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { LayoutGrid, Plus } from "lucide-react";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const data = await fetchDeals();
        setDeals(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deals");
        console.error("Deals error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  const handleDealStageChange = async (dealId: number, newStage: DealStage) => {
    await updateDealStage(dealId, newStage);
    // Optimistically update local state
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, stage: newStage } : deal,
      ),
    );
  };

  const handleDealCreated = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev]);
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
          <div>
            <p className="text-slate-600 dark:text-slate-400">
              {deals.length} {deals.length === 1 ? "deal" : "deals"} total
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Deal
          </button>
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

        {/* Kanban Board */}
        {!loading && !error && (
          <KanbanBoard
            deals={deals}
            onDealStageChange={handleDealStageChange}
          />
        )}

        {/* Empty State */}
        {!loading && !error && deals.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
            <LayoutGrid className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No deals yet
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
      </div>

      {/* Add Deal Modal */}
      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDealCreated={handleDealCreated}
      />

      {/* Footer */}
      <Footer />
    </AppLayout>
  );
}
