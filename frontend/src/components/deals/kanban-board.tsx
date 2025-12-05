"use client";

import { useState, useEffect } from "react";
import { Deal, DealStage } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DealCard } from "./deal-card";

interface KanbanBoardProps {
  deals: Deal[];
  onDealStageChange: (dealId: number, newStage: DealStage) => Promise<void>;
}

const STAGES: { id: DealStage; title: string }[] = [
  { id: "incoming", title: "Incoming" },
  { id: "screening", title: "Screening" },
  { id: "due_diligence", title: "Due Diligence" },
  { id: "term_sheet", title: "Term Sheet" },
  { id: "closed", title: "Closed" },
  { id: "lost", title: "Lost" },
];

export function KanbanBoard({ deals, onDealStageChange }: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [localDeals, setLocalDeals] = useState(deals);

  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts after 8px movement
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = localDeals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveDeal(null);
      return;
    }

    const dealId = active.id as number;
    const newStage = over.id as DealStage;

    const deal = localDeals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) {
      setActiveDeal(null);
      return;
    }

    // Optimistic update
    setLocalDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    try {
      await onDealStageChange(dealId, newStage);
    } catch (error) {
      // Revert on error
      setLocalDeals(deals);
      console.error("Failed to update deal stage:", error);
    }

    setActiveDeal(null);
  };

  const getDealsByStage = (stage: DealStage) => {
    return localDeals.filter((deal) => {
      return deal.stage === stage;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              title={stage.title}
              stage={stage.id}
              deals={stageDeals}
              count={stageDeals.length}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 scale-105">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
