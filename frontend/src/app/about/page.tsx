import { Footer } from "@/components/Footer";
import { Target, Users, TrendingUp, Award } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { value: "$2.5B+", label: "Assets Under Management" },
    { value: "150+", label: "Portfolio Companies" },
    { value: "25+", label: "Team Members" },
    { value: "10+", label: "Years of Experience" },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "We back founders who are building the future and solving meaningful problems.",
    },
    {
      icon: Users,
      title: "Founder-First",
      description:
        "Our portfolio companies are our priority. We provide hands-on support at every stage.",
    },
    {
      icon: TrendingUp,
      title: "Long-term Focus",
      description:
        "We believe in sustainable growth and building companies that last.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We hold ourselves and our partners to the highest standards of integrity and performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero */}
      <div className="bg-linear-to-br from-slate-900 to-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Ventura
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            We are a venture capital firm dedicated to empowering the next
            generation of innovators and entrepreneurs.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-lg"
            >
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value) => (
            <div key={value.title} className="flex gap-4">
              <div className="shrink-0 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg h-fit">
                <value.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
