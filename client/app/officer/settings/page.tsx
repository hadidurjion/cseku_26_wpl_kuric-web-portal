"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getHomepageSettings,
  updateHomepageSettings,
  HomepageSettings,
} from "@/lib/api";

export default function HomepageSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<HomepageSettings>({
    tagline: "",
    activeProjectsCount: "",
    publicationsCount: "",
    fundedAmount: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

    getHomepageSettings()
      .then(setForm)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      await updateHomepageSettings(form, token);
      setSuccessMsg("Homepage settings updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-xl mx-auto w-full">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Homepage Settings
        </h1>
        <p className="text-sm text-body mb-6">
          Update the hero tagline and statistics shown on the public homepage.
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

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Hero tagline
            </label>
            <input
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Active projects
              </label>
              <input
                name="activeProjectsCount"
                value={form.activeProjectsCount}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Publications
              </label>
              <input
                name="publicationsCount"
                value={form.publicationsCount}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Funded
              </label>
              <input
                name="fundedAmount"
                value={form.fundedAmount}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}