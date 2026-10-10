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

interface InstallmentDraft {
  label: string;
  percent: string;
  dueMonths: string;
  reportRequired: boolean;
}

export default function FundingListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<FundedProject[]>([]);
  const [eligible, setEligible] = useState<EligibleProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState<InstallmentDraft[]>([
    { label: "Initial", percent: "40", dueMonths: "0", reportRequired: false },
    { label: "Milestone 1", percent: "60", dueMonths: "6", reportRequired: true },
  ]);
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

  function updateInstallment(idx: number, field: keyof InstallmentDraft, value: string | boolean) {
    const copy = [...installments];
    copy[idx] = { ...copy[idx], [field]: value };
    setInstallments(copy);
  }

  function addInstallmentRow() {
    setInstallments([
      ...installments,
      { label: "", percent: "", dueMonths: "", reportRequired: true },
    ]);
  }

  function removeInstallmentRow(idx: number) {
    setInstallments(installments.filter((_, i) => i !== idx));
  }

  const percentTotal = installments.reduce((sum, i) => sum + (Number(i.percent) || 0), 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !selectedProposal || !totalAmount) return;

    if (percentTotal !== 100) {
      setError("Installment percentages must add up to 100%");
      return;
    }

    setCreating(true);
    setError("");
    try {
      await createFunding(
        selectedProposal,
        Number(totalAmount),
        installments.map((i) => ({
          label: i.label,
          percent: Number(i.percent),
          dueMonths: Number(i.dueMonths) || 0,
          reportRequired: i.reportRequired,
        })),
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

  const filtered = projects.filter(
    (p) =>
      p.proposal?.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.researcher?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.fundingNumber?.toLowerCase().includes(search.toLowerCase())
  );

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
            className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-4"
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
            </div>
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-ink">
                  Installment schedule
                </label>
                <span
                  className={`text-xs font-semibold ${
                    percentTotal === 100 ? "text-teal-dark" : "text-danger"
                  }`}
                >
                  Total: {percentTotal}%
                </span>
              </div>
              <div className="space-y-2">
                {installments.map((inst, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-2 items-center">
                    <input
                      value={inst.label}
                      onChange={(e) => updateInstallment(idx, "label", e.target.value)}
                      placeholder="Label (e.g. Milestone 1)"
                      className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
                    />
                    <input
                      type="number"
                      value={inst.percent}
                      onChange={(e) => updateInstallment(idx, "percent", e.target.value)}
                      placeholder="%"
                      className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
                    />
                    <input
                      type="number"
                      value={inst.dueMonths}
                      onChange={(e) => updateInstallment(idx, "dueMonths", e.target.value)}
                      placeholder="Due (months)"
                      className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
                    />
                    <label className="flex items-center gap-1 text-xs text-muted whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={inst.reportRequired}
                        onChange={(e) =>
                          updateInstallment(idx, "reportRequired", e.target.checked)
                        }
                      />
                      Report
                    </label>
                    <button
                      type="button"
                      onClick={() => removeInstallmentRow(idx)}
                      className="text-danger text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addInstallmentRow}
                className="text-teal-dark text-xs font-semibold mt-2"
              >
                + Add installment
              </button>
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

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, researcher, or funding number..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal mb-4"
        />

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No funded projects found.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((p) => {
            const released = p.installments.filter((i) => i.status === "Released").length;
            return (
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
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gold-tint text-gold-dark">
                  {released}/{p.installments.length} released
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}