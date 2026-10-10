"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getStaff,
  createStaff,
  endStaffTenure,
  deleteStaff,
  StaffMember,
} from "@/lib/api";

const input =
  "w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal";

function yr(d?: string | null) {
  return d ? new Date(d).getFullYear() : "";
}

export default function StaffManagerPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    category: "staff",
    startDate: "",
    endDate: "",
  });

  function load(token: string) {
    getStaff()
      .then(setStaff)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

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
    load(token);
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v) payload[k] = v;
      });
      await createStaff(payload, token);
      setForm({ name: "", designation: "", email: "", phone: "", category: "staff", startDate: "", endDate: "" });
      load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnd(id: string, name: string) {
    const token = getToken();
    if (!token) return;
    if (!confirm(`End ${name}'s tenure as of today? They will move to history.`)) return;
    await endStaffTenure(id, token);
    load(token);
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    if (!confirm("Delete this record permanently?")) return;
    await deleteStaff(id, token);
    load(token);
  }

  const current = staff.filter((s) => !s.endDate);
  const past = staff.filter((s) => s.endDate);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Staff &amp; Leadership
        </h1>
        <p className="text-sm text-body mb-6">
          Adding a new current Director automatically moves the previous one to
          history.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleAdd}
          autoComplete="off"
          className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className={input} />
            <input name="designation" value={form.designation} onChange={handleChange} placeholder="Designation" required className={input} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className={input} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile number" className={input} />
            <select name="category" value={form.category} onChange={handleChange} className={input + " bg-surface"}>
              <option value="staff">Staff</option>
              <option value="director">Director</option>
            </select>
            <div />
            <div>
              <label className="block text-xs text-muted font-semibold mb-1">Start date</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={input} />
            </div>
            <div>
              <label className="block text-xs text-muted font-semibold mb-1">End date (leave empty if current)</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={input} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "+ Add person"}
          </button>
        </form>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
          Current
        </div>
        {!loading && current.length === 0 && (
          <EmptyState message="No current staff added yet." />
        )}
        <div className="space-y-2 mb-8">
          {current.map((m) => (
            <div key={m._id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-ink">
                  {m.name}{" "}
                  {m.category === "director" && (
                    <span className="text-[10px] font-bold uppercase bg-gold-tint text-gold-dark rounded-full px-2 py-0.5 ml-1">
                      Director
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {m.designation} &middot; since {yr(m.startDate)}
                  {m.email ? ` \u00B7 ${m.email}` : ""}
                  {m.phone ? ` \u00B7 ${m.phone}` : ""}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEnd(m._id, m.name)} className="text-xs font-semibold text-gold-dark hover:underline">
                  End tenure
                </button>
                <button onClick={() => handleDelete(m._id)} className="text-xs font-semibold text-danger hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
          History
        </div>
        <div className="space-y-2">
          {past.length === 0 && !loading && (
            <p className="text-sm text-muted">No past records yet.</p>
          )}
          {past.map((m) => (
            <div key={m._id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-ink">{m.name}</div>
                <div className="text-xs text-muted">
                  {m.designation} &middot; {yr(m.startDate)} &ndash; {yr(m.endDate)}
                </div>
              </div>
              <button onClick={() => handleDelete(m._id)} className="text-xs font-semibold text-danger hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}