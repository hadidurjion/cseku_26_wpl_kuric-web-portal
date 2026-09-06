"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: connect to backend inquiry API later
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
        {/* Form side */}
        <div className="px-10 py-9">
          <h1 className="font-serif-brand text-xl font-bold text-ink mb-5">
            Get in touch
          </h1>

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

              <button
                type="submit"
                className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Info side */}
        <div className="px-10 py-9 bg-teal-tint">
          <div className="h-28 bg-surface rounded-xl border border-border mb-4 flex items-center justify-center text-xs text-muted">
            Map placeholder
          </div>
          <div className="text-sm text-ink font-medium leading-loose">
            Khulna University, Khulna 9208
            <br />
            kuric@ku.ac.bd
            <br />
            +880 41-xxxxxx
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}