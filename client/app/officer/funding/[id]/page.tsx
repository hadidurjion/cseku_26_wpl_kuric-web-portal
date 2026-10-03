"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getFundedProject,
  releaseInstallment,
  addInstallment,
  updatePublication,
  updateFundingAmount,
  FundedProject,
} from "@/lib/api";

const statusStyles: Record<string, string> = {
  Pending: "bg-[#EFEBE0] text-muted",
  "Report Submitted": "bg-gold-tint text-gold-dark",
  Released: "bg-teal-tint text-teal-dark",
};

export default function FundingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<FundedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [working, setWorking] = useState(false);

  const [pubStatus, setPubStatus] = useState("Not Published");
  const [journalName, setJournalName] = useState("");
  const [pubLink, setPubLink] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPercent, setNewPercent] = useState("");
  const [newDueMonths, setNewDueMonths] = useState("");
  const [newReportRequired, setNewReportRequired] = useState(true);

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
    load(token);
  }, [id, router]);

  function load(token: string) {
    getFundedProject(id, token)
      .then((p) => {
        setProject(p);
        setPubStatus(p.publicationStatus);
        setJournalName(p.journalName || "");
        setPubLink(p.publicationLink || "");
        setNewAmount(String(p.totalAmount));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleRelease(installmentId: string) {
    const token = getToken();
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      await releaseInstallment(id, installmentId, token);
      setSuccessMsg("Installment released.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleAddInstallment(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !newLabel || !newPercent) return;
    setWorking(true);
    setError("");
    try {
      await addInstallment(
        id,
        {
          label: newLabel,
          percent: Number(newPercent),
          dueMonths: Number(newDueMonths) || 0,
          reportRequired: newReportRequired,
        },
        token
      );
      setSuccessMsg("Installment added.");
      setShowAddForm(false);
      setNewLabel("");
      setNewPercent("");
      setNewDueMonths("");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function handlePublicationSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      await updatePublication(
        id,
        { publicationStatus: pubStatus, journalName, publicationLink: pubLink },
        token
      );
      setSuccessMsg("Publication info updated.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleAmountSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      await updateFundingAmount(id, Number(newAmount), token);
      setSuccessMsg("Total amount updated.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-danger">
        {error || "Not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl mx-auto w-full">
        <div className="text-xs font-mono text-teal-dark font-bold mb-1">
          {project.fundingNumber}
        </div>
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          {project.proposal?.title}
        </h1>
        <p className="text-sm text-muted mb-6">
          {project.researcher?.name} ({project.researcher?.email})
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

        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="text-xs font-bold text-muted uppercase tracking-wide mb-3">
            Total Amount
          </div>
          <form onSubmit={handleAmountSave} className="flex gap-2">
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
            />
            <button
              type="submit"
              disabled={working}
              className="bg-surface border-[1.5px] border-[#C9C2AE] text-ink text-xs font-semibold rounded-lg px-3.5 py-2 disabled:opacity-60"
            >
              Update
            </button>
          </form>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">
              Installments
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="text-xs font-semibold text-teal-dark"
            >
              {showAddForm ? "Cancel" : "+ Add installment"}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddInstallment}
              className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center mb-4 pb-4 border-b border-border"
            >
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label"
                className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                type="number"
                value={newPercent}
                onChange={(e) => setNewPercent(e.target.value)}
                placeholder="%"
                className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                type="number"
                value={newDueMonths}
                onChange={(e) => setNewDueMonths(e.target.value)}
                placeholder="Due (mo)"
                className="rounded-lg border border-border px-2.5 py-2 text-sm outline-none focus:border-teal"
              />
              <button
                type="submit"
                disabled={working}
                className="bg-teal text-white text-xs font-semibold rounded-lg px-3 py-2"
              >
                Add
              </button>
            </form>
          )}

          <div className="space-y-3">
            {project.installments.map((inst) => (
              <div
                key={inst._id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-semibold text-ink">
                    {inst.label}{" "}
                    <span className="text-muted font-normal">
                      ({inst.percent}% · ৳{inst.amount.toLocaleString()})
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      statusStyles[inst.status]
                    }`}
                  >
                    {inst.status}
                  </span>
                </div>
                <div className="text-xs text-muted mb-2">
                  Due at {inst.dueMonths} month(s) ·{" "}
                  {inst.reportRequired ? "Report required" : "No report required"}
                </div>

                {inst.reportText && (
                  <p className="text-sm text-ink mb-2">{inst.reportText}</p>
                )}
                {inst.reportFile && (
                  <a
                    href={"http://localhost:5000/api/files/" + encodeURIComponent(inst.reportFile)}
                    className="text-sm text-teal-dark font-semibold hover:underline block mb-2"
                  >
                    📎 View attached file
                  </a>
                )}

                {inst.status !== "Released" &&
                  (!inst.reportRequired || inst.status === "Report Submitted") && (
                    <button
                      onClick={() => handleRelease(inst._id)}
                      disabled={working}
                      className="bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-3.5 py-2 transition-colors disabled:opacity-60"
                    >
                      Release this installment
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-xs font-bold text-muted uppercase tracking-wide mb-3">
            Publication
          </div>
          <form onSubmit={handlePublicationSave} className="space-y-3">
            <select
              value={pubStatus}
              onChange={(e) => setPubStatus(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
            >
              <option value="Not Published">Not Published</option>
              <option value="Under Review">Under Review</option>
              <option value="Published">Published</option>
            </select>
            <input
              value={journalName}
              onChange={(e) => setJournalName(e.target.value)}
              placeholder="Journal / conference name"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
            />
            <input
              value={pubLink}
              onChange={(e) => setPubLink(e.target.value)}
              placeholder="Publication link / DOI"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
            />
            <button
              type="submit"
              disabled={working}
              className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              Save publication info
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}