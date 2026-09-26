"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getContent,
  createContent,
  deleteContent,
  ContentItem,
} from "@/lib/api";

const tabs = [
  { key: "event", label: "Events" },
  { key: "news", label: "News" },
  { key: "publication", label: "Publications" },
  { key: "research", label: "Research" },
];

export default function ContentManagementPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState("event");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

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
  }, [router]);

  useEffect(() => {
    setLoading(true);
    getContent(activeType)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeType]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setAuthors("");
    setYear("");
    setCategory("");
    setStatus("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = getToken();
    if (!token || !title.trim()) return;

    setSaving(true);
    try {
      const payload: Record<string, string> = { type: activeType, title };
      if (description) payload.description = description;
      if (activeType === "event" && date) payload.date = date;
      if (activeType === "event" && location) payload.location = location;
      if (activeType === "publication" && authors) payload.authors = authors;
      if (activeType === "publication" && year) payload.year = year;
      if (activeType === "research" && category) payload.category = category;
      if (activeType === "research" && status) payload.status = status;

      const newItem = await createContent(payload, token);
      setItems((prev) => [newItem, ...prev]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    try {
      await deleteContent(id, token);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Content Management
        </h1>
        <p className="text-sm text-body mb-6">
          Add or remove events, news, and publications shown on the public site.
        </p>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeType === tab.key
                  ? "bg-teal text-white"
                  : "border-[1.5px] border-[#C9C2AE] text-body"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description / abstract"
            className="w-full h-20 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal resize-none"
          />
          {activeType === "event" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue"
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </div>
          )}
          {activeType === "publication" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Author(s)"
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </div>
          )}
          {activeType === "research" && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
              >
                <option value="">Category</option>
                <option value="ICT">ICT</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm bg-surface"
              >
                <option value="">Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Funded">Funded</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Adding..." : `+ Add ${activeType}`}
          </button>
        </form>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold text-ink">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-muted mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(item._id)}
                className="text-danger text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted">No {activeType} items yet.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}