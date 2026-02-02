"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import {
  updateProfile,
  changePassword,
  fetchOrganization,
  createInviteCode,
  fetchInviteCodes,
  Organization,
  InviteCode,
} from "@/lib/api";
import { User, Building2, Key, Copy, Check, Plus, Clock } from "lucide-react";
import { useAuthenticatedEffect } from "@/hooks/useAuthenticatedQuery";

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useAuthenticatedEffect(() => {
    async function loadData() {
      try {
        const [org, codes] = await Promise.all([
          fetchOrganization(),
          fetchInviteCodes(),
        ]);
        setOrganization(org);
        setInviteCodes(codes || []);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    }
    loadData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setProfileLoading(true);

    try {
      await updateProfile({ name });
      setProfileMessage("Profile updated successfully!");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    setInviteMessage("");
    setInviteError("");
    setInviteLoading(true);

    try {
      const newCode = await createInviteCode();
      setInviteCodes([
        {
          ...newCode,
          id: Date.now(),
          organizationId: organization?.id || 0,
          createdById: user?.id || 0,
          createdAt: new Date().toISOString(),
        } as InviteCode,
        ...inviteCodes,
      ]);
      setInviteMessage("Invite code created!");
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to create invite code",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
                  Profile Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 transition-colors">
                  Manage your account and organization
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Organization Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Organization
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your current organization
              </p>
            </div>
          </div>

          {organization && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {organization.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Slug: {organization.slug}
              </p>
            </div>
          )}
        </div>

        {/* Profile Update Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your personal details
              </p>
            </div>
          </div>

          {profileMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-green-700 dark:text-green-400 text-sm">
                ✓ {profileMessage}
              </p>
            </div>
          )}

          {profileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">
                ⚠️ {profileError}
              </p>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {profileLoading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your account password
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-green-700 dark:text-green-400 text-sm">
                ✓ {passwordMessage}
              </p>
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">
                ⚠️ {passwordError}
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Invite Codes Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Copy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Invite Codes
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Invite others to join your organization
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateInvite}
              disabled={inviteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {inviteLoading ? "Creating..." : "New Invite"}
            </button>
          </div>

          {inviteMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-green-700 dark:text-green-400 text-sm">
                ✓ {inviteMessage}
              </p>
            </div>
          )}

          {inviteError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">
                ⚠️ {inviteError}
              </p>
            </div>
          )}

          {inviteCodes.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              No invite codes yet. Create one to invite team members.
            </p>
          ) : (
            <div className="space-y-3">
              {inviteCodes.map((invite) => (
                <div
                  key={invite.code}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    isExpired(invite.expiresAt) || invite.usedById
                      ? "bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div>
                    <code className="font-mono text-sm text-slate-900 dark:text-white">
                      {invite.code}
                    </code>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {isExpired(invite.expiresAt)
                          ? "Expired"
                          : invite.usedById
                            ? "Used"
                            : `Expires ${new Date(
                                invite.expiresAt,
                              ).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  {!isExpired(invite.expiresAt) && !invite.usedById && (
                    <button
                      onClick={() => copyToClipboard(invite.code)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {copiedCode === invite.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </AppLayout>
  );
}
