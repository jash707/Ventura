"use client";

import { Sidebar } from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <Sidebar />
        <main className="pl-64">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
