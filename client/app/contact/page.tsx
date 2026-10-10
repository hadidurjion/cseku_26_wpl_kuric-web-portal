"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { IconMail } from "@/components/Icons";
import { getHomepageSettings, submitInquiry, HomepageSettings } from "@/lib/api";

export default function ContactPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getHomepageSettings().then(setSettings).catch(() => {});
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitInquiry(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageHeader
        eyebrow="Reach us"
        title="Get in touch"
        subtitle="Questions, partnerships or feedback, we would love to hear from you."
        icon={<IconMail />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
        <div className="px-10 py-9">
          {submitted ? (
            <div className="rounded-lg border border-teal bg-teal-tint text-teal-dark px-4 py-3 text-sm max-w-sm">
              Thanks for reaching out! We&apos;ll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-sm">
              <label className="block text-xs text-muted font-semibold mb-1.5">
                Name
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full border-[1.5px] border-[#C9C2AE] rounded-lg px-3 py-2.5 text-sm mb-3 outline-none focus:border-teal"
              />

              <label className="block text-xs text-muted font-semibold mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full border-[1.5px] border-[#C9C2AE] rounded-lg px-3 py-2.5 text-sm mb-3 outline-none focus:border-teal"
              />

              <label className="block text-xs text-muted font-semibold mb-1.5">
                Message
              </label>
              <textarea
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                className="w-full h-24 border-[1.5px] border-[#C9C2AE] rounded-lg px-3 py-2.5 text-sm mb-4 outline-none focus:border-teal resize-none"
              />

              {error && (
                <p className="text-xs text-danger mb-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>

        <div className="px-10 py-9 bg-teal-tint">
          <div className="h-48 rounded-xl overflow-hidden border border-border mb-4">
            <iframe
              src="https://www.google.com/maps?q=Khulna+University,+Khulna,+Bangladesh&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KURIC location map"
            />
          </div>
          <div className="text-sm text-ink font-medium leading-loose">
            {settings?.contactAddress || "Khulna University, Khulna 9208"}
            <br />
            {settings?.contactEmail || "kuric@ku.ac.bd"}
            <br />
            {settings?.contactPhone || "+880 41-xxxxxx"}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}