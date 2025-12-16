"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MissingUpdateInfo } from "@/lib/types";
import { fetchMissingUpdates, toggleCompanyNotifications } from "@/lib/api";
import { AlertTriangle, X, BellOff, ExternalLink } from "lucide-react";

export default function MissingUpdatesAlert() {
  const [companies, setCompanies] = useState<MissingUpdateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<number | null>(null);

  useEffect(() => {
    loadMissingUpdates();
  }, []);

  const loadMissingUpdates = async () => {
    try {
      const data = await fetchMissingUpdates();
      setCompanies(data || []);
    } catch (err) {
      console.error("Failed to load missing updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (companyId: number) => {
    try {
      setDismissing(companyId);
      await toggleCompanyNotifications(companyId, false);
      // Remove from list
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (err) {
      console.error("Failed to dismiss:", err);
    } finally {
      setDismissing(null);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (companies.length === 0) {
    return null; // No missing updates
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Missing Monthly Updates
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
            The following companies haven&apos;t submitted their update for last
            month:
          </p>
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-3">
                  <Link
                    href={`/portfolio/${company.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1"
                  >
                    {company.name}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {company.sector}
                  </span>
                  {company.daysSinceUpdate === -1 ? (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Never submitted
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {company.daysSinceUpdate} days since last update
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDismiss(company.id)}
                  disabled={dismissing === company.id}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
                  title="Disable notifications for this company"
                >
                  {dismissing === company.id ? (
                    "..."
                  ) : (
                    <>
                      <BellOff className="h-3.5 w-3.5" />
                      Dismiss
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setCompanies([])}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          title="Dismiss all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
