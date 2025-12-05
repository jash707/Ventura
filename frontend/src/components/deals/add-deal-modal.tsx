"use client";

import { useState } from "react";
import { Deal, DealStage } from "@/lib/types";
import { X } from "lucide-react";

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: (deal: Deal) => void;
}

export function AddDealModal({
  isOpen,
  onClose,
  onDealCreated,
}: AddDealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    sector: "",
    requestedAmount: "",
    valuation: "",
    roundStage: "Seed",
    teamScore: 5,
    productScore: 5,
    marketScore: 5,
    tractionScore: 5,
    founderName: "",
    founderEmail: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.sector.trim()) {
      newErrors.sector = "Sector is required";
    }

    if (
      !formData.requestedAmount ||
      parseFloat(formData.requestedAmount) <= 0
    ) {
      newErrors.requestedAmount = "Valid requested amount is required";
    }

    if (!formData.valuation || parseFloat(formData.valuation) <= 0) {
      newErrors.valuation = "Valid valuation is required";
    }

    if (!formData.founderEmail.trim()) {
      newErrors.founderEmail = "Founder email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.founderEmail)) {
      newErrors.founderEmail = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          CompanyName: formData.companyName,
          Sector: formData.sector,
          Stage: "incoming" as DealStage,
          RequestedAmount: parseFloat(formData.requestedAmount),
          Valuation: parseFloat(formData.valuation),
          RoundStage: formData.roundStage,
          TeamScore: parseInt(String(formData.teamScore)),
          ProductScore: parseInt(String(formData.productScore)),
          MarketScore: parseInt(String(formData.marketScore)),
          TractionScore: parseInt(String(formData.tractionScore)),
          FounderName: formData.founderName,
          FounderEmail: formData.founderEmail,
          Notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create deal");
      }

      const backendDeal = await response.json();

      // Transform backend response to frontend format
      const newDeal: Deal = {
        id: backendDeal.ID,
        companyName: backendDeal.CompanyName,
        sector: backendDeal.Sector,
        stage: backendDeal.Stage,
        requestedAmount: backendDeal.RequestedAmount,
        valuation: backendDeal.Valuation,
        roundStage: backendDeal.RoundStage,
        teamScore: backendDeal.TeamScore,
        productScore: backendDeal.ProductScore,
        marketScore: backendDeal.MarketScore,
        tractionScore: backendDeal.TractionScore,
        totalScore: backendDeal.TotalScore,
        founderName: backendDeal.FounderName,
        founderEmail: backendDeal.FounderEmail,
        notes: backendDeal.Notes,
        createdAt: backendDeal.CreatedAt,
        updatedAt: backendDeal.UpdatedAt,
      };

      onDealCreated(newDeal);

      // Reset form
      setFormData({
        companyName: "",
        sector: "",
        requestedAmount: "",
        valuation: "",
        roundStage: "Seed",
        teamScore: 5,
        productScore: 5,
        marketScore: 5,
        tractionScore: 5,
        founderName: "",
        founderEmail: "",
        notes: "",
      });
      setErrors({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Add New Deal
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Company Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.companyName && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sector *
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="e.g., AI/ML, FinTech, SaaS"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.sector && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.sector}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Deal Details
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Requested Amount ($) *
                </label>
                <input
                  type="number"
                  name="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.requestedAmount && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.requestedAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Valuation ($) *
                </label>
                <input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.valuation && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.valuation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Round Stage
                </label>
                <select
                  name="roundStage"
                  value={formData.roundStage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Series D+">Series D+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Evaluation Scores (1-10)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "teamScore", label: "Team Score" },
                { name: "productScore", label: "Product Score" },
                { name: "marketScore", label: "Market Score" },
                { name: "tractionScore", label: "Traction Score" },
              ].map((score) => (
                <div key={score.name}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {score.label}
                  </label>
                  <input
                    type="range"
                    name={score.name}
                    value={formData[score.name as keyof typeof formData]}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>1</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formData[score.name as keyof typeof formData]}
                    </span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Founder Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Founder Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Founder Name
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Founder Email *
                </label>
                <input
                  type="email"
                  name="founderEmail"
                  value={formData.founderEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.founderEmail && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {errors.founderEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about this deal..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
