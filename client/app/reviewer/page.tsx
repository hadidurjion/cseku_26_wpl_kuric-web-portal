"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getAssignedProposals, ProposalSummary } from "@/lib/api";

const statusStyles: Record<string, string> = {
  "Under Review": "bg-gold-tint text-gold-dark",
  Accepted: "bg-teal-tint text-teal-dark",
  "Revision Needed": "bg-danger-tint text-danger",
  Rejected: "bg-danger-tint text-danger",
};

export default function ReviewerDashboard() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    getAssignedProposals(token)
      .then(setProposals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Assigned Proposals
        </h1>
        <p className="text-sm text-body mb-6">
          Review proposals assigned to you and record your decision.
        </p>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && proposals.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No proposals assigned to you yet.
          </div>
        )}

        <div className="space-y-3">
          {proposals.map((p) => (
            <Link
              key={p._id}
              href={`/reviewer/${p._id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:border-teal transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-ink mb-1">
                  {p.title}
                </div>
                <div className="text-xs text-muted">
                  By {p.researcher?.name} · {p.researcher?.department}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  statusStyles[p.status] || "bg-[#EFEBE0] text-muted"
                }`}
              >
                {p.status}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}