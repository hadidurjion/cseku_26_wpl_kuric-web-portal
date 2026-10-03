"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getFundedProject, FundedProject } from "@/lib/api";

const statusStyles: Record<string, string> = {
  Pending: "bg-[#EFEBE0] text-muted",
  "Report Submitted": "bg-gold-tint text-gold-dark",
  Released: "bg-teal-tint text-teal-dark",
};

export default function MyFundedProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<FundedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});

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

  async function submitReport(installmentId: string) {
    const token = getToken();
    if (!token) return;
    const text = texts[installmentId];
    if (!text?.trim()) return;

    setSubmittingId(installmentId);
    setError("");
    try {
      const fd = new FormData();
      fd.append("reportText", text);
      const file = files[installmentId];
      if (file) fd.append("reportFile", file);

      const res = await fetch(
        `http://localhost:5000/api/funding/${id}/installments/${installmentId}/report`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setSuccessMsg("Report submitted successfully.");
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmittingId(null);
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
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-4">
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

        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="text-xs text-muted mb-1">Total funding</div>
          <div className="font-serif-brand text-2xl font-bold text-teal-dark">
            ৳{project.totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="space-y-3">
          {project.installments.map((inst) => (
            <div key={inst._id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-ink">
                  {inst.label}{" "}
                  <span className="text-muted font-normal">
                    (৳{inst.amount.toLocaleString()})
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[inst.status]}`}>
                  {inst.status}
                </span>
              </div>

              {inst.status === "Released" && (
                <p className="text-xs text-teal-dark font-medium">✓ Released</p>
              )}

              {inst.reportRequired && inst.status === "Pending" && (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={texts[inst._id] || ""}
                    onChange={(e) => setTexts({ ...texts, [inst._id]: e.target.value })}
                    placeholder="Describe your progress..."
                    className="w-full h-20 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal resize-none"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, [inst._id]: e.target.files?.[0] || null })
                    }
                    className="text-sm"
                  />
                  <button
                    onClick={() => submitReport(inst._id)}
                    disabled={submittingId === inst._id || !texts[inst._id]?.trim()}
                    className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                  >
                    {submittingId === inst._id ? "Submitting..." : "Submit report"}
                  </button>
                </div>
              )}

              {inst.status === "Report Submitted" && (
                <p className="text-xs text-gold-dark font-medium mt-1">
                  Report submitted, awaiting officer approval.
                </p>
              )}

              {!inst.reportRequired && inst.status === "Pending" && (
                <p className="text-xs text-muted mt-1">Awaiting release from officer.</p>
              )}
            </div>
          ))}
        </div>

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
              <a href={project.publicationLink} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-dark font-semibold hover:underline">
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