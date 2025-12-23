"use client";

import { useState, useEffect, useCallback } from "react";
import { AuditLog } from "@/lib/types";
import { fetchAuditLogs } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const limit = 25;

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs(page, limit, {
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
      });
      setLogs(data.logs || []);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      case "update":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      case "delete":
        return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      case "login":
        return "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300";
      case "logout":
        return "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
      case "invite":
        return "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300";
      default:
        return "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "user":
        return "👤";
      case "company":
        return "🏢";
      case "deal":
        return "💼";
      case "founder":
        return "👥";
      case "team_assignment":
        return "🤝";
      default:
        return "📋";
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select
          value={entityFilter}
          onValueChange={(value) => {
            setEntityFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
            <SelectItem value="deal">Deals</SelectItem>
            <SelectItem value="founder">Founders</SelectItem>
            <SelectItem value="team_assignment">Team Assignments</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="invite">Invite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 transition-colors">
          {error}
        </div>
      )}

      {/* Audit Log List */}
      {!loading && !error && (
        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-6 py-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">
                      {getEntityIcon(log.entity)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 dark:text-white font-medium">
                          {log.userName || log.userEmail}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {log.entity.replace("_", " ")}
                        </span>
                        {log.entityId > 0 && (
                          <span className="text-slate-500">
                            #{log.entityId}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500 shrink-0">
                    <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    {log.ipAddress && (
                      <div className="text-xs text-slate-400 dark:text-slate-600">
                        {log.ipAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No activity logs found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
            of {total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-white rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
