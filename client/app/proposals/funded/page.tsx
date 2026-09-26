"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getMyFundedProjects, FundedProject } from "@/lib/api";

const statusStyles: Record<string, string> = {
  "Initial Released": "bg-gold-tint text-gold-dark",
  "Awaiting 6-month Report": "bg-gold-tint text-gold-dark",
  "6-month Approved": "bg-teal-tint text-teal-dark",
  "Fully Disbursed": "bg-teal-tint text-teal-dark",
};

export default function MyFundedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<FundedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    getMyFundedProjects(token)
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          My Funded Projects
        </h1>
        <p className="text-sm text-body mb-6">
          Track funding, submit progress reports, and manage publication info.
        </p>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {!loading && projects.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            You don&apos;t have any funded projects yet.
          </div>
        )}

        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/proposals/funded/${p._id}`}
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
                  ৳{p.totalAmount.toLocaleString()}
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