"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Tagline */}
          <div className="md:col-span-1">
            <p className="text-xl font-medium text-slate-900 dark:text-white mb-6">
              Experience growth
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@ventura.com"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
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
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Analytics
                </Link>
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
                <Link
                  href="/docs"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/api-reference"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Support
                </Link>
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
                <Link
                  href="/about"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </Link>
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
              <Link
                href="/about"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                About Ventura
              </Link>
              <Link
                href="/portfolio"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Portfolio Companies
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
