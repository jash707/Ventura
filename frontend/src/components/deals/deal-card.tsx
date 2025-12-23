"use client";

import { Deal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, DollarSign, Star } from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
  };

  const maxScore = 10;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card-base p-4 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      {/* Company Name */}
      <div className="flex items-start gap-2 mb-3">
        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {deal.companyName}
          </h3>
          <Badge
            variant="outline"
            className="mt-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
          >
            {deal.sector}
          </Badge>
        </div>
      </div>

      {/*  Requested Amount */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-white">
          {formatCurrency(deal.requestedAmount)}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {deal.roundStage}
        </span>
      </div>

      {/* Total Score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <Star className="h-3 w-3" />
          <span>Score</span>
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {deal.totalScore}/40
        </span>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-1.5">
        {[
          { label: "Team", score: deal.teamScore },
          { label: "Product", score: deal.productScore },
          { label: "Market", score: deal.marketScore },
          { label: "Traction", score: deal.tractionScore },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 w-16">
              {item.label}
            </span>
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getScoreColor(item.score)} transition-all`}
                style={{ width: `${(item.score / maxScore) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-4">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
