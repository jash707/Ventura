"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    inviteCodeParam ? "join" : "create",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        registrationMode === "join" ? inviteCode : undefined,
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

      <Card className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            {/* Organization Name or Invite Code */}
            {registrationMode === "create" ? (
              <div className="space-y-2">
                <label
                  htmlFor="organizationName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Organization Name
                </label>
                <Input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="My VC Firm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">
                  You&apos;ll be the admin of this organization
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="inviteCode"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Invite Code
                </label>
                <Input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  className="font-mono"
                  placeholder="Enter invite code"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">
                  Get this from your organization admin
                </p>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-none mt-6"
            >
              {loading
                ? "Creating account..."
                : registrationMode === "create"
                  ? "Create Organization & Account"
                  : "Join & Create Account"}
            </Button>
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
        </CardContent>
      </Card>

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
