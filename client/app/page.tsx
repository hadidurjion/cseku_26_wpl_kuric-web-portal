"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHomepageSettings, getContent, HomepageSettings, ContentItem } from "@/lib/api";

const defaultSettings: HomepageSettings = {
  tagline: "Where proposals become projects.",
  activeProjectsCount: "128",
  publicationsCount: "340",
  fundedAmount: "৳4.2Cr",
};

export default function HomePage() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings);
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    getHomepageSettings().then(setSettings).catch(() => {});

    Promise.all([
      getContent("event"),
      getContent("news"),
      getContent("publication"),
    ]).then(([events, news, pubs]) => {
      const tagged = [
        ...events.map((e) => ({ ...e, tagLabel: "Event", tagColor: "text-teal-dark", border: "border-teal" })),
        ...news.map((n) => ({ ...n, tagLabel: "News", tagColor: "text-gold-dark", border: "border-gold" })),
        ...pubs.map((p) => ({ ...p, tagLabel: "Publication", tagColor: "text-[#4B5563]", border: "border-[#6B7280]" })),
      ];
      tagged.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setItems(tagged.slice(0, 3));
    });
  }, []);

  const stats = [
    { value: settings.activeProjectsCount, label: "Active projects", color: "text-teal-dark" },
    { value: settings.publicationsCount, label: "Publications", color: "text-teal-dark" },
    { value: settings.fundedAmount, label: "Funded to date", color: "text-gold-dark" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div
        className="text-center px-10 pt-14 pb-11"
        style={{
          background: "radial-gradient(ellipse at 50% -10%, #DCEEE9 0%, #FAF8F3 60%)",
        }}
      >
        <div className="text-[11.5px] tracking-widest uppercase text-muted font-bold mb-3.5">
          Khulna University
        </div>
        <div className="font-serif-brand text-2xl font-semibold text-body mb-1">
          Research and Innovation Center
        </div>
        <h1 className="font-serif-brand text-4xl md:text-5xl font-bold text-teal-dark leading-tight max-w-xl mx-auto mb-4">
          {settings.tagline}
        </h1>
        <p className="text-sm text-body max-w-md mx-auto mb-6 leading-relaxed">
          Submit, review, and track research at Khulna University — all in one place.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/proposals/new"
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
          >
            Submit a proposal
          </a>
          <a
            href="/research"
            className="bg-surface text-ink border-[1.5px] border-[#C9C2AE] rounded-lg px-6 py-3 text-sm font-semibold hover:bg-teal-tint transition-colors"
          >
            Explore research
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface text-center py-6 px-5">
            <div className={`font-serif-brand text-3xl font-bold ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-body font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-10 py-9 flex-1">
        <div className="flex justify-between items-baseline mb-4">
          <div className="font-serif-brand text-lg font-bold text-ink">
            Latest from the center
          </div>
          <a href="/events" className="text-xs text-teal-dark font-semibold cursor-pointer">
            View all →
          </a>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted">Nothing to show yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className={`bg-surface border border-border ${item.border} border-l-4 rounded-lg p-4`}
              >
                <div className={`text-[11px] tracking-wide uppercase font-bold mb-2 ${item.tagColor}`}>
                  {item.tagLabel}
                </div>
                <div className="text-sm font-semibold text-ink leading-snug mb-1.5">
                  {item.title}
                </div>
                <div className="text-xs text-muted font-medium">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}