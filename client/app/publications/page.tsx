"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { IconBook } from "@/components/Icons";
import { getContent, ContentItem } from "@/lib/api";

export default function PublicationsPage() {
  const [publications, setPublications] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContent("publication")
      .then(setPublications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageHeader
        eyebrow="Library"
        title="Publications"
        subtitle="Browse scholarly work, journal articles, and research papers published by Khulna University faculty."
        icon={<IconBook />}
      />

      <div className="px-10 py-9 flex-1">
        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && publications.length === 0 && (
          <EmptyState message="No publications yet." hint="Check back soon." />
        )}

        {publications.length > 0 && (
          <div className="stagger bg-surface border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_0.6fr] px-4 py-2.5 text-[11.5px] text-muted font-bold bg-[#F0EEE6]">
              <span>Title</span>
              <span>Author(s)</span>
              <span>Year</span>
            </div>
            {publications.map((pub) => (
              <Link
                key={pub._id}
                href={`/events/${pub._id}`}
                className="grid grid-cols-[2fr_1fr_0.6fr] px-4 py-3.5 text-sm font-medium text-ink border-t border-border items-center hover:bg-teal-tint transition-colors"
              >
                <span>{pub.title}</span>
                <span className="text-body">{pub.authors || "—"}</span>
                <span className="text-body">{pub.year || "—"}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}