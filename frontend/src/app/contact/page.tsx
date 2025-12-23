"use client";

import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-cyan-600 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Address
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    123 Innovation Drive
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Email
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    hello@ventura.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Phone className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Phone
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
