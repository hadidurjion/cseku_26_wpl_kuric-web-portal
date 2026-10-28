"use client";

import { useState } from "react";
import Link from "next/link";

const API = "http://localhost:5000/api";

export default function RegisterRicPage() {
  const [f, setF] = useState({
    name: "",
    shortName: "",
    slug: "",
    directorName: "",
    directorEmail: "",
    password: "",
    primaryColor: "#0E6E5C",
    tagline: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/institutions/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Something went wrong");
      else setDone(data.message);
    } catch {
      setError("Cannot reach the server");
    } finally {
      setLoading(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-ink outline-none focus:border-teal";
  const label = "block text-sm font-medium text-ink";

  if (done) {
    return (
      <main className="min-h-screen bg-bg px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="font-serif-brand text-3xl font-bold text-ink">Request received</h1>
          <p className="mt-3 text-muted">{done}</p>
          <p className="mt-2 text-sm text-muted">
            Your director account ({f.directorEmail}) will be able to log in once the Super Admin approves {f.shortName}RIC.
          </p>
          <Link href="/rics" className="mt-6 inline-block rounded-lg bg-teal px-5 py-2.5 font-semibold text-white hover:bg-teal-dark">
            Back to all RICs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-12">
      <form onSubmit={submit} className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-dark">New institution</p>
        <h1 className="font-serif-brand mt-1 text-3xl font-bold text-ink">Register your RIC</h1>
        <p className="mt-2 text-sm text-muted">
          You get your own portal with separate proposals, reviewers, funding, news and branding.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={label}>Full name of the center</label>
            <input className={input} required placeholder="Rajshahi University Research and Innovation Center" value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Short name</label>
              <input className={input} required placeholder="RU" value={f.shortName} onChange={(e) => set("shortName", e.target.value.toUpperCase())} />
              <p className="mt-1 text-xs text-muted">Shown as {f.shortName || "RU"}RIC</p>
            </div>
            <div>
              <label className={label}>Portal address</label>
              <input className={input} required placeholder="ru" value={f.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
              <p className="mt-1 text-xs text-muted">2-20 letters, numbers or hyphens</p>
            </div>
          </div>
          <div>
            <label className={label}>Tagline (optional)</label>
            <input className={input} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div>
            <label className={label}>Brand color</label>
            <input type="color" className="mt-1 h-10 w-20 cursor-pointer rounded border border-border" value={f.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
          </div>
          <hr className="border-border" />
          <div>
            <label className={label}>Director name</label>
            <input className={input} required value={f.directorName} onChange={(e) => set("directorName", e.target.value)} />
          </div>
          <div>
            <label className={label}>Director email</label>
            <input type="email" className={input} required value={f.directorEmail} onChange={(e) => set("directorEmail", e.target.value)} />
          </div>
          <div>
            <label className={label}>Password</label>
            <input type="password" className={input} required minLength={6} value={f.password} onChange={(e) => set("password", e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="mt-6 w-full rounded-lg bg-teal px-5 py-3 font-semibold text-white hover:bg-teal-dark disabled:opacity-60">
          {loading ? "Submitting..." : "Submit request"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/rics" className="text-teal hover:underline">Back to all RICs</Link>
        </p>
      </form>
    </main>
  );
}
