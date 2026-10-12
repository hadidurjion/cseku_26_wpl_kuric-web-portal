"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getInquiries, markInquiryRead, Inquiry } from "@/lib/api";

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    getInquiries(token)
      .then(setInquiries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          Contact Inquiries
        </h1>
        <p className="text-sm text-body mb-6">
          Messages submitted through the public Contact form.
        </p>

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {!loading && inquiries.length === 0 && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No inquiries yet.
          </div>
        )}

        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq._id}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex justify-between items-baseline mb-2">
                <div className="text-sm font-semibold text-ink">
                  {inq.name}{" "}
                  <span className="text-muted font-normal">
                    ({inq.email})
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {new Date(inq.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-sm text-ink leading-relaxed mb-3">
                {inq.message}
              </p>
              <div className="flex gap-3">
                <a
                  href={`mailto:${inq.email}?subject=Re: Your inquiry to KURIC&body=Hi ${inq.name},%0D%0A%0D%0A`}
                  className="text-xs font-semibold text-teal-dark hover:underline"
                >
                  Reply by email
                </a>
                <button
                  onClick={async () => {
                    const token = getToken();
                    if (!token) return;
                    await markInquiryRead(inq._id, token);
                    setInquiries((prev) =>
                      prev.map((i) => (i._id === inq._id ? { ...i, read: true } : i))
                    );
                  }}
                  className="text-xs font-semibold text-muted hover:underline"
                >
                  Mark as read
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}