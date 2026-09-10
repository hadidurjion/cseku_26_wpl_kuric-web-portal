"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getMyProfile, updateMyProfile, FullProfile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const token = getToken();
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    getMyProfile(token)
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setDepartment(p.department || "");
        setBio(p.bio || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      const result = await updateMyProfile({ name, department, bio }, token);
      setSuccessMsg("Profile updated successfully.");
      // Keep localStorage user in sync
      const stored = getStoredUser();
      if (stored) {
        localStorage.setItem(
          "kuric_user",
          JSON.stringify({ ...stored, name: result.user.name })
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-xl mx-auto w-full">
        <h1 className="font-serif-brand text-2xl font-bold text-ink mb-1">
          My Profile
        </h1>
        <p className="text-sm text-body mb-6">
          Update your personal information.
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

        <div className="bg-surface border border-border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-tint flex items-center justify-center font-serif-brand text-xl font-bold text-teal-dark">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-sm text-ink">
                {profile?.email}
              </div>
              <div className="text-xs text-muted font-medium mt-0.5 capitalize">
                {profile?.role} · {profile?.designation}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Department
            </label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself"
              className="w-full h-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}