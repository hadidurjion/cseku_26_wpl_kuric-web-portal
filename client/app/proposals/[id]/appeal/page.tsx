"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken } from "@/lib/auth";
import { submitAppeal } from "@/lib/api";

export default function AppealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [appealText, setAppealText] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!appealText.trim()) {
      setError("Please explain why you are appealing this decision");
      return;
    }
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      await submitAppeal(id, appealText, token);
      setSuccessMsg("Your appeal has been submitted for review.");
      setTimeout(() => router.push("/proposals"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-xl mx-auto w-full">
        <h1 className="font-serif-brand text-2xl font-bold text-teal-dark mb-2">
          Appeal this decision
        </h1>
        <p className="text-sm text-body mb-6">
          Explain why you believe this proposal should be reconsidered. An
          officer will review your appeal.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-teal bg-teal-tint text-teal-dark px-4 py-2 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={appealText}
            onChange={(e) => setAppealText(e.target.value)}
            placeholder="Justification for appeal..."
            className="w-full h-40 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit appeal"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}