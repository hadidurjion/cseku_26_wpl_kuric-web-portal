"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { IconImage } from "@/components/Icons";
import { getGallery, fileUrl, GalleryImage } from "@/lib/api";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<GalleryImage | null>(null);

  useEffect(() => {
    getGallery()
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        eyebrow="Moments"
        title="Gallery"
        subtitle="Events, workshops and life at KURIC."
        icon={<IconImage />}
      />

      <div className="px-10 py-9 flex-1 max-w-5xl w-full mx-auto">
        {loading && <p className="text-sm text-muted">Loading...</p>}
        {!loading && images.length === 0 && (
          <EmptyState message="No photos yet." hint="Check back soon." />
        )}

        <div className="columns-2 md:columns-3 gap-4">
          {images.map((img, i) => (
            <Reveal key={img._id} delay={(i % 6) * 60} className="mb-4 break-inside-avoid">
              <button
                onClick={() => setOpen(img)}
                className="block w-full text-left rounded-xl overflow-hidden border border-border bg-surface hover:shadow-lg transition-shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl(img.image)} alt={img.caption || "Gallery photo"} className="w-full object-cover" />
                {img.caption && (
                  <div className="px-3 py-2 text-xs text-body">{img.caption}</div>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex flex-col items-center justify-center p-6"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fileUrl(open.image)} alt={open.caption || ""} className="max-h-[80vh] max-w-full rounded-xl" />
          {open.caption && <p className="text-white text-sm mt-3">{open.caption}</p>}
          <p className="text-white/60 text-xs mt-2">Click anywhere to close</p>
        </div>
      )}

      <Footer />
    </div>
  );
}