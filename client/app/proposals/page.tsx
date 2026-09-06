"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";

interface Proposal {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
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
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            You haven&apos;t submitted any proposals yet.
          </div>
        )}

        <div className="space-y-3">
          {proposals.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4"
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
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}