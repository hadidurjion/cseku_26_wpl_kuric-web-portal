"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getPendingAppeals, resolveAppeal, AppealProposal } from "@/lib/api";

export default function AppealsPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<AppealProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

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

    getPendingAppeals(token)
      .then(setAppeals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleResolve(id: string, decision: string) {
    const token = getToken();
    if (!token) return;

    setResolvingId(id);
    try {
      await resolveAppeal(id, decision, responses[id] || "", token);
      setAppeals((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Appeal Resolution
        </h1>
        <p className="text-sm text-body mb-6">
          Review researcher appeals against rejected proposals.
        </p>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {!loading && appeals.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No pending appeals.
          </div>
        )}

        <div className="space-y-4">
          {appeals.map((a) => (
            <div
              key={a._id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="text-sm font-semibold text-ink mb-1">
                {a.title}
              </div>
              <div className="text-xs text-muted mb-3">
                By {a.researcher?.name} ({a.researcher?.email})
              </div>

              <div className="mb-3">
                <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                  Original reviewer comment
                </div>
                <p className="text-sm text-ink">{a.reviewComment}</p>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                  Researcher&apos;s appeal
                </div>
                <p className="text-sm text-ink">{a.appealText}</p>
              </div>

              <textarea
                placeholder="Optional response to researcher..."
                value={responses[a._id] || ""}
                onChange={(e) =>
                  setResponses({ ...responses, [a._id]: e.target.value })
                }
                className="w-full h-16 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal resize-none mb-3"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve(a._id, "Overturned")}
                  disabled={resolvingId === a._id}
                  className="bg-teal hover:bg-teal-dark text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                >
                  Overturn (reopen for review)
                </button>
                <button
                  onClick={() => handleResolve(a._id, "Upheld")}
                  disabled={resolvingId === a._id}
                  className="bg-surface border-[1.5px] border-[#C9C2AE] text-ink text-xs font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                >
                  Uphold rejection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}