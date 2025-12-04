"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Use lazy initialization to check if we're on the client
  const [mounted] = useState(() => typeof window !== "undefined");

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />;
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "system", icon: Monitor, label: "System" },
  ];

  const currentTheme = themes.find((t) => t.name === theme) || themes[2];
  const Icon = currentTheme.icon;

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200 border border-slate-300 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600"
        aria-label="Toggle theme"
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.label}</span>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {themes.map((t) => {
            const ThemeIcon = t.icon;
            return (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  theme === t.name
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ThemeIcon className="w-4 h-4" />
                <span>{t.label}</span>
                {theme === t.name && <span className="ml-auto text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
