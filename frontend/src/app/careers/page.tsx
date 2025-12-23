import { Footer } from "@/components/Footer";
import { MapPin, Clock } from "lucide-react";

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
    },
    {
      title: "Investment Analyst",
      department: "Investments",
      location: "New York, NY",
      type: "Full-time",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Portfolio Operations Manager",
      department: "Operations",
      location: "San Francisco, CA",
      type: "Full-time",
    },
  ];

  const perks = [
    "Competitive salary & equity",
    "Comprehensive health benefits",
    "Unlimited PTO",
    "Remote-friendly culture",
    "Learning & development budget",
    "Team offsites & events",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Help us build the future of venture capital. We&apos;re looking for
            passionate individuals to join our mission.
          </p>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Why Work With Us?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {perks.map((perk) => (
            <div
              key={perk}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center"
            >
              <span className="text-slate-700 dark:text-slate-300">{perk}</span>
            </div>
          ))}
        </div>

        {/* Open Positions */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Open Positions
        </h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <div
              key={job.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {job.department}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.type}
                </span>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors shrink-0">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
