"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getFundedProject,
  approveSixMonth,
  approveOneYear,
  updatePublication,
  updateFundingAmount,
  FundedProject,
} from "@/lib/api";

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

  async function handleApproveSixMonth() {
    const token = getToken();
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      await approveSixMonth(id, token);
      setSuccessMsg("6-month report approved, remaining funds released.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleApproveOneYear() {
    const token = getToken();
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      await approveOneYear(id, token);
      setSuccessMsg("1-year report approved, project marked complete.");
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

        {/* Disbursement overview */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="text-xs font-bold text-muted uppercase tracking-wide mb-3">
            Disbursement
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-xs text-muted">Total</div>
              <div className="font-serif-brand text-lg font-bold text-teal-dark">
                ৳{project.totalAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Initial released</div>
              <div className="font-serif-brand text-lg font-bold text-teal-dark">
                ৳{project.initialDisbursed.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">6-month released</div>
              <div className="font-serif-brand text-lg font-bold text-teal-dark">
                ৳{project.sixMonthDisbursed.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-tint text-gold-dark">
            {project.disbursementStatus}
          </span>

          <form onSubmit={handleAmountSave} className="flex gap-2 mt-4 pt-4 border-t border-border">
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
              Update total amount
            </button>
          </form>
        </div>

        {/* 6-month report */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">
              6-month Report
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFEBE0] text-muted">
              {project.sixMonthReportStatus}
            </span>
          </div>
          {project.sixMonthReportText ? (
            <>
              <p className="text-sm text-ink mb-3">{project.sixMonthReportText}</p>
              {project.sixMonthReportFile && (
                <a
                  href={"http://localhost:5000/api/files/" + encodeURIComponent(project.sixMonthReportFile)}
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 text-sm text-teal-dark font-semibold hover:underline block mb-3"
                >
                  📎 View attached file
                </a>
              )}
              {project.sixMonthReportStatus === "Submitted" && (
                <button
                  onClick={handleApproveSixMonth}
                  disabled={working}
                  className="bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                >
                  Approve &amp; release remaining funds
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Not submitted yet.</p>
          )}
        </div>

        {/* 1-year report */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">
              1-year Report
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFEBE0] text-muted">
              {project.oneYearReportStatus}
            </span>
          </div>
          {project.oneYearReportText ? (
            <>
              <p className="text-sm text-ink mb-3">{project.oneYearReportText}</p>
              {project.oneYearReportFile && (
                <a 
                  href={"http://localhost:5000/api/files/" + encodeURIComponent(project.oneYearReportFile)}
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 text-sm text-teal-dark font-semibold hover:underline block mb-3"
                >
                  📎 View attached file
                </a>
              )}
              {project.oneYearReportStatus === "Submitted" && (
                <button
                  onClick={handleApproveOneYear}
                  disabled={working}
                  className="bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                >
                  Approve &amp; mark project complete
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Not submitted yet.</p>
          )}
        </div>

        {/* Publication */}
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