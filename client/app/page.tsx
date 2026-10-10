"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsTicker from "@/components/NewsTicker";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import { IconChip, IconLeaf, IconHeart } from "@/components/Icons";
import Thumb from "@/components/Thumb";
import {
  getHomepageSettings,
  getContent,
  getPublicStats,
  ContentItem,
  PublicStats,
} from "@/lib/api";

type Item = ContentItem & { createdAt?: string; category?: string };
type Tagged = Item & { tagLabel: string; tagColor: string; border: string };

const disciplines = [
  { name: "ICT", span: "md:col-span-2", style: "bg-teal text-white", sub: "text-teal-tint", icon: <IconChip /> },
  { name: "Environment", span: "", style: "bg-gold-tint text-gold-dark", sub: "text-gold-dark", icon: <IconLeaf /> },
  { name: "Health", span: "", style: "bg-teal-tint text-teal-dark", sub: "text-teal-dark", icon: <IconHeart /> },
];

export default function HomePage() {
  const [tagline, setTagline] = useState("Where proposals become projects.");
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [items, setItems] = useState<Tagged[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getHomepageSettings()
      .then((s) => setTagline(s.tagline))
      .catch(() => {});
    getPublicStats().then(setStats).catch(() => {});

    Promise.all([
      getContent("event"),
      getContent("news"),
      getContent("publication"),
      getContent("research"),
    ])
      .then(([events, news, pubs, research]) => {
        const tagged: Tagged[] = [
          ...(events as Item[]).map((e) => ({ ...e, tagLabel: "Event", tagColor: "text-teal-dark", border: "border-teal" })),
          ...(news as Item[]).map((n) => ({ ...n, tagLabel: "News", tagColor: "text-gold-dark", border: "border-gold" })),
          ...(pubs as Item[]).map((p) => ({ ...p, tagLabel: "Publication", tagColor: "text-[#4B5563]", border: "border-[#6B7280]" })),
        ];
        tagged.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setItems(tagged);

        const c: Record<string, number> = {};
        (research as Item[]).forEach((r) => {
          if (r.category) c[r.category] = (c[r.category] || 0) + 1;
        });
        setCounts(c);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { end: stats?.totalProposals ?? 0, prefix: "", label: "Total submissions", color: "text-teal-dark" },
    { end: stats?.activeProjects ?? 0, prefix: "", label: "Active funded projects", color: "text-teal-dark" },
    { end: stats?.publications ?? 0, prefix: "", label: "Publications", color: "text-teal-dark" },
    { end: stats?.fundedAmount ?? 0, prefix: "\u09F3", label: "Funded to date", color: "text-gold-dark" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <NewsTicker
        items={items.slice(0, 8).map((i) => ({
          _id: i._id,
          title: i.title,
          tagLabel: i.tagLabel,
        }))}
      />

      {/* Hero */}
      <div
        className="relative overflow-hidden text-center px-10 pt-16 pb-14"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, #DCEEE9 0%, #FAF8F3 60%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(14,110,92,0.14) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          className="float-slow absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(14,110,92,0.16)" }}
        />
        <div
          className="float-slow-2 absolute -bottom-20 -right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(200,155,60,0.20)" }}
        />

        <div className="relative z-10">
          <div className="text-[11.5px] tracking-widest uppercase text-muted font-bold mb-3.5">
            Khulna University
          </div>
          <div className="font-serif-brand text-2xl font-semibold text-body mb-1">
            Research and Innovation Center
          </div>
          <h1 className="font-serif-brand text-4xl md:text-5xl font-bold text-teal-dark leading-tight max-w-xl mx-auto mb-4">
            {tagline}
          </h1>
          <p className="text-sm text-body max-w-md mx-auto mb-6 leading-relaxed">
            Submit, review, and track research at Khulna University &mdash; all
            in one place.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/proposals/new"
              className="bg-teal hover:bg-teal-dark text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
            >
              Submit a proposal
            </Link>
            <Link
              href="/research"
              className="bg-surface text-ink border-[1.5px] border-[#C9C2AE] rounded-lg px-6 py-3 text-sm font-semibold hover:bg-teal-tint transition-colors"
            >
              Explore research
            </Link>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {statCards.map((s) => (
          <div key={s.label} className="bg-surface text-center py-6 px-4">
            <div className={`font-serif-brand text-2xl md:text-3xl font-bold ${s.color}`}>
              <CountUp end={s.end} prefix={s.prefix} />
            </div>
            <div className="text-xs text-body font-medium mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bento: research areas */}
      <div className="px-10 pt-10">
        <Reveal>
          <div className="font-serif-brand text-lg font-bold text-ink mb-4">
            Research areas
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {disciplines.map((d, i) => (
            <Reveal key={d.name} delay={i * 100} className={d.span}>
              <Link
                href="/research"
                className={`block h-full min-h-[120px] rounded-2xl p-6 ${d.style} hover:shadow-lg transition-shadow`}
              >
                <div className="mb-3 opacity-90">{d.icon}</div>
                <div className="font-serif-brand text-xl font-bold">
                  {d.name}
                </div>
                <div className={`text-sm mt-1 ${d.sub}`}>
                  {counts[d.name] ?? 0} project
                  {(counts[d.name] ?? 0) === 1 ? "" : "s"}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Latest */}
      <div className="px-10 py-10 flex-1">
        <Reveal>
          <div className="flex justify-between items-baseline mb-4">
            <div className="font-serif-brand text-lg font-bold text-ink">
              Latest from the center
            </div>
            <Link href="/events" className="text-xs text-teal-dark font-semibold">
              View all &rarr;
            </Link>
          </div>
        </Reveal>

        {items.length === 0 ? (
          <p className="text-sm text-muted">Nothing to show yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.slice(0, 3).map((item, i) => (
              <Reveal key={item._id} delay={i * 100}>
                <Link
                  href={`/events/${item._id}`}
                  className={`block h-full bg-surface border border-border ${item.border} border-l-4 rounded-lg overflow-hidden hover:shadow-md transition-shadow`}
                >
                  <Thumb
                    image={item.image}
                    title={item.title}
                    type={item.tagLabel}
                    className="h-32"
                  />
                  <div className="p-4">
                    <div className={`text-[11px] tracking-wide uppercase font-bold mb-2 ${item.tagColor}`}>
                      {item.tagLabel}
                    </div>
                    <div className="text-sm font-semibold text-ink leading-snug mb-1.5">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted font-medium">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}