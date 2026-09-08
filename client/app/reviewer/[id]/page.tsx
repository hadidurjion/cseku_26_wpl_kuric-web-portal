"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getProposalDetail, submitDecision, ProposalDetail } from "@/lib/api";

export default function ReviewProposalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    if (user.role !== "reviewer") {
      router.replace("/");
      return;
    }

    getProposalDetail(id, token)
      .then((p) => {
        setProposal(p);
        if (p.reviewDecision) setDecision(p.reviewDecision);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!decision) {
      setError("Please select a decision");
      return;
    }
    if (!comment.trim()) {
      setError("A comment is required");
      return;
    }

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      await submitDecision(id, decision, comment, token);
      setSuccessMsg("Decision recorded successfully.");
      setTimeout(() => router.push("/reviewer"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-danger">
        {error || "Proposal not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl mx-auto w-full">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          {proposal.title}
        </h1>
        <p className="text-sm text-muted mb-6">
          By {proposal.researcher?.name} ({proposal.researcher?.email}) ·{" "}
          {proposal.researcher?.department}
        </p>

        <div className="space-y-5 mb-8">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Abstract
            </div>
            <p className="text-sm text-ink leading-relaxed">
              {proposal.abstract}
            </p>
          </div>
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Objectives
            </div>
            <p className="text-sm text-ink leading-relaxed">
              {proposal.objectives}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                Budget
              </div>
              <p className="text-sm text-ink">{proposal.budget || "—"}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                Timeline
              </div>
              <p className="text-sm text-ink">{proposal.timeline || "—"}</p>
            </div>
          </div>
          {proposal.coResearchers && proposal.coResearchers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                Co-researchers
              </div>
              <p className="text-sm text-ink">
                {proposal.coResearchers.join(", ")}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-serif-brand text-lg font-bold text-ink mb-4">
            Your Decision
          </h2>

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
            <div className="flex gap-3">
              {["Accept", "Revision Needed", "Deny"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDecision(opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-[1.5px] transition-colors ${
                    decision === opt
                      ? "bg-teal text-white border-teal"
                      : "border-[#C9C2AE] text-body"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Comment (required)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-28 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
                placeholder="Explain your decision..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit decision"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}