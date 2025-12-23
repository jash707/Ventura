"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserList } from "@/components/admin/user-list";
import { AuditLogView } from "@/components/admin/audit-log";
import { InviteModal } from "@/components/admin/invite-modal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLayout } from "@/components/ui/page-layout";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type TabType = "users" | "audit";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <PageLayout>
      {/* Header */}
      <header className="bg-white/50 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
                Team Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="primary"
                onClick={() => setShowInviteModal(true)}
                className="gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Invite User
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-lg w-fit transition-colors">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Activity Log
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "users" && <UserList key={refreshKey} />}
          {activeTab === "audit" && <AuditLogView />}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </PageLayout>
  );
}
