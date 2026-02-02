"use client";

import { useEffect, useCallback, useState, DependencyList } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * A hook that runs an effect only after authentication is confirmed.
 * Prevents API calls from firing before the user is logged in.
 *
 * @param effect - The effect function to run (can be async)
 * @param deps - Dependency array (same as useEffect)
 */
export function useAuthenticatedEffect(
  effect: () => void | (() => void) | Promise<void>,
  deps: DependencyList = [],
) {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for authentication to complete
    if (loading || !user) return;

    const cleanup = effect();

    // Handle cleanup if effect returns a cleanup function
    if (typeof cleanup === "function") {
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, ...deps]);
}

/**
 * A hook for authenticated data fetching with built-in loading and error states.
 * Only fetches data after authentication is confirmed.
 *
 * @param fetchFn - Async function that fetches data
 * @param deps - Dependency array for re-fetching
 * @returns Object with data, loading, error states and refetch function
 */
export function useAuthenticatedQuery<T>(
  fetchFn: () => Promise<T>,
  deps: DependencyList = [],
) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (authLoading || !user) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Query error:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading: authLoading || loading,
    error,
    refetch,
    isAuthenticated: !!user,
  };
}
