"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getToken, getStoredUser } from "@/lib/auth";
import { getMyProfile, updateMyProfile, uploadAvatar, FullProfile } from "@/lib/api";

const roleStyles: Record<string, string> = {
  researcher: "bg-[#EFEBE0] text-muted",
  reviewer: "bg-teal-tint text-teal-dark",
  officer: "bg-gold-tint text-gold-dark",
};

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-sm text-ink">{value || "—"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<FullProfile>>({});
  const [photo, setPhoto] = useState<File | null>(null);
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
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  function startEdit() {
    if (!profile) return;
    setForm({
      name: profile.name,
      department: profile.department || "",
      designation: profile.designation || "",
      phone: profile.phone || "",
      researchInterests: profile.researchInterests || "",
      expertise: profile.expertise || "",
      profileLink: profile.profileLink || "",
      bio: profile.bio || "",
    });
    setPhoto(null);
    setSuccessMsg("");
    setEditing(true);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      let updated = (await updateMyProfile(form, token)).user as FullProfile;
      if (photo) {
        updated = await uploadAvatar(photo, token);
      }
      setProfile(updated);

      const stored = getStoredUser();
      if (stored) {
        localStorage.setItem(
          "kuric_user",
          JSON.stringify({ ...stored, name: updated.name })
        );
      }
      setEditing(false);
      setSuccessMsg("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
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
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-danger">
        {error || "Profile not found"}
      </div>
    );
  }

  const avatarUrl = profile.avatar
    ? "http://localhost:5000/uploads/" + encodeURIComponent(profile.avatar)
    : "";
  const isReviewer = profile.role === "reviewer";
  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-2xl mx-auto w-full">
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

        {/* Header card */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-5 flex items-center gap-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-teal-tint flex items-center justify-center font-serif-brand text-3xl font-bold text-teal-dark">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="font-serif-brand text-2xl font-bold text-ink">
              {profile.name}
            </div>
            <div className="text-sm text-muted mb-2">{profile.email}</div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                roleStyles[profile.role] || ""
              }`}
            >
              {profile.role}
            </span>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              className="bg-surface border-[1.5px] border-[#C9C2AE] text-ink text-xs font-semibold rounded-lg px-3.5 py-2 hover:bg-teal-tint transition-colors"
            >
              Edit profile
            </button>
          )}
        </div>

        {!editing ? (
          <>
            <div className="bg-surface border border-border rounded-xl p-6 mb-5">
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-4">
                Details
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Department" value={profile.department} />
                <Field label="Designation" value={profile.designation} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Profile link" value={profile.profileLink} />
                <Field label="Research interests" value={profile.researchInterests} />
                {isReviewer && (
                  <Field label="Area of expertise" value={profile.expertise} />
                )}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
                About
              </div>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {profile.bio || "No bio added yet."}
              </p>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-surface border border-border rounded-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Profile photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Full name</label>
                <input name="name" value={form.name || ""} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Department</label>
                <input name="department" value={form.department || ""} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Designation</label>
                <select name="designation" value={form.designation || ""} onChange={handleChange} className={inputClass + " bg-surface"}>
                  <option value="">Select...</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                <input name="phone" value={form.phone || ""} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Research interests</label>
              <input name="researchInterests" value={form.researchInterests || ""} onChange={handleChange} placeholder="e.g. Machine learning, water quality" className={inputClass} />
            </div>
            {isReviewer && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Area of expertise</label>
                <input name="expertise" value={form.expertise || ""} onChange={handleChange} placeholder="Used for AI reviewer matching" className={inputClass} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Profile link</label>
              <input name="profileLink" value={form.profileLink || ""} onChange={handleChange} placeholder="Google Scholar / ResearchGate / website" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bio</label>
              <textarea name="bio" value={form.bio || ""} onChange={handleChange} className={inputClass + " h-24 resize-none"} />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal hover:bg-teal-dark text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-surface border-[1.5px] border-[#C9C2AE] text-ink rounded-lg px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}