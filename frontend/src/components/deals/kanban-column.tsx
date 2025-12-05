"use client";

import { Deal, DealStage } from "@/lib/types";
import { DealCard } from "./deal-card";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface KanbanColumnProps {
  title: string;
  stage: DealStage;
  deals: Deal[];
  count: number;
}

export function KanbanColumn({
  title,
  stage,
  deals,
  count,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="min-h-[500px] bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 space-y-3"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              No deals in this stage
            </div>
          ) : (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
