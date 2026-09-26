"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getAllFundedProjects,
  getEligibleProposals,
  createFunding,
  FundedProject,
} from "@/lib/api";

interface EligibleProposal {
  _id: string;
  title: string;
  researcher: { name: string };
}

const statusStyles: Record<string, string> = {
  "Initial Released": "bg-gold-tint text-gold-dark",
  "Awaiting 6-month Report": "bg-gold-tint text-gold-dark",
  "6-month Approved": "bg-teal-tint text-teal-dark",
  "Fully Disbursed": "bg-teal-tint text-teal-dark",
};

export default function FundingListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<FundedProject[]>([]);
  const [eligible, setEligible] = useState<EligibleProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [initialPercent, setInitialPercent] = useState("50");
  const [creating, setCreating] = useState(false);

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
    loadData(token);
  }, [router]);

  function loadData(token: string) {
    setLoading(true);
    Promise.all([getAllFundedProjects(token), getEligibleProposals(token)])
      .then(([proj, elig]) => {
        setProjects(proj);
        setEligible(elig);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !selectedProposal || !totalAmount) return;

    setCreating(true);
    setError("");
    try {
      await createFunding(
        selectedProposal,
        Number(totalAmount),
        Number(initialPercent),
        token
      );
      setShowForm(false);
      setSelectedProposal("");
      setTotalAmount("");
      loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create funding");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-4xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-serif-brand text-2xl font-bold text-ink">
              Funded Projects
            </h1>
            <p className="text-sm text-body mt-1">
              Manage funding, disbursement, and publication tracking.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            {showForm ? "Cancel" : "+ Create Funding"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Accepted proposal
              </label>
              <select
                value={selectedProposal}
                onChange={(e) => setSelectedProposal(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
              >
                <option value="">Select a proposal...</option>
                {eligible.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} — {p.researcher?.name}
                  </option>
                ))}
              </select>
              {eligible.length === 0 && (
                <p className="text-xs text-muted mt-1">
                  No accepted proposals awaiting funding.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Total amount (৳)
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Initial release (%)
                </label>
                <input
                  type="number"
                  value={initialPercent}
                  onChange={(e) => setInitialPercent(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Funding"}
            </button>
          </form>
        )}

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && projects.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No funded projects yet.
          </div>
        )}

        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/officer/funding/${p._id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:border-teal transition-colors"
            >
              <div>
                <div className="text-xs font-mono text-teal-dark font-bold mb-1">
                  {p.fundingNumber}
                </div>
                <div className="text-sm font-semibold text-ink">
                  {p.proposal?.title}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {p.researcher?.name} · ৳{p.totalAmount.toLocaleString()}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  statusStyles[p.disbursementStatus] || "bg-[#EFEBE0] text-muted"
                }`}
              >
                {p.disbursementStatus}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}