"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getAllProposals,
  getReviewers,
  assignReviewer,
  OfficerProposal,
  Reviewer,
} from "@/lib/api";

const statusStyles: Record<string, string> = {
  Draft: "bg-[#EFEBE0] text-muted",
  Pending: "bg-gold-tint text-gold-dark",
  "Under Review": "bg-gold-tint text-gold-dark",
  Accepted: "bg-teal-tint text-teal-dark",
  "Revision Needed": "bg-danger-tint text-danger",
  Rejected: "bg-danger-tint text-danger",
};

export default function OfficerDashboard() {
  const router = useRouter();
  const [proposals, setProposals] = useState<OfficerProposal[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    if (user.role !== "officer") {
      router.replace("/");
      return;
    }

    Promise.all([getAllProposals(token), getReviewers(token)])
      .then(([props, revs]) => {
        setProposals(props);
        setReviewers(revs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAssign(proposalId: string, reviewerId: string) {
    const token = getToken();
    if (!token || !reviewerId) return;

    setAssigning(proposalId);
    try {
      const result = await assignReviewer(proposalId, reviewerId, token);
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId
            ? { ...p, reviewer: result.proposal.reviewer, status: "Under Review" }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setAssigning(null);
    }
  }

  const counts = proposals.reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-4xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Officer Dashboard
        </h1>
        <p className="text-sm text-body mb-6">
          Overview of all proposals and reviewer assignments.
        </p>

        {/* Status summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {["Pending", "Under Review", "Accepted", "Revision Needed", "Rejected"].map(
            (status) => (
              <div
                key={status}
                className="bg-surface border border-border rounded-xl p-4 text-center"
              >
                <div className="font-serif-brand text-2xl font-bold text-teal-dark">
                  {counts[status] || 0}
                </div>
                <div className="text-xs text-muted font-medium mt-1">
                  {status}
                </div>
              </div>
            )
          )}
        </div>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {proposals.map((p) => (
            <div
              key={p._id}
              className="bg-surface border border-border rounded-xl px-5 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {p.title}
                  </div>
                  <div className="text-xs text-muted">
                    By {p.researcher?.name}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    statusStyles[p.status] || "bg-[#EFEBE0] text-muted"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted font-medium">
                  Reviewer:
                </span>
                <select
                  defaultValue={p.reviewer?._id || ""}
                  onChange={(e) => handleAssign(p._id, e.target.value)}
                  disabled={assigning === p._id}
                  className="text-sm border border-border rounded-lg px-2 py-1.5 bg-surface"
                >
                  <option value="">Select reviewer...</option>
                  {reviewers.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {assigning === p._id && (
                  <span className="text-xs text-muted">Assigning...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}