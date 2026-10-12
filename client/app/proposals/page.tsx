"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { getToken, getStoredUser } from "@/lib/auth";
import { getFundingByProposal } from "@/lib/api";

interface Proposal {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string | null;
  reviewComment?: string;
  reviewDecision?: string | null;
  appealStatus?: string;
}

const statusStyles: Record<string, string> = {
  Draft: "bg-[#EFEBE0] text-muted",
  Pending: "bg-gold-tint text-gold-dark",
  "Under Review": "bg-gold-tint text-gold-dark",
  Accepted: "bg-teal-tint text-teal-dark",
  "Revision Needed": "bg-danger-tint text-danger",
  Rejected: "bg-danger-tint text-danger",
};

export default function ProposalsListPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5000/api/proposals/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.proposals) {
          setProposals(data.proposals);
        } else {
          setError(data.message || "Failed to load proposals");
        }
      })
      .catch(() => setError("Failed to connect to server"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredProposals = proposals.filter(
    (p) =>
      (statusFilter === "All" || p.status === statusFilter) &&
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif-brand text-2xl font-bold text-ink">
            My Proposals
          </h1>
          <Link
            href="/proposals/new"
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            + New proposal
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-muted">Loading proposals...</p>
        )}

        {error && (
          <div className="rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && proposals.length === 0 && (
          <EmptyState
            message="You haven't submitted any proposals yet."
            hint="Click '+ New proposal' to get started."
          />
        )}

        {proposals.length > 0 && (
          <div className="stagger space-y-3">
            {/* Search Input */}
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your proposals..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal mb-3"
            />

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                "All",
                "Pending",
                "Under Review",
                "Accepted",
                "Revision Needed",
                "Rejected",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-teal text-white"
                      : "border-[1.5px] border-[#C9C2AE] text-body"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {!loading && filteredProposals.length === 0 && (
              <EmptyState
                message="No proposals match your search or filter."
                hint="Try searching with another keyword or changing the filter."
              />
            )}

            {filteredProposals.map((p) => (
              <div
                key={p._id}
                className="bg-surface border border-border rounded-xl px-5 py-4"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === p._id ? null : p._id)
                  }
                >
                  <div>
                    <div className="text-sm font-semibold text-ink mb-1">
                      {p.title}
                    </div>
                    <div className="text-xs text-muted">
                      Submitted {new Date(p.createdAt).toLocaleDateString()}
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

                {expandedId === p._id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
                      History
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-teal" />
                        <span className="text-ink font-medium">Submitted</span>
                        <span className="text-muted">
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {p.reviewedAt && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-gold" />
                          <span className="text-ink font-medium">
                            Reviewed — {p.reviewDecision || p.status}
                          </span>
                          <span className="text-muted">
                            {new Date(p.reviewedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {p.appealStatus && p.appealStatus !== "None" && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-danger" />
                          <span className="text-ink font-medium">
                            Appeal — {p.appealStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {expandedId === p._id && p.reviewComment && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                      Reviewer feedback
                    </div>
                    <p className="text-sm text-ink leading-relaxed mb-3">
                      {p.reviewComment}
                    </p>

                    {p.status === "Revision Needed" && (
                      <Link
                        href={`/proposals/${p._id}/revise`}
                        className="inline-block bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-3.5 py-2 transition-colors"
                      >
                        Revise &amp; Resubmit
                      </Link>
                    )}
                    {p.status === "Rejected" &&
                      (!p.appealStatus || p.appealStatus === "None") && (
                        <Link
                          href={`/proposals/${p._id}/appeal`}
                          className="inline-block bg-surface border-[1.5px] border-danger text-danger text-xs font-semibold rounded-lg px-3.5 py-2 transition-colors"
                        >
                          Appeal this decision
                        </Link>
                      )}
                    {p.appealStatus === "Pending Appeal" && (
                      <span className="text-xs text-gold-dark font-semibold">
                        Appeal submitted — pending review
                      </span>
                    )}
                    {p.status === "Accepted" && (
                      <button
                        onClick={async () => {
                          const token = getToken();
                          if (!token) return;
                          try {
                            const project = await getFundingByProposal(p._id, token);
                            router.push(`/proposals/funded/${project._id}`);
                          } catch {
                            alert("Funding has not been set up for this proposal yet.");
                          }
                        }}
                        className="inline-block bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-3.5 py-2 transition-colors"
                      >
                        View Funding Details →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}