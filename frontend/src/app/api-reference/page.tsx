import { Footer } from "@/components/Footer";
import { Lock, Globe, FileJson } from "lucide-react";

export default function ApiReferencePage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/dashboard",
      description: "Retrieve dashboard metrics and overview data",
    },
    {
      method: "GET",
      path: "/api/portfolio",
      description: "List all portfolio companies",
    },
    {
      method: "POST",
      path: "/api/portfolio",
      description: "Add a new portfolio company",
    },
    {
      method: "GET",
      path: "/api/deals",
      description: "List all deals in the pipeline",
    },
    {
      method: "PUT",
      path: "/api/deals/:id",
      description: "Update deal status or details",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            API Reference
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Integrate Ventura with your existing tools using our RESTful API.
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Lock,
              title: "Authentication",
              desc: "Bearer token based auth",
            },
            {
              icon: FileJson,
              title: "JSON Format",
              desc: "All responses in JSON",
            },
            { icon: Globe, title: "Rate Limiting", desc: "1000 requests/hour" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center"
            >
              <item.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Endpoints
        </h2>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {endpoints.map((endpoint, index) => (
            <div
              key={`${endpoint.method}-${endpoint.path}`}
              className={`flex items-center gap-4 p-4 ${
                index !== endpoints.length - 1
                  ? "border-b border-slate-200 dark:border-slate-800"
                  : ""
              }`}
            >
              <span
                className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                  endpoint.method === "GET"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : endpoint.method === "POST"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {endpoint.method}
              </span>
              <code className="text-sm text-slate-900 dark:text-white font-mono">
                {endpoint.path}
              </code>
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-auto">
                {endpoint.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
