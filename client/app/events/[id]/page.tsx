"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContentItem, ContentItem } from "@/lib/api";

const typeLabels: Record<string, string> = {
  event: "Event",
  news: "News",
  publication: "Publication",
  research: "Research",
};

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getContentItem(id)
      .then(setItem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-danger">
        {error || "Not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl mx-auto w-full">
        <div className="text-[11px] tracking-widest uppercase text-teal-dark font-bold mb-2">
          {typeLabels[item.type] || item.type}
        </div>
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-3">
          {item.title}
        </h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted font-medium mb-6">
          {item.date && <span>📅 {new Date(item.date).toLocaleDateString()}</span>}
          {item.location && <span>📍 {item.location}</span>}
          {item.authors && <span>✍️ {item.authors}</span>}
          {item.year && <span>{item.year}</span>}
        </div>

        {item.description && (
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}