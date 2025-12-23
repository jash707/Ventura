"use client";

import { Deal, DealStage } from "@/lib/types";
import { DealCard } from "./deal-card";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";

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
          <Badge variant="secondary" className="rounded-full">
            {count}
          </Badge>
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
