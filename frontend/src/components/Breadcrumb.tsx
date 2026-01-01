"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400">
      <Link
        href="/"
        className="flex items-center hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-slate-300 dark:text-slate-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
