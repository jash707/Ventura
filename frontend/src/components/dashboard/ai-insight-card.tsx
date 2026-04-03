"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchAIInsight } from "@/lib/api";
import { Sparkles, RefreshCw } from "lucide-react";

export function AIInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsight = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAIInsight();
      setInsight(data.insight);
    } catch (err) {
      setError("Unable to load AI insight.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsight();
  }, []);

  return (
    <Card className="relative overflow-hidden border-violet-200 dark:border-violet-800/50 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/40 dark:via-slate-900 dark:to-fuchsia-950/30">
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-400/10 dark:bg-violet-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-fuchsia-400/10 dark:bg-fuchsia-400/5 rounded-full blur-2xl pointer-events-none" />

      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">
                AI Portfolio Insights
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 font-medium">
                Powered by Gemini
              </p>
            </div>
          </div>
          <button
            onClick={loadInsight}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all disabled:opacity-50"
            title="Refresh insight"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-3 bg-violet-200/50 dark:bg-violet-800/30 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-violet-200/50 dark:bg-violet-800/30 rounded-full animate-pulse w-5/6" />
            <div className="h-3 bg-violet-200/50 dark:bg-violet-800/30 rounded-full animate-pulse w-4/6" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {insight}
          </p>
        )}
      </div>
    </Card>
  );
}
