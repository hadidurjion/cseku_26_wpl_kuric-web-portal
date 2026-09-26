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
  const [matchSuggestions, setMatchSuggestions] = useState<
    Record<string, { name: string; matchPercent: number; reason: string }[]>
  >({});
  const [matching, setMatching] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
   async function handleMatchReviewer(proposalId: string) {
    const token = getToken();
    if (!token) return;
    setMatching(proposalId);
    try {
      const res = await fetch(
        `http://localhost:5000/api/ai/match-reviewer/${proposalId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMatchSuggestions((prev) => ({
        ...prev,
        [proposalId]: data.suggestions || [],
      }));
    } catch {
      setError("Failed to get AI suggestions");
    } finally {
      setMatching(null);
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
                <div className="flex justify-between items-start mb-1">
          <h1 className="font-serif-brand text-2xl font-bold text-ink">
            Officer Dashboard
          </h1>
          <button
            onClick={() => {
              const headers = ["Title", "Researcher", "Status", "Submitted"];
              const rows = proposals.map((p) => [
                p.title,
                p.researcher?.name || "",
                p.status,
                new Date(p.createdAt).toLocaleDateString(),
              ]);
              const csv = [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "kuric_proposals.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-surface border-[1.5px] border-[#C9C2AE] text-ink text-xs font-semibold rounded-lg px-3.5 py-2 hover:bg-teal-tint transition-colors"
          >
            ⬇ Export CSV
          </button>
        </div>
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
	<div className="flex gap-3 mb-4">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or researcher..."
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Accepted">Accepted</option>
            <option value="Revision Needed">Revision Needed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
        {proposals
          .filter(
            (p) =>
              (statusFilter === "All" || p.status === statusFilter) &&
              (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.researcher?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((p) => (
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
	     
              <button
                onClick={() => handleMatchReviewer(p._id)}
                disabled={matching === p._id}
                className="text-xs font-semibold text-teal-dark underline mb-2 disabled:opacity-50"
              >
                {matching === p._id ? "Finding matches..." : "✨ AI Suggest Reviewer"}
              </button>

              {matchSuggestions[p._id] && (
                <div className="flex gap-2 mb-2">
                  {matchSuggestions[p._id].map((s) => (
                    <div
                      key={s.name}
                      className="bg-teal-tint rounded-lg px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-bold text-teal-dark">
                        {s.name}
                      </span>{" "}
                      <span className="text-teal-dark">({s.matchPercent}%)</span>
                      <div className="text-muted mt-0.5">{s.reason}</div>
                    </div>
                  ))}
                </div>
              )}
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