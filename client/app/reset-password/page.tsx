"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api";
import AuthShell from "@/components/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccessMsg("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your new password below."
    >
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-teal-dark text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="text-sm text-body mt-6 text-center">
        <Link href="/login" className="text-teal-dark font-semibold">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}