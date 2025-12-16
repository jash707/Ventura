"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchCompanyById,
  updateCompany,
  deleteCompany,
  fetchFoundersByCompany,
  toggleCompanyNotifications,
} from "@/lib/api";
import { PortfolioCompany, CreateCompanyData, Founder } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyFormModal } from "@/components/portfolio/company-form-modal";
import { DeleteConfirmDialog } from "@/components/portfolio/delete-confirm-dialog";
import { FoundersSection } from "@/components/portfolio/founders-section";
import UpdatesSection from "@/components/portfolio/updates-section";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  Edit,
  Trash2,
  Bell,
  BellOff,
} from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [company, setCompany] = useState<PortfolioCompany | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notificationsToggling, setNotificationsToggling] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const companyId = params.id as string;

  const loadCompany = useCallback(async () => {
    try {
      setLoading(true);
      const [companyData, foundersData] = await Promise.all([
        fetchCompanyById(companyId),
        fetchFoundersByCompany(parseInt(companyId)),
      ]);
      setCompany(companyData);
      setFounders(foundersData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load company details"
      );
      console.error("Company detail error:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadFounders = useCallback(async () => {
    try {
      const foundersData = await fetchFoundersByCompany(parseInt(companyId));
      setFounders(foundersData);
    } catch (err) {
      console.error("Failed to reload founders:", err);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleEditSubmit = async (data: CreateCompanyData) => {
    if (!company) return;
    await updateCompany(company.id, data);
    showToast("Company updated successfully!", "success");
    await loadCompany();
  };

  const handleDeleteConfirm = async () => {
    if (!company) return;

    try {
      setDeleteLoading(true);
      await deleteCompany(company.id);
      showToast("Company deleted successfully!", "success");
      router.push("/portfolio");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete company",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getHealthBadge = (status: string) => {
    const styles = {
      green:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      yellow:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };

    const labels = {
      green: "Healthy",
      yellow: "Watch",
      red: "Critical",
    };

    return {
      className: styles[status as keyof typeof styles] || styles.green,
      label: labels[status as keyof typeof labels] || status,
    };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/portfolio")}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Portfolio
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                    Logged in as
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                    {user?.email}
                  </p>
                </div>
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-600 dark:text-slate-400 text-lg transition-colors">
                Loading company details...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 transition-colors">
              <p className="text-red-700 dark:text-red-400 transition-colors">
                ⚠️ {error}
              </p>
              <button
                onClick={() => router.push("/portfolio")}
                className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Go back to portfolio
              </button>
            </div>
          )}

          {/* Company Details */}
          {company && !loading && (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
                        {company.name}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {company.sector}
                        {company.roundStage && ` • ${company.roundStage}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getHealthBadge(company.healthStatus).className}
                      variant="outline"
                    >
                      {getHealthBadge(company.healthStatus).label}
                    </Badge>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        company.updatesNotificationsEnabled !== false
                          ? "hover:bg-slate-100 dark:hover:bg-slate-800"
                          : "bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      }`}
                      onClick={async () => {
                        try {
                          setNotificationsToggling(true);
                          const newValue =
                            company.updatesNotificationsEnabled === false;
                          await toggleCompanyNotifications(
                            company.id,
                            newValue
                          );
                          setCompany({
                            ...company,
                            updatesNotificationsEnabled: newValue,
                          });
                          showToast(
                            newValue
                              ? "Notifications enabled"
                              : "Notifications disabled",
                            "success"
                          );
                        } catch (err) {
                          showToast("Failed to toggle notifications", "error");
                        } finally {
                          setNotificationsToggling(false);
                        }
                      }}
                      disabled={notificationsToggling}
                      title={
                        company.updatesNotificationsEnabled !== false
                          ? "Disable update notifications"
                          : "Enable update notifications"
                      }
                    >
                      {company.updatesNotificationsEnabled !== false ? (
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <BellOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      onClick={() => setIsEditModalOpen(true)}
                      title="Edit company"
                    >
                      <Edit className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      title="Delete company"
                    >
                      <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investment Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Investment Overview
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Amount Invested
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(company.amountInvested)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Current Valuation
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(company.currentValuation)}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Return
                        </span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {(
                              ((company.currentValuation -
                                company.amountInvested) /
                                company.amountInvested) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    Financial Metrics
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Cash Remaining
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(company.cashRemaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Monthly Revenue
                        </p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(company.monthlyRevenue || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Monthly Burn Rate
                        </p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(company.monthlyBurnRate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Net Burn (Burn - Revenue)
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            company.monthlyBurnRate -
                              (company.monthlyRevenue || 0) >
                            0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatCurrency(
                            Math.max(
                              0,
                              company.monthlyBurnRate -
                                (company.monthlyRevenue || 0)
                            )
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Runway (Gross)
                        </span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          {company.runwayMonths} months
                        </span>
                      </div>
                      {company.monthlyRevenue > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Runway (Adjusted for Revenue)
                          </span>
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {company.monthlyBurnRate > company.monthlyRevenue
                              ? Math.floor(
                                  company.cashRemaining /
                                    (company.monthlyBurnRate -
                                      company.monthlyRevenue)
                                )
                              : "∞"}{" "}
                            months
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Founders Section */}
              <FoundersSection
                companyId={company.id}
                founders={founders}
                onFoundersChange={loadFounders}
              />

              {/* Monthly Updates Section */}
              <UpdatesSection companyId={company.id} />
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {company && (
          <CompanyFormModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            initialData={company}
            mode="edit"
          />
        )}

        {/* Delete Confirmation Dialog */}
        {company && (
          <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
            companyName={company.name}
            loading={deleteLoading}
          />
        )}

        {/* Footer */}
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
