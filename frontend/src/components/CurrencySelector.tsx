"use client";

import {
  useCurrency,
  SUPPORTED_CURRENCIES,
  CURRENCY_INFO,
  CurrencyCode,
} from "@/contexts/CurrencyContext";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function CurrencySelector() {
  const { currency, setCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-2 text-sm text-slate-400">
        <span className="animate-pulse">...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-sm font-medium"
      >
        <span className="text-base">{CURRENCY_INFO[currency].symbol}</span>
        <span>{currency}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {SUPPORTED_CURRENCIES.map((code) => (
            <button
              key={code}
              onClick={() => {
                setCurrency(code as CurrencyCode);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                currency === code
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <span className="text-lg w-6">
                {CURRENCY_INFO[code as CurrencyCode].symbol}
              </span>
              <div>
                <div className="font-medium">{code}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {CURRENCY_INFO[code as CurrencyCode].name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
