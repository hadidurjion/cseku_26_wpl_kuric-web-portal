"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["All", "ICT", "Environment", "Health"];

const projects = [
  {
    title: "AI in agriculture",
    category: "ICT",
    status: "Ongoing",
    statusColor: "bg-teal-tint text-teal-dark",
    border: "border-l-teal",
  },
  {
    title: "Coastal water quality",
    category: "Environment",
    status: "Funded",
    statusColor: "bg-gold-tint text-gold-dark",
    border: "border-l-gold",
  },
  {
    title: "Rural health access",
    category: "Health",
    status: "Completed",
    statusColor: "bg-[#E5E5E0] text-body",
    border: "border-l-[#6B7280]",
  },
];

export default function ResearchPage() {
  const [active, setActive] = useState("All");

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {filtered.map((p) => (
            <div
              key={p.title}
              className={`bg-surface border border-border ${p.border} border-l-4 rounded-xl p-4`}
            >
              <div className="font-bold text-sm text-ink mb-2">
                {p.title}
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.statusColor}`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}