"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getGallery,
  uploadGalleryImages,
  deleteGalleryImage,
  fileUrl,
  GalleryImage,
} from "@/lib/api";

export default function GalleryManagerPage() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function load() {
    getGallery().then(setImages).catch((e) => setError(e.message));
  }

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
    load();
  }, [router]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || files.length === 0) return;
    setUploading(true);
    setError("");
    setSuccessMsg("");
    try {
      await uploadGalleryImages(files, caption, token);
      setSuccessMsg(`${files.length} photo(s) added to the gallery.`);
      setFiles([]);
      setCaption("");
      (document.getElementById("gallery-files") as HTMLInputElement).value = "";
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    if (!confirm("Remove this photo from the gallery?")) return;
    await deleteGalleryImage(id, token);
    setImages((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="px-10 py-9 flex-1 max-w-4xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Gallery Manager
        </h1>
        <p className="text-sm text-body mb-6">
          Photos you upload appear on the public Gallery page automatically.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-teal bg-teal-tint text-teal-dark px-4 py-2 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-3">
          <input
            id="gallery-files"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="text-sm"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional, applies to all selected photos)"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
          >
            {uploading ? "Uploading..." : `Upload ${files.length || ""} photo(s)`}
          </button>
        </form>

        {images.length === 0 ? (
          <EmptyState message="No photos uploaded yet." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img._id} className="relative group rounded-xl overflow-hidden border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl(img.image)} alt={img.caption || ""} className="w-full h-32 object-cover" />
                <button
                  onClick={() => handleDelete(img._id)}
                  className="absolute top-2 right-2 bg-danger text-white text-[11px] font-semibold rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
                {img.caption && (
                  <div className="px-2 py-1.5 text-[11px] text-body truncate">{img.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}