"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { IconInfo } from "@/components/Icons";
import {
  getHomepageSettings,
  getStaff,
  HomepageSettings,
  StaffMember,
} from "@/lib/api";

function yr(d?: string | null) {
  return d ? new Date(d).getFullYear() : null;
}

function span(m: StaffMember) {
  return `${yr(m.startDate)} \u2013 ${yr(m.endDate) ?? "Present"}`;
}

function Person({ m, big }: { m: StaffMember; big?: boolean }) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-5 flex gap-4 ${
        big ? "border-l-4 border-l-gold" : ""
      }`}
    >
      <div
        className={`${
          big ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"
        } rounded-full bg-teal-tint text-teal-dark font-serif-brand font-bold flex items-center justify-center flex-shrink-0`}
      >
        {m.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-sm text-ink">{m.name}</div>
        <div className="text-xs text-teal-dark font-semibold mb-1">
          {m.designation}
        </div>
        {m.startDate && (
          <div className="text-xs text-muted">Since {yr(m.startDate)}</div>
        )}
        {m.email && (
          <a href={`mailto:${m.email}`} className="block text-xs text-body hover:underline truncate">
            {m.email}
          </a>
        )}
        {m.phone && (
          <a href={`tel:${m.phone}`} className="block text-xs text-body hover:underline">
            {m.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    getHomepageSettings().then(setSettings).catch(() => {});
    getStaff().then(setStaff).catch(() => {});
  }, []);

  const current = staff.filter((s) => !s.endDate);
  const director =
    current.find((s) => s.category === "director") ||
    (settings?.directorName
      ? ({
          _id: "fallback",
          name: settings.directorName,
          designation: settings.directorTitle || "Director",
          category: "director",
          startDate: "",
        } as StaffMember)
      : null);
  const team = current.filter((s) => s.category !== "director");
  const past = staff
    .filter((s) => s.endDate)
    .sort(
      (a, b) =>
        new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime()
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        eyebrow="About us"
        title="Our mission at KURIC"
        subtitle="Supporting research across Khulna University."
        icon={<IconInfo />}
      />

      <div className="px-10 py-9 flex-1 max-w-4xl w-full mx-auto">
        <Reveal>
          <p className="text-sm text-body leading-relaxed mb-8 max-w-2xl">
            {settings?.aboutMission ||
              "We advance research culture at Khulna University by supporting proposal development, funding pathways, and interdisciplinary collaboration across departments."}
          </p>
        </Reveal>

        {director && (
          <Reveal>
            <div className="text-[11px] tracking-widest uppercase text-muted font-bold mb-2.5">
              Leadership
            </div>
            <div className="max-w-md mb-8">
              <Person m={director} big />
            </div>
          </Reveal>
        )}

        {team.length > 0 && (
          <Reveal>
            <div className="text-[11px] tracking-widest uppercase text-muted font-bold mb-2.5">
              Staff
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {team.map((m) => (
                <Person key={m._id} m={m} />
              ))}
            </div>
          </Reveal>
        )}

        {past.length > 0 && (
          <Reveal>
            <div className="text-[11px] tracking-widest uppercase text-muted font-bold mb-2.5">
              Past leadership &amp; staff
            </div>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {past.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">{m.name}</div>
                    <div className="text-xs text-muted">{m.designation}</div>
                  </div>
                  <div className="text-xs font-semibold text-teal-dark">
                    {span(m)}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <Footer />
    </div>
  );
}