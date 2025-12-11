"use client";

import { Card } from "@/components/ui/card";
import { InvestmentEvent } from "@/lib/api";
import { Calendar, DollarSign, Building2 } from "lucide-react";

interface InvestmentTimelineProps {
  data: InvestmentEvent[];
}

const SECTOR_COLORS: Record<string, string> = {
  SaaS: "#3b82f6",
  Fintech: "#8b5cf6",
  AI: "#ec4899",
  BioTech: "#10b981",
  Healthcare: "#06b6d4",
  "E-commerce": "#f59e0b",
  CleanTech: "#22c55e",
};

export function InvestmentTimeline({ data }: InvestmentTimelineProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(parseFloat(value));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getYear = (dateStr: string) => {
    return new Date(dateStr).getFullYear();
  };

  // Group events by year
  const eventsByYear: Record<string, InvestmentEvent[]> = {};
  data.forEach((event) => {
    const year = getYear(event.date).toString();
    if (!eventsByYear[year]) {
      eventsByYear[year] = [];
    }
    eventsByYear[year].push(event);
  });

  const years = Object.keys(eventsByYear).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Investment Timeline
        </h3>
        <div className="text-sm text-muted-foreground">
          {data.length} investments
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {years.map((year) => (
          <div key={year}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-card-foreground">{year}</span>
              <span className="text-xs text-muted-foreground">
                ({eventsByYear[year].length} deals)
              </span>
            </div>

            <div className="space-y-3 ml-6 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
              {eventsByYear[year].map((event, index) => (
                <div
                  key={`${event.companyName}-${index}`}
                  className="relative flex items-start gap-3"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[21px] top-2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900"
                    style={{
                      backgroundColor: SECTOR_COLORS[event.sector] || "#64748b",
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-card-foreground truncate">
                        {event.companyName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${
                            SECTOR_COLORS[event.sector] || "#64748b"
                          }20`,
                          color: SECTOR_COLORS[event.sector] || "#64748b",
                        }}
                      >
                        {event.sector}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(event.amount)}
                      </span>
                      {event.roundStage && (
                        <span className="text-muted-foreground">
                          {event.roundStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No investments yet
          </div>
        )}
      </div>
    </Card>
  );
}
