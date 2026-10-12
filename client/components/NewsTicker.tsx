"use client";

import Link from "next/link";

interface TickerItem {
  _id: string;
  title: string;
  tagLabel: string;
}

export default function NewsTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;
  const loop = Array.from({ length: 4 }, () => items).flat();

  return (
    <div className="flex items-center bg-teal-dark text-white text-xs overflow-hidden">
      <div className="flex-shrink-0 bg-gold text-ink font-bold uppercase tracking-wide px-4 py-2.5 z-10">
        Latest
      </div>
      <div className="ticker-viewport flex-1 overflow-hidden">
        <div className="ticker-track flex whitespace-nowrap py-2.5">
          {loop.map((item, i) => (
            <Link
              key={item._id + "-" + i}
              href={`/events/${item._id}`}
              className="px-6 hover:underline"
            >
              <span className="font-bold text-gold-tint mr-2">
                {item.tagLabel}
              </span>
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}