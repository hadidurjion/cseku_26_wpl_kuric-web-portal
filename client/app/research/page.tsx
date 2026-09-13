"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContent, ContentItem } from "@/lib/api";

const categories = ["All", "ICT", "Environment", "Health"];

const statusStyles: Record<string, string> = {
  Ongoing: "bg-teal-tint text-teal-dark",
  Funded: "bg-gold-tint text-gold-dark",
  Completed: "bg-[#E5E5E0] text-body",
};

const borderStyles: Record<string, string> = {
  Ongoing: "border-l-teal",
  Funded: "border-l-gold",
  Completed: "border-l-[#6B7280]",
};

export default function ResearchPage() {
  const [active, setActive] = useState("All");
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContent("research")
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1">
        <h1 className="font-serif-brand text-xl font-bold text-ink mb-4">
          Research areas
        </h1>

        <div className="flex gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active === cat
                  ? "bg-teal text-white"
                  : "border-[1.5px] border-[#C9C2AE] text-body"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No research projects to show yet.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`bg-surface border border-border ${
                borderStyles[p.status || ""] || "border-l-[#6B7280]"
              } border-l-4 rounded-xl p-4`}
            >
              <div className="font-bold text-sm text-ink mb-2">{p.title}</div>
              {p.status && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    statusStyles[p.status] || "bg-[#E5E5E0] text-body"
                  }`}
                >
                  {p.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}