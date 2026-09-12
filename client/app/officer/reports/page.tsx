"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";

interface ReportStats {
  total: number;
  byStatus: Record<string, number>;
  byDept: Record<string, number>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState("");
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    if (user.role !== "officer") {
      router.replace("/");
    }
  }, [router]);

  async function generateReport() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate-report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to generate report");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-serif-brand text-2xl font-bold text-ink">
              AI Progress Report
            </h1>
            <p className="text-sm text-body mt-1">
              Generate a narrative summary of proposal activity.
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
          >
            {loading ? "Generating..." : "✨ Generate AI Report"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="font-serif-brand text-2xl font-bold text-teal-dark">
                {stats.total}
              </div>
              <div className="text-xs text-muted font-medium mt-1">
                Total proposals
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="font-serif-brand text-2xl font-bold text-teal-dark">
                {stats.byStatus["Accepted"] || 0}
              </div>
              <div className="text-xs text-muted font-medium mt-1">
                Accepted
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="font-serif-brand text-2xl font-bold text-gold-dark">
                {Object.keys(stats.byDept).length}
              </div>
              <div className="text-xs text-muted font-medium mt-1">
                Departments
              </div>
            </div>
          </div>
        )}

        {report && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="text-xs font-bold text-gold-dark uppercase tracking-wide mb-3">
              AI-Generated Narrative
            </div>
            {report.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-ink leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </div>
        )}

        {!report && !loading && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            Click &quot;Generate AI Report&quot; to create a summary.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}