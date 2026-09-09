"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { resubmitProposal } from "@/lib/api";

interface FullProposal {
  _id: string;
  title: string;
  abstract: string;
  objectives: string;
  budget?: string;
  timeline?: string;
  status: string;
  reviewComment?: string;
}

export default function RevisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [proposal, setProposal] = useState<FullProposal | null>(null);
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    objectives: "",
    budget: "",
    timeline: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    fetch("http://localhost:5000/api/proposals/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const p = (data.proposals as FullProposal[]).find(
          (item) => item._id === id
        );
        if (!p) {
          setError("Proposal not found");
        } else if (p.status !== "Revision Needed") {
          setError("This proposal is not marked for revision");
        } else {
          setProposal(p);
          setForm({
            title: p.title,
            abstract: p.abstract,
            objectives: p.objectives,
            budget: p.budget || "",
            timeline: p.timeline || "",
          });
        }
      })
      .catch(() => setError("Failed to load proposal"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      await resubmitProposal(id, form, token);
      setSuccessMsg("Proposal resubmitted for review!");
      setTimeout(() => router.push("/proposals"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resubmit");
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

  if (error && !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl mx-auto w-full">
        <h1 className="font-serif-brand text-2xl font-bold text-teal-dark mb-2">
          Revise your proposal
        </h1>

        {proposal?.reviewComment && (
          <div className="mb-6 rounded-lg border border-gold bg-gold-tint px-4 py-3 text-sm text-ink">
            <span className="font-bold">Reviewer feedback: </span>
            {proposal.reviewComment}
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Abstract
            </label>
            <textarea
              name="abstract"
              value={form.abstract}
              onChange={handleChange}
              className="w-full h-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Objectives
            </label>
            <textarea
              name="objectives"
              value={form.objectives}
              onChange={handleChange}
              className="w-full h-20 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Budget
              </label>
              <input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Timeline
              </label>
              <input
                name="timeline"
                value={form.timeline}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {submitting ? "Resubmitting..." : "Resubmit proposal"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}