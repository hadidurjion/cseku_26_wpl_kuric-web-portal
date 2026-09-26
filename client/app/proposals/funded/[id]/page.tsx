"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getFundedProject, FundedProject } from "@/lib/api";

export default function MyFundedProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<FundedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sixMonthText, setSixMonthText] = useState("");
  const [sixMonthFile, setSixMonthFile] = useState<File | null>(null);
  const [oneYearText, setOneYearText] = useState("");
  const [oneYearFile, setOneYearFile] = useState<File | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    load(token);
  }, [id, router]);

  function load(token: string) {
    getFundedProject(id, token)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function submitReport(
    endpoint: "six-month-report" | "one-year-report",
    text: string,
    file: File | null
  ) {
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("reportText", text);
      if (file) fd.append("reportFile", file);

      const res = await fetch(
        `http://localhost:5000/api/funding/${id}/${endpoint}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      setSuccessMsg("Report submitted successfully.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
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

        {/* Funding overview */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5 mt-4">
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
        </div>

        {/* 6-month report */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">
              6-month Progress Report
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFEBE0] text-muted">
              {project.sixMonthReportStatus}
            </span>
          </div>

          {project.sixMonthReportStatus === "Not Submitted" ? (
            <div className="space-y-3">
              <textarea
                value={sixMonthText}
                onChange={(e) => setSixMonthText(e.target.value)}
                placeholder="Describe your progress so far..."
                className="w-full h-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal resize-none"
              />
              <input
                type="file"
                onChange={(e) => setSixMonthFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <button
                onClick={() =>
                  submitReport("six-month-report", sixMonthText, sixMonthFile)
                }
                disabled={submitting || !sixMonthText.trim()}
                className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit 6-month report"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink">{project.sixMonthReportText}</p>
          )}
        </div>

        {/* 1-year report — only shown after 6-month approved */}
        {project.sixMonthReportStatus === "Approved" && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-bold text-muted uppercase tracking-wide">
                1-year Progress Report
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFEBE0] text-muted">
                {project.oneYearReportStatus}
              </span>
            </div>

            {project.oneYearReportStatus === "Not Submitted" ? (
              <div className="space-y-3">
                <textarea
                  value={oneYearText}
                  onChange={(e) => setOneYearText(e.target.value)}
                  placeholder="Describe your final progress and outcomes..."
                  className="w-full h-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal resize-none"
                />
                <input
                  type="file"
                  onChange={(e) => setOneYearFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                <button
                  onClick={() =>
                    submitReport("one-year-report", oneYearText, oneYearFile)
                  }
                  disabled={submitting || !oneYearText.trim()}
                  className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit 1-year report"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink">{project.oneYearReportText}</p>
            )}
          </div>
        )}

        {project.publicationStatus !== "Not Published" && (
          <div className="bg-surface border border-border rounded-xl p-5 mt-5">
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
              Publication
            </div>
            <p className="text-sm text-ink">
              {project.publicationStatus}
              {project.journalName && ` — ${project.journalName}`}
            </p>
            {project.publicationLink && (
              <a
                href={project.publicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-dark font-semibold hover:underline"
              >
                View publication →
              </a>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}