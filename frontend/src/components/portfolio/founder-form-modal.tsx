"use client";

import { useState, useEffect } from "react";
import { CreateFounderData, Founder } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FounderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFounderData) => Promise<void>;
  initialData?: Founder | null;
  mode: "create" | "edit";
}

const ROLE_OPTIONS = ["CEO", "CTO", "COO", "CFO", "CPO", "CMO", "Other"];

export function FounderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: FounderFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CEO");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setLinkedInUrl(initialData.linkedInUrl || "");
    } else {
      setName("");
      setEmail("");
      setRole("CEO");
      setLinkedInUrl("");
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        name,
        email,
        role,
        linkedInUrl: linkedInUrl || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save founder");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === "create" ? "Add Founder" : "Edit Founder"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@company.com"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              LinkedIn URL
            </label>
            <Input
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="flex-1"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Add Founder"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
