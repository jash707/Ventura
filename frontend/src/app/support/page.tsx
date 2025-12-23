import { Footer } from "@/components/Footer";
import { MessageCircle, Mail, FileQuestion, BookOpen } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I add a new portfolio company?",
      answer:
        "Navigate to the Portfolio section and click the 'Add Company' button. Fill in the required details and submit.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Yes! Go to Settings > Data Export to download your portfolio data in CSV or JSON format.",
    },
    {
      question: "How are performance metrics calculated?",
      answer:
        "Metrics like IRR and MOIC are calculated using industry-standard formulas based on your investment data.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-orange-500 to-red-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Support Center
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            We&apos;re here to help. Find answers or reach out to our team.
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: MessageCircle,
              title: "Live Chat",
              desc: "Chat with our support team",
              action: "Start Chat",
            },
            {
              icon: Mail,
              title: "Email Support",
              desc: "support@ventura.com",
              action: "Send Email",
            },
            {
              icon: BookOpen,
              title: "Documentation",
              desc: "Browse our guides",
              action: "View Docs",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:shadow-lg transition-shadow"
            >
              <item.icon className="h-10 w-10 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {item.desc}
              </p>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors">
                {item.action}
              </button>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-orange-500" />
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 ml-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
