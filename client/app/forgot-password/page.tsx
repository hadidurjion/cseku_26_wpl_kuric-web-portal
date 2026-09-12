"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResetToken("");
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.resetToken) setResetToken(result.resetToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-teal" />
          <span className="font-serif-brand font-bold text-lg text-ink">
            KURIC
          </span>
        </div>

        <h1 className="font-serif-brand text-2xl font-bold text-teal-dark mb-1">
          Forgot password
        </h1>
        <p className="text-sm text-body mb-6">
          Enter your account email and we&apos;ll help you reset it.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {resetToken ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-teal bg-teal-tint text-teal-dark px-4 py-3 text-sm">
              In a production system this link would be emailed to you. For
              this demo, here is your reset token:
            </div>
            <div className="bg-[#F0EEE6] rounded-lg px-3 py-2 text-xs font-mono break-all">
              {resetToken}
            </div>
            <Link
              href={`/reset-password?token=${resetToken}`}
              className="inline-block bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              Continue to reset password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ku.ac.bd"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal hover:bg-teal-dark text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-body mt-6 text-center">
          <Link href="/login" className="text-teal-dark font-semibold">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}