"use client";

import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-7 py-4 border-b border-border bg-surface">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-teal" />
        <span className="font-serif-brand font-bold text-base text-ink">
          KURIC
        </span>
      </Link>

      <div className="hidden md:flex gap-6 text-sm text-body font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-teal-dark transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        href="/register"
        className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        Submit proposal
      </Link>
    </div>
  );
}