import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-dark via-teal to-teal-dark text-white p-12">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          className="float-slow absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(200,155,60,0.30)" }}
        />
        <div
          className="float-slow-2 absolute -bottom-24 -right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.12)" }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/90" />
          <span className="font-serif-brand font-bold text-xl">KURIC</span>
        </Link>

        <div className="relative z-10">
          <div className="text-[11px] tracking-widest uppercase font-bold text-gold-tint mb-3">
            Khulna University
          </div>
          <h2 className="font-serif-brand text-4xl font-bold leading-tight mb-4">
            Research and Innovation Center
          </h2>
          <p className="text-white/80 text-sm max-w-sm leading-relaxed">
            Submit proposals, follow reviews, and track funded research, all in
            one place.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          &copy; Khulna University
        </div>
      </div>

      <div className="flex items-center justify-center bg-bg px-6 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-md bg-teal" />
            <span className="font-serif-brand font-bold text-lg text-ink">
              KURIC
            </span>
          </Link>
          <h1 className="font-serif-brand text-3xl font-bold text-teal-dark mb-1">
            {title}
          </h1>
          <p className="text-sm text-body mb-6">{subtitle}</p>
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}