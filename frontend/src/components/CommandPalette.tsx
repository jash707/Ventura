"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Handshake, Users, FileText, X } from "lucide-react";

// Search result types from backend
interface SearchResult {
  id: number;
  type: string;
  name: string;
  description: string;
  url: string;
}

interface SearchResponse {
  companies: SearchResult[];
  deals: SearchResult[];
  users: SearchResult[];
  pages: SearchResult[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Flatten results for keyboard navigation
  const allResults = results
    ? [
        ...(results.pages || []).map((r) => ({ ...r, category: "Pages" })),
        ...(results.companies || []).map((r) => ({
          ...r,
          category: "Companies",
        })),
        ...(results.deals || []).map((r) => ({ ...r, category: "Deals" })),
        ...(results.users || []).map((r) => ({ ...r, category: "Users" })),
      ]
    : [];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search API call with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(
          `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch {
        console.error("Search error");
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        router.push(allResults[selectedIndex].url);
        onClose();
      }
    },
    [allResults, selectedIndex, onClose, router]
  );

  // Get icon for result type
  const getIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 className="w-4 h-4" />;
      case "deal":
        return <Handshake className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      case "page":
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search companies, deals, users, or pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-slate-500">
                Searching...
              </div>
            )}

            {!loading && allResults.length === 0 && query && (
              <div className="px-4 py-8 text-center text-slate-500">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {!loading && allResults.length > 0 && (
              <div className="py-2">
                {/* Group results by category */}
                {["Pages", "Companies", "Deals", "Users"].map((category) => {
                  const categoryResults = allResults.filter(
                    (r) => r.category === category
                  );
                  if (categoryResults.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {category}
                      </div>
                      {categoryResults.map((result) => {
                        const globalIndex = allResults.indexOf(result);
                        return (
                          <button
                            key={`${result.type}-${result.id || result.name}`}
                            onClick={() => {
                              router.push(result.url);
                              onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className={`shrink-0 ${
                                globalIndex === selectedIndex
                                  ? "text-blue-500"
                                  : "text-slate-400"
                              }`}
                            >
                              {getIcon(result.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {result.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {result.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  esc
                </kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to handle Cmd+K / Ctrl+K shortcut
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
