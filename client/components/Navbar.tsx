"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import { getStoredUser, logout } from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const menuByRole: Record<string, { label: string; href: string }[]> = {
  researcher: [
    { label: "My Proposals", href: "/proposals" },
    { label: "Submit Proposal", href: "/proposals/new" },
    { label: "My Funded Projects", href: "/proposals/funded" },
    { label: "Profile", href: "/profile" },
  ],
  reviewer: [
    { label: "Assigned Proposals", href: "/reviewer" },
    { label: "Profile", href: "/profile" },
  ],
  officer: [
    { label: "Dashboard", href: "/officer" },
    { label: "Content Management", href: "/officer/content" },
    { label: "Manage Funding", href: "/officer/funding" },
    { label: "User Management", href: "/officer/users" },
    { label: "Staff & Leadership", href: "/officer/staff" },
    { label: "Gallery Manager", href: "/officer/gallery" },
    { label: "Contact Inquiries", href: "/officer/inquiries" },
    { label: "Appeals", href: "/officer/appeals" },
    { label: "AI Reports", href: "/officer/reports" },
    { label: "Homepage Settings", href: "/officer/settings" },
    { label: "Profile", href: "/profile" },
  ],
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  }

  const roleMenu = user ? menuByRole[user.role] || [] : [];
  const itemClass =
    "block px-4 py-2.5 text-sm text-ink hover:bg-teal-tint transition-colors";

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-4 border-b border-border bg-surface">
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-teal" />
        <span className="font-serif-brand font-bold text-base text-ink">
          KURIC
        </span>
      </Link>

      {/* Wide screens: inline links */}
      <div className="hidden lg:flex gap-6 text-sm text-body font-medium">
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

      <div className="flex items-center gap-2 sm:gap-3">
        <SearchBar />
        {user && <NotificationBell />}
        {!user && (
          <Link
            href="/login"
            className="bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors whitespace-nowrap"
          >
            Log in
          </Link>
        )}

                <div
          className={`relative ${user ? "" : "lg:hidden"}`}
          ref={wrapperRef}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-teal-tint transition-colors text-xl font-bold text-ink"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            &#8943;
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 max-h-[75vh] overflow-y-auto bg-surface border border-border rounded-xl shadow-lg z-50">
              {user && (
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-semibold text-ink">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted capitalize">
                    {user.role}
                  </div>
                </div>
              )}

              {/* Site links: only inside the menu on small screens */}
              <div className="lg:hidden border-b border-border">
                <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                  Explore
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={itemClass}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {user && roleMenu.length > 0 && (
                <div>
                  <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    My workspace
                  </div>
                  {roleMenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={itemClass}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

             {user && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-tint transition-colors border-t border-border"
                >
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}