"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, loading: authLoading } = useAuth();

  // Check for invite code in URL
  const inviteCodeParam = searchParams.get("invite");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [inviteCode, setInviteCode] = useState(inviteCodeParam || "");
  const [registrationMode, setRegistrationMode] = useState<"create" | "join">(
    inviteCodeParam ? "join" : "create"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (registrationMode === "create" && !organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (registrationMode === "join" && !inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }

    setLoading(true);

    try {
      await register(
        email,
        password,
        name,
        registrationMode === "create" ? organizationName : undefined,
        registrationMode === "join" ? inviteCode : undefined
      );
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors mb-2">
          Ventura Capital
        </h1>
        <p className="text-slate-600 dark:text-slate-400 transition-colors">
          Investment Dashboard
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 transition-colors rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors mb-6">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 transition-colors rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 transition-colors text-sm">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Registration Mode Toggle */}
        <div className="flex mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setRegistrationMode("create")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              registrationMode === "create"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Create Organization
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMode("join")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              registrationMode === "join"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Join with Invite
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="John Doe"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Organization Name or Invite Code */}
          {registrationMode === "create" ? (
            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
              >
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="My VC Firm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors mt-1">
                You&apos;ll be the admin of this organization
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="inviteCode"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
              >
                Invite Code
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                placeholder="Enter invite code"
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors mt-1">
                Get this from your organization admin
              </p>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors mt-1">
              At least 8 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 mt-6"
          >
            {loading
              ? "Creating account..."
              : registrationMode === "create"
              ? "Create Organization & Account"
              : "Join & Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 transition-colors text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-slate-500 dark:text-slate-500 transition-colors text-sm">
        <p>© 2025 Ventura Capital. All rights reserved.</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors flex items-center justify-center p-4">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
