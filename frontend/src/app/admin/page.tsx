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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Users, Activity } from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="gap-2 pl-0 hover:bg-transparent dark:hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
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
                <Plus className="h-4 w-4" />
                Invite User
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="users">
              <UserList key={refreshKey} />
            </TabsContent>
            <TabsContent value="audit">
              <AuditLogView />
            </TabsContent>
          </div>
        </Tabs>
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
