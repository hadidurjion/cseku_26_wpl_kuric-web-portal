"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser(form);
      if (result.token) {
        localStorage.setItem("kuric_token", result.token);
        localStorage.setItem("kuric_user", JSON.stringify(result.user));
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your proposals.">
      {error && (
        <div className="mb-4 rounded-lg border border-danger bg-danger-tint text-danger px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="new-email"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            placeholder="you@ku.ac.bd"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            placeholder="Your password"
          />
        </div>
        <div className="text-right -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs text-teal-dark font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-teal-dark text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-body mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-dark font-semibold">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}