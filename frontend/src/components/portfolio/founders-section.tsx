"use client";

import { useState } from "react";
import { Founder, CreateFounderData } from "@/lib/types";
import { createFounder, updateFounder, deleteFounder } from "@/lib/api";
import { FounderFormModal } from "./founder-form-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit2, Trash2, Linkedin, Mail } from "lucide-react";

interface FoundersSectionProps {
  companyId: number;
  founders: Founder[];
  onFoundersChange: () => void;
}

export function FoundersSection({
  companyId,
  founders,
  onFoundersChange,
}: FoundersSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const handleCreate = async (data: CreateFounderData) => {
    await createFounder(companyId, data);
    onFoundersChange();
  };

  const handleUpdate = async (data: CreateFounderData) => {
    if (!editingFounder) return;
    await updateFounder(editingFounder.id, data);
    onFoundersChange();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this founder?")) return;

    try {
      setDeleteLoading(id);
      await deleteFounder(id);
      onFoundersChange();
    } catch (err) {
      console.error("Failed to delete founder:", err);
      alert(err instanceof Error ? err.message : "Failed to delete founder");
    } finally {
      setDeleteLoading(null);
    }
  };

  const openCreateModal = () => {
    setEditingFounder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (founder: Founder) => {
    setEditingFounder(founder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFounder(null);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      CEO: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      CTO: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      COO: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      CFO: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      CPO: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
      CMO: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
    };
    return (
      colors[role] ||
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
    );
  };

  // ... existing imports

  // ...

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Team & Founders
        </h2>
        <Button
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white border-transparent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Founder
        </Button>
      </div>

      {/* Founders List */}
      {founders.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No founders added yet
          </p>
          <Button
            variant="ghost"
            onClick={openCreateModal}
            className="mt-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Add the first founder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {founders.map((founder) => (
            <div
              key={founder.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {founder.name}
                    </h3>
                    <Badge
                      className={`text-xs ${getRoleBadgeColor(founder.role)}`}
                      variant="outline"
                    >
                      {founder.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <a
                      href={`mailto:${founder.email}`}
                      className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {founder.email}
                    </a>
                    {founder.linkedInUrl && (
                      <a
                        href={founder.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(founder)}
                    className="h-8 w-8 p-0"
                    title="Edit founder"
                  >
                    <Edit2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(founder.id)}
                    disabled={deleteLoading === founder.id}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="Remove founder"
                  >
                    {deleteLoading === founder.id ? (
                      <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <FounderFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingFounder ? handleUpdate : handleCreate}
        initialData={editingFounder}
        mode={editingFounder ? "edit" : "create"}
      />
    </div>
  );
}
