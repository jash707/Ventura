"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Supported currencies - expanded list
export const SUPPORTED_CURRENCIES = [
  "USD",
  "INR",
  "EUR",
  "GBP",
  "AED",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "SGD",
  "CNY",
] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

// Currency display info
export const CURRENCY_INFO: Record<
  CurrencyCode,
  { symbol: string; name: string }
> = {
  USD: { symbol: "$", name: "US Dollar" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  AED: { symbol: "د.إ", name: "UAE Dirham" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  CHF: { symbol: "Fr", name: "Swiss Franc" },
  SGD: { symbol: "S$", name: "Singapore Dollar" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  exchangeRates: Record<string, number>;
  loading: boolean;
  convertAmount: (value: number, fromCurrency?: CurrencyCode) => number;
  formatCurrency: (
    value: number | string,
    fromCurrency?: CurrencyCode
  ) => string;
  formatCompact: (value: number, fromCurrency?: CurrencyCode) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";
const STORAGE_KEY = "ventura_currency_preference";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
  });
  const [loading, setLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_CURRENCIES.includes(saved as CurrencyCode)) {
      setCurrencyState(saved as CurrencyCode);
    }
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch(EXCHANGE_RATE_API);
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        // Fallback rates
        setExchangeRates({
          USD: 1,
          INR: 83.0,
          EUR: 0.92,
          GBP: 0.79,
          AED: 3.67,
          JPY: 151.0,
          CAD: 1.36,
          AUD: 1.55,
          CHF: 0.88,
          SGD: 1.34,
          CNY: 7.24,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const convertAmount = useCallback(
    (value: number, fromCurrency: CurrencyCode = "USD"): number => {
      if (fromCurrency === currency) return value;

      // Convert to USD first, then to target currency
      const usdValue = value / (exchangeRates[fromCurrency] || 1);
      return usdValue * (exchangeRates[currency] || 1);
    },
    [currency, exchangeRates]
  );

  const formatCurrency = useCallback(
    (value: number | string, fromCurrency: CurrencyCode = "USD"): string => {
      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;
      const convertedValue = convertAmount(numValue, fromCurrency);

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedValue);
    },
    [currency, convertAmount]
  );

  // Compact format for chart axes (e.g., "₹10M" instead of "₹10,000,000")
  const formatCompact = useCallback(
    (value: number, fromCurrency: CurrencyCode = "USD"): string => {
      const convertedValue = convertAmount(value, fromCurrency);
      const symbol = CURRENCY_INFO[currency].symbol;

      if (convertedValue >= 1000000000) {
        return `${symbol}${(convertedValue / 1000000000).toFixed(1)}B`;
      }
      if (convertedValue >= 1000000) {
        return `${symbol}${(convertedValue / 1000000).toFixed(0)}M`;
      }
      if (convertedValue >= 1000) {
        return `${symbol}${(convertedValue / 1000).toFixed(0)}K`;
      }
      return `${symbol}${convertedValue.toFixed(0)}`;
    },
    [currency, convertAmount]
  );

  const currencySymbol = CURRENCY_INFO[currency].symbol;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates,
        loading,
        convertAmount,
        formatCurrency,
        formatCompact,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
