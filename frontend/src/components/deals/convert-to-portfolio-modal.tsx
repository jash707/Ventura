"use client";

import { useState } from "react";
import { Deal } from "@/lib/types";
import { closeDeal, CloseDealData } from "@/lib/api";
import { X, Building2, DollarSign, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConvertToPortfolioModalProps {
  isOpen: boolean;
  deal: Deal | null;
  onClose: () => void;
  onConvert: (companyId?: number) => void;
}

export function ConvertToPortfolioModal({
  isOpen,
  deal,
  onClose,
  onConvert,
}: ConvertToPortfolioModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cashRemaining: "",
    monthlyBurnRate: "",
    monthlyRevenue: "",
  });

  if (!isOpen || !deal) return null;

  const handleSkip = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await closeDeal(deal.id, { convertToPortfolio: false });
      onConvert();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data: CloseDealData = {
        convertToPortfolio: true,
        cashRemaining: parseFloat(formData.cashRemaining) || 0,
        monthlyBurnRate: parseFloat(formData.monthlyBurnRate) || 0,
        monthlyRevenue: parseFloat(formData.monthlyRevenue) || 0,
      };

      const result = await closeDeal(deal.id, data);
      onConvert(result.companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-lg w-full mx-4 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Deal Closed! 🎉
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Convert to portfolio company?
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleConvert} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Deal info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">
              {deal.companyName}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500 dark:text-slate-400">Sector:</div>
              <div className="text-slate-900 dark:text-white">
                {deal.sector}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Amount:</div>
              <div className="text-slate-900 dark:text-white">
                {deal.requestedAmount}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Round:</div>
              <div className="text-slate-900 dark:text-white">
                {deal.roundStage}
              </div>
            </div>
          </div>

          {/* Additional fields for portfolio */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Portfolio Details (optional)
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Wallet className="h-4 w-4" />
                  Cash Remaining ($)
                </label>
                <Input
                  type="number"
                  name="cashRemaining"
                  value={formData.cashRemaining}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <TrendingDown className="h-4 w-4" />
                  Monthly Burn Rate ($)
                </label>
                <Input
                  type="number"
                  name="monthlyBurnRate"
                  value={formData.monthlyBurnRate}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Revenue ($)
                </label>
                <Input
                  type="number"
                  name="monthlyRevenue"
                  value={formData.monthlyRevenue}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip (Just Close)
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
            >
              Create Portfolio Company
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
