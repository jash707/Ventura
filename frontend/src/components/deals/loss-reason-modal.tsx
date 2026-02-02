"use client";

import { useState } from "react";
import { Deal, LossReason } from "@/lib/types";
import { loseDeal } from "@/lib/api";
import { X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LossReasonModalProps {
  isOpen: boolean;
  deal: Deal | null;
  onClose: () => void;
  onLose: () => void;
}

const LOSS_REASONS: { value: LossReason; label: string }[] = [
  { value: "passed", label: "Passed on Opportunity" },
  { value: "valuation_too_high", label: "Valuation Too High" },
  { value: "competitor_won", label: "Competitor Won" },
  { value: "founder_declined", label: "Founder Declined" },
  { value: "deal_fell_through", label: "Deal Fell Through" },
  { value: "other", label: "Other" },
];

export function LossReasonModal({
  isOpen,
  deal,
  onClose,
  onLose,
}: LossReasonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<LossReason | null>(null);

  if (!isOpen || !deal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setError("Please select a reason");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await loseDeal(deal.id, selectedReason);
      onLose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Deal Lost
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Why didn&apos;t this deal work out?
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Deal info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-white">
              {deal.companyName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {deal.sector} • {deal.roundStage}
            </p>
          </div>

          {/* Reason selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Select reason *
            </label>
            <div className="space-y-2">
              {LOSS_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedReason === reason.value
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selectedReason === reason.value && (
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={!selectedReason}
            >
              Archive Deal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
