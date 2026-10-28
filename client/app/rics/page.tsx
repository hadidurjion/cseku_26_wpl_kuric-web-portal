"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:5000/api";

type Inst = {
  _id: string;
  name: string;
  shortName: string;
  slug: string;
  primaryColor?: string;
  tagline?: string;
};

export default function RicsPage() {
  const [list, setList] = useState<Inst[] | null>(null);

  useEffect(() => {
    fetch(`${API}/institutions`)
      .then((r) => r.json())
      .then((d) => setList(d.institutions || []))
      .catch(() => setList([]));
  }, []);

  function openRic(slug: string) {
    window.location.href = `/?ric=${slug}`;
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-dark">Research &amp; Innovation Centers</p>
        <h1 className="font-serif-brand mt-2 text-4xl font-bold text-ink">Choose your RIC</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every university runs its own Research &amp; Innovation Center on this platform, with its own proposals,
          reviewers, funding and news. Select yours to continue.
        </p>

        {list === null && <p className="mt-10 text-muted">Loading...</p>}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(list || []).map((i) => (
            <button
              key={i._id}
              onClick={() => openRic(i.slug)}
              className="group rounded-2xl border border-border bg-surface p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: i.primaryColor || "#0E6E5C" }}
              >
                {i.shortName}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink">{i.name}</h2>
              {i.tagline && <p className="mt-1 text-sm text-muted">{i.tagline}</p>}
              <span className="mt-4 inline-block text-sm font-semibold text-teal group-hover:underline">
                Open {i.shortName}RIC &rarr;
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-6">
          <h3 className="text-lg font-semibold text-ink">Is your university not listed?</h3>
          <p className="mt-1 text-muted">Register your own RIC. It goes live after Super Admin approval.</p>
          <Link
            href="/register-ric"
            className="mt-4 inline-block rounded-lg bg-teal px-5 py-2.5 font-semibold text-white hover:bg-teal-dark"
          >
            Register your RIC
          </Link>
        </div>
      </div>
    </main>
  );
}
