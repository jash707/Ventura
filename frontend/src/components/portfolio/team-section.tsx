"use client";

import { useState, useEffect, useCallback } from "react";
import { TeamMember, TeamRole, UserWithDetails } from "@/lib/types";
import {
  fetchCompanyTeam,
  addTeamMember,
  removeTeamMember,
  fetchUsers,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface TeamSectionProps {
  companyId: number;
  companyName: string;
}

export function TeamSection({ companyId, companyName }: TeamSectionProps) {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>("analyst");
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyTeam(companyId);
      setTeam(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      // Filter out users already in the team
      const teamUserIds = team.map((m) => m.userId);
      setUsers(data.filter((u) => !teamUserIds.includes(u.id)));
    } catch {
      // Admin-only endpoint, ignore error for non-admins
      setUsers([]);
    }
  };

  const handleOpenAddModal = async () => {
    await loadUsers();
    setShowAddModal(true);
    setSelectedUserId(null);
    setSelectedRole("analyst");
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setAddingMember(true);
    try {
      await addTeamMember(companyId, {
        userId: selectedUserId,
        role: selectedRole,
      });
      setShowAddModal(false);
      loadTeam();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add team member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName} from the team?`)) return;
    try {
      await removeTeamMember(companyId, userId);
      loadTeam();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to remove team member"
      );
    }
  };

  const getRoleBadgeClass = (role: TeamRole) => {
    switch (role) {
      case "lead":
        return "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300";
      case "analyst":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      case "observer":
        return "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300";
      default:
        return "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl border border-slate-200 dark:border-gray-800 p-6 transition-colors">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl border border-slate-200 dark:border-gray-800 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-500 dark:text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Team Members
        </h3>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-600/20 hover:bg-indigo-200 dark:hover:bg-indigo-600/40 text-indigo-600 dark:text-indigo-400 text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {team.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto mb-2 text-slate-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          No team members assigned
        </div>
      ) : (
        <div className="space-y-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-slate-100 dark:bg-gray-800/50 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {member.userName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-medium">
                    {member.userName}
                  </div>
                  <div className="text-slate-500 dark:text-gray-400 text-sm">
                    {member.userEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                    member.role
                  )}`}
                >
                  {member.role}
                </span>
                {isAdmin && (
                  <button
                    onClick={() =>
                      handleRemoveMember(member.userId, member.userName)
                    }
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Add Team Member to {companyName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) =>
                    setSelectedUserId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                >
                  <option value="lead">Lead</option>
                  <option value="analyst">Analyst</option>
                  <option value="observer">Observer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || addingMember}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {addingMember ? "Adding..." : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
