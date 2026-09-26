"use client";

import { useState, useRef, useEffect } from "react";
import { searchContent, ContentItem } from "@/lib/api";
import Link from "next/link";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setLoading(true);
      searchContent(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const typeLabels: Record<string, string> = {
    event: "Event",
    news: "News",
    publication: "Publication",
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-teal-tint transition-colors"
        aria-label="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, publications, events..."
            className="w-full px-4 py-3 text-sm outline-none border-b border-border rounded-t-xl"
          />
          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <p className="px-4 py-3 text-xs text-muted">Searching...</p>
            )}
            {!loading && query && results.length === 0 && (
              <p className="px-4 py-3 text-xs text-muted">No results found.</p>
            )}
            {results.map((item) => {
              const typeToPage: Record<string, string> = {
                event: "/events",
                news: "/events",
                publication: "/publications",
              };
              return (
                <Link
                  key={item._id}
                  href={typeToPage[item.type] || "/"}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-b border-border last:border-b-0 hover:bg-teal-tint transition-colors"
                >
                  <span className="text-[10px] font-bold text-teal-dark uppercase tracking-wide">
                    {typeLabels[item.type]}
                  </span>
                  <div className="text-sm font-semibold text-ink">
                    {item.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}