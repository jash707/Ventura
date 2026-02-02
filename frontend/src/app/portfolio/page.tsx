"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchPortfolioCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/lib/api";
import { PortfolioCompany, CreateCompanyData } from "@/lib/types";
import { CompaniesTable } from "@/components/portfolio/companies-table";
import { CompanyFormModal } from "@/components/portfolio/company-form-modal";
import { DeleteConfirmDialog } from "@/components/portfolio/delete-confirm-dialog";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { Plus, Building2 } from "lucide-react";

export default function PortfolioPage() {
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCompany, setSelectedCompany] =
    useState<PortfolioCompany | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] =
    useState<PortfolioCompany | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPortfolioCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load portfolio companies",
      );
      console.error("Portfolio error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleOpenCreateModal = () => {
    setSelectedCompany(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (company: PortfolioCompany) => {
    setSelectedCompany(company);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (company: PortfolioCompany) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateCompanyData) => {
    if (formMode === "create") {
      await createCompany(data);
      showToast("Company created successfully!", "success");
    } else if (selectedCompany) {
      await updateCompany(selectedCompany.id, data);
      showToast("Company updated successfully!", "success");
    }
    await loadCompanies();
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteCompany(companyToDelete.id);
      showToast("Company deleted successfully!", "success");
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete company",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                  Portfolio Companies
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors">
                  View and manage your portfolio
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-slate-600 dark:text-slate-400">
              {companies.length}{" "}
              {companies.length === 1 ? "company" : "companies"} total
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600 dark:text-slate-400 text-lg transition-colors">
              Loading portfolio companies...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-red-700 dark:text-red-400 transition-colors">
              ⚠️ {error}
            </p>
            <p className="text-sm text-red-600 dark:text-slate-400 mt-2 transition-colors">
              Make sure the backend is running on http://localhost:8080
            </p>
          </div>
        )}

        {/* Companies Table */}
        {!loading && !error && (
          <CompaniesTable
            companies={companies}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteDialog}
          />
        )}

        {/* Empty State */}
        {!loading && !error && companies.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
            <Building2 className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No portfolio companies yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Get started by adding your first portfolio company
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-5 w-5" />
              Add Your First Company
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CompanyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCompany}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        companyName={companyToDelete?.name || ""}
        loading={deleteLoading}
      />

      {/* Footer */}
      <Footer />
    </AppLayout>
  );
}
