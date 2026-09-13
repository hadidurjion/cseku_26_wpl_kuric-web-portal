"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

      <div className="px-10 py-9 flex-1">
        <h1 className="font-serif-brand text-xl font-bold text-ink mb-4">
          Publications
        </h1>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && publications.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No publications yet.
          </div>
        )}

        {publications.length > 0 && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_0.6fr] px-4 py-2.5 text-[11.5px] text-muted font-bold bg-[#F0EEE6]">
              <span>Title</span>
              <span>Author(s)</span>
              <span>Year</span>
            </div>
            {publications.map((pub) => (
              <div
                key={pub._id}
                className="grid grid-cols-[2fr_1fr_0.6fr] px-4 py-3.5 text-sm font-medium text-ink border-t border-border items-center"
              >
                <span>{pub.title}</span>
                <span className="text-body">{pub.authors || "—"}</span>
                <span className="text-body">{pub.year || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}