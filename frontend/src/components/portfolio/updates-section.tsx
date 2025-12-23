"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MonthlyUpdate, CreateMonthlyUpdateData } from "@/lib/types";
import {
  fetchMonthlyUpdatesByCompany,
  createMonthlyUpdate,
  deleteMonthlyUpdate,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface UpdatesSectionProps {
  companyId: number;
}

export default function UpdatesSection({ companyId }: UpdatesSectionProps) {
  const [updates, setUpdates] = useState<MonthlyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get the last completed month (previous month)
  const getLastCompletedMonth = useCallback(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  // Max month that can be selected (last completed month)
  const maxSelectableMonth = useMemo(
    () => getLastCompletedMonth(),
    [getLastCompletedMonth]
  );

  // Form state - default to last completed month
  const [formData, setFormData] = useState<CreateMonthlyUpdateData>({
    mrr: 0,
    arr: 0,
    cashInBank: 0,
    burnRate: 0,
    newCustomers: 0,
    churnRate: 0,
    reportMonth: getLastCompletedMonth() + "-01T00:00:00Z",
    notes: "",
  });

  const loadUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMonthlyUpdatesByCompany(companyId);
      setUpdates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load updates");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation: check if the selected month is not in the future
    const selectedMonth = formData.reportMonth.slice(0, 7);
    if (selectedMonth > maxSelectableMonth) {
      setError(
        "Cannot submit update for current or future month. Please select a completed month."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createMonthlyUpdate(companyId, formData);
      setShowForm(false);
      setFormData({
        mrr: 0,
        arr: 0,
        cashInBank: 0,
        burnRate: 0,
        newCustomers: 0,
        churnRate: 0,
        reportMonth: getLastCompletedMonth() + "-01T00:00:00Z",
        notes: "",
      });
      await loadUpdates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this update?")) return;
    try {
      await deleteMonthlyUpdate(id);
      await loadUpdates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete update");
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Monthly Updates
          </h2>
        </div>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Loading updates...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Monthly Updates
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Add Update"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Update Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Report Month
              </label>
              <Input
                type="month"
                value={formData.reportMonth.slice(0, 7)}
                max={maxSelectableMonth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reportMonth: e.target.value + "-01T00:00:00Z",
                  })
                }
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Only completed months can be submitted
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                MRR ($)
              </label>
              <Input
                type="number"
                value={formData.mrr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mrr: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                ARR ($)
              </label>
              <Input
                type="number"
                value={formData.arr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    arr: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Cash in Bank ($)
              </label>
              <Input
                type="number"
                value={formData.cashInBank}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cashInBank: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Burn Rate ($)
              </label>
              <Input
                type="number"
                value={formData.burnRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    burnRate: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                New Customers
              </label>
              <Input
                type="number"
                value={formData.newCustomers || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newCustomers: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Churn Rate (%)
              </label>
              <Input
                type="number"
                value={formData.churnRate || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    churnRate: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              placeholder="Any highlights or notes for this month..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
            >
              {submitting ? "Submitting..." : "Submit Update"}
            </Button>
          </div>
        </form>
      )}

      {/* Updates List */}
      {updates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No monthly updates yet
          </p>
          <Button
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="mt-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Submit the first monthly report
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div
              key={update.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(update.reportMonth)}
                  </span>
                  {index === 0 && (
                    <Badge
                      className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-transparent hover:bg-emerald-100 hover:text-emerald-700"
                      variant="outline"
                    >
                      Latest
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(update.id)}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Delete update"
                >
                  <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    MRR
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(update.mrr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    ARR
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(update.arr)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Cash
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(update.cashInBank)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Burn Rate
                  </p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(update.burnRate)}/mo
                  </p>
                </div>
                {update.newCustomers > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      New Customers
                    </p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />+
                      {update.newCustomers}
                    </p>
                  </div>
                )}
                {parseFloat(update.churnRate) > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Churn
                    </p>
                    <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {update.churnRate}%
                    </p>
                  </div>
                )}
              </div>

              {update.notes && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {update.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
