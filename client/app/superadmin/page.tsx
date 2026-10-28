"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:5000/api";

type Inst = {
  _id: string;
  name: string;
  shortName: string;
  slug: string;
  status: "Pending" | "Active" | "Suspended" | "Rejected";
  primaryColor?: string;
  directorEmail?: string;
  users: number;
  proposals: number;
  createdAt: string;
};

const badge: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Active: "bg-emerald-100 text-emerald-800",
  Suspended: "bg-orange-100 text-orange-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function SuperAdminPage() {
  const [list, setList] = useState<Inst[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const token = () => {
    try {
      return localStorage.getItem("kuric_token") || "";
    } catch {
      return "";
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/superadmin/institutions`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) setError(res.status === 403 || res.status === 401
        ? "Super Admin only. Please log in with the Super Admin account."
        : data.message || "Failed to load");
      else setList(data.institutions || []);
    } catch {
      setError("Cannot reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(i: Inst, status: string) {
    setBusy(i._id);
    try {
      const res = await fetch(`${API}/superadmin/institutions/${i._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.message || "Failed");
      await load();
    } finally {
      setBusy("");
    }
  }

  function logout() {
    try {
      localStorage.removeItem("kuric_token");
      localStorage.removeItem("kuric_user");
    } catch {}
    window.location.href = "/login";
  }

  const count = (s: string) => list.filter((i) => i.status === s).length;
  const btn = "rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-50";

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-dark">Platform control</p>
            <h1 className="font-serif-brand text-3xl font-bold text-ink">Super Admin</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/rics" className={`${btn} border border-border bg-surface text-ink`}>All RICs</Link>
            <button onClick={load} className={`${btn} border border-border bg-surface text-ink`}>Refresh</button>
            <button onClick={logout} className={`${btn} bg-ink text-white`}>Log out</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Total RICs", list.length],
            ["Active", count("Active")],
            ["Pending", count("Pending")],
            ["Suspended / Rejected", count("Suspended") + count("Rejected")],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm text-muted">{k}</p>
              <p className="mt-1 text-3xl font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        {loading && !error && <p className="mt-6 text-muted">Loading...</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3">RIC</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3">Proposals</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: i.primaryColor || "#0E6E5C" }}
                      >
                        {i.shortName}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{i.name}</p>
                        <p className="text-xs text-muted">{i.directorEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">/{i.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[i.status]}`}>{i.status}</span>
                  </td>
                  <td className="px-4 py-3 text-ink">{i.users}</td>
                  <td className="px-4 py-3 text-ink">{i.proposals}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {(i.status === "Pending" || i.status === "Rejected") && (
                        <button disabled={busy === i._id} onClick={() => setStatus(i, "Active")} className={`${btn} bg-teal text-white hover:bg-teal-dark`}>Approve</button>
                      )}
                      {i.status === "Pending" && (
                        <button disabled={busy === i._id} onClick={() => setStatus(i, "Rejected")} className={`${btn} bg-red-600 text-white`}>Reject</button>
                      )}
                      {i.status === "Active" && i.slug !== "ku" && (
                        <button disabled={busy === i._id} onClick={() => setStatus(i, "Suspended")} className={`${btn} bg-orange-600 text-white`}>Suspend</button>
                      )}
                      {i.status === "Suspended" && (
                        <button disabled={busy === i._id} onClick={() => setStatus(i, "Active")} className={`${btn} bg-teal text-white hover:bg-teal-dark`}>Reactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && list.length === 0 && !error && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No institutions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
