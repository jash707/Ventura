"use client";

import { useState } from "react";
import { Deal, DealStage } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Add New Deal
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
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
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sector *
                </label>
                <Input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="e.g., AI/ML, FinTech, SaaS"
                  error={errors.sector}
                />
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
                <Input
                  type="number"
                  name="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  error={errors.requestedAmount}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Valuation ($) *
                </label>
                <Input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  error={errors.valuation}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Round Stage
                </label>
                <select
                  name="roundStage"
                  value={formData.roundStage}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-400"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                <Input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Founder Email *
                </label>
                <Input
                  type="email"
                  name="founderEmail"
                  value={formData.founderEmail}
                  onChange={handleChange}
                  error={errors.founderEmail}
                />
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
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
