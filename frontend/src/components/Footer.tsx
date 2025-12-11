"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Tagline */}
          <div className="md:col-span-1">
            <p className="text-xl font-medium text-slate-900 dark:text-white">
              Experience growth
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/deals"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Deals
                </Link>
              </li>
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Analytics
                </span>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Documentation
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  API Reference
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Support
                </span>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  About
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Careers
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Brand Text */}
        <div className="mt-20 mb-12 overflow-hidden">
          <h2 className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold text-slate-900 dark:text-white leading-none tracking-tighter select-none">
            Ventura
          </h2>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              © 2025 Ventura Capital
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                About Ventura
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                Portfolio Companies
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                Privacy
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                Terms
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
