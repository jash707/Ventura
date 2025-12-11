"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateCompanyData, PortfolioCompany } from "@/lib/types";

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyData) => Promise<void>;
  initialData?: PortfolioCompany | null;
  mode: "create" | "edit";
}

const SECTORS = [
  "SaaS",
  "Fintech",
  "AI",
  "BioTech",
  "Healthcare",
  "E-commerce",
  "CleanTech",
];
const ROUND_STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
];

export function CompanyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: CompanyFormModalProps) {
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: "",
    sector: "SaaS",
    amountInvested: 0,
    currentValuation: 0,
    roundStage: "Seed",
    investedAt: new Date().toISOString().split("T")[0],
    cashRemaining: 0,
    monthlyBurnRate: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        sector: initialData.sector,
        amountInvested: initialData.amountInvested,
        currentValuation: initialData.currentValuation,
        roundStage: initialData.roundStage || "Seed",
        investedAt: initialData.investedAt
          ? initialData.investedAt.split("T")[0]
          : new Date().toISOString().split("T")[0],
        cashRemaining: initialData.cashRemaining,
        monthlyBurnRate: initialData.monthlyBurnRate,
        monthlyRevenue: initialData.monthlyRevenue || 0,
      });
    } else {
      setFormData({
        name: "",
        sector: "SaaS",
        amountInvested: 0,
        currentValuation: 0,
        roundStage: "Seed",
        investedAt: new Date().toISOString().split("T")[0],
        cashRemaining: 0,
        monthlyBurnRate: 0,
        monthlyRevenue: 0,
      });
    }
  }, [initialData, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      // Convert date from "YYYY-MM-DD" to ISO8601 format "YYYY-MM-DDT00:00:00Z" for Go backend
      const submitData = {
        ...formData,
        investedAt: formData.investedAt.includes("T")
          ? formData.investedAt
          : `${formData.investedAt}T00:00:00Z`,
      };
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Add Portfolio Company"
              : "Edit Portfolio Company"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) =>
                    setFormData({ ...formData, sector: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Round Stage
                </label>
                <select
                  value={formData.roundStage}
                  onChange={(e) =>
                    setFormData({ ...formData, roundStage: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {ROUND_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Investment Date
                </label>
                <input
                  type="date"
                  value={formData.investedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, investedAt: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Investment Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Investment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount Invested ($)
                </label>
                <input
                  type="number"
                  value={formData.amountInvested}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountInvested: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Valuation ($)
                </label>
                <input
                  type="number"
                  value={formData.currentValuation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentValuation: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Financial Health */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Financial Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cash Remaining ($)
                </label>
                <input
                  type="number"
                  value={formData.cashRemaining}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cashRemaining: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Burn Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyBurnRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyBurnRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Revenue ($)
                </label>
                <input
                  type="number"
                  value={formData.monthlyRevenue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyRevenue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Add Company"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
