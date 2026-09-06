"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitProposal } from "@/lib/api";
import { getToken, getStoredUser } from "@/lib/auth";

export default function NewProposalPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    objectives: "",
    budget: "",
    timeline: "",
  });
  const [coResearchers, setCoResearchers] = useState<string[]>([""]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCoResearcherChange(index: number, value: string) {
    const updated = [...coResearchers];
    updated[index] = value;
    setCoResearchers(updated);
  }

  function addCoResearcher() {
    setCoResearchers([...coResearchers, ""]);
  }

  function removeCoResearcher(index: number) {
    setCoResearchers(coResearchers.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent, isDraft: boolean) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("abstract", form.abstract);
      fd.append("objectives", form.objectives);
      fd.append("budget", form.budget);
      fd.append("timeline", form.timeline);
      fd.append(
        "coResearchers",
        JSON.stringify(coResearchers.filter((c) => c.trim() !== ""))
      );
      fd.append("isDraft", String(isDraft));

      if (files) {
        Array.from(files).forEach((file) => fd.append("attachments", file));
      }

      await submitProposal(fd, token);
      setSuccessMsg(
        isDraft
          ? "Saved as draft."
          : "Proposal submitted successfully!"
      );
      if (!isDraft) {
        setTimeout(() => router.push("/proposals"), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

    const user = getStoredUser();
  const token = getToken();

  if (checkingAuth || !user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl">
        <h1 className="font-serif-brand text-2xl font-bold text-teal-dark mb-1">
          Submit a research proposal
        </h1>
        <p className="text-sm text-body mb-6">
          Fill in the details below. You can save as draft and finish later.
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

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Title
            </label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              placeholder="e.g. AI in Agriculture"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Abstract / Summary
            </label>
            <textarea
              name="abstract"
              required
              value={form.abstract}
              onChange={handleChange}
              className="w-full h-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
              placeholder="Brief summary of the research idea"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Objectives
            </label>
            <textarea
              name="objectives"
              required
              value={form.objectives}
              onChange={handleChange}
              className="w-full h-20 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
              placeholder="What this research aims to achieve"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Budget (৳)
              </label>
              <input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="e.g. 500000"
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
                placeholder="e.g. 6 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Co-researchers (optional)
            </label>
            {coResearchers.map((name, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={name}
                  onChange={(e) =>
                    handleCoResearcherChange(i, e.target.value)
                  }
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                  placeholder="Co-researcher name"
                />
                {coResearchers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCoResearcher(i)}
                    className="text-danger text-sm px-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCoResearcher}
              className="text-teal-dark text-sm font-semibold"
            >
              + Add another
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Attachments (PDF/DOC)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-body"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, true)}
              className="bg-surface text-ink border-[1.5px] border-[#C9C2AE] rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-teal-tint transition-colors disabled:opacity-60"
            >
              Save as draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, false)}
              className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit proposal"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}