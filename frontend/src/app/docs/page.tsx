import Link from "next/link";
import { Footer } from "@/components/Footer";
import { BookOpen, Code, FileText, Zap } from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      title: "Getting Started",
      description:
        "Learn the basics of Ventura and how to navigate the platform.",
      icon: Zap,
      articles: [
        "Introduction to Ventura",
        "Setting Up Your Account",
        "Dashboard Overview",
      ],
    },
    {
      title: "Portfolio Management",
      description: "Master portfolio tracking and company management features.",
      icon: BookOpen,
      articles: [
        "Adding Companies",
        "Tracking Investments",
        "Performance Metrics",
      ],
    },
    {
      title: "Deal Flow",
      description:
        "Understand how to manage and track deals through the pipeline.",
      icon: FileText,
      articles: ["Deal Stages", "Kanban Board", "Deal Scoring"],
    },
    {
      title: "Advanced Features",
      description: "Explore advanced analytics and reporting capabilities.",
      icon: Code,
      articles: ["Custom Reports", "Data Export", "Team Collaboration"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-indigo-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Everything you need to know about using Ventura to manage your
            venture capital portfolio.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <section.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.articles.map((article) => (
                  <li key={article}>
                    <Link
                      href="#"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                      {article}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
