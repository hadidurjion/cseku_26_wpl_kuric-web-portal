"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Thumb from "@/components/Thumb";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { IconCalendar } from "@/components/Icons";
import { getContent, ContentItem } from "@/lib/api";

const tabs = ["Upcoming", "Past events", "News"];

function TimelineItem({ ev, index }: { ev: ContentItem; index: number }) {
  const date = ev.date ? new Date(ev.date) : null;
  return (
    <Reveal delay={index * 80} className="relative">
      <span className="absolute -left-[40px] top-5 w-3.5 h-3.5 rounded-full bg-teal border-4 border-bg" />
      <Link
        href={`/events/${ev._id}`}
        className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-teal hover:shadow-md transition-all"
      >
        <Thumb image={ev.image} title={ev.title} type="Event" className="h-28" />
        <div className="flex gap-4 items-center px-4 py-3.5">
          {date && (
            <div className="text-center w-12 flex-shrink-0">
              <div className="font-serif-brand text-xl font-bold text-teal-dark">
                {date.getDate()}
              </div>
              <div className="text-[10px] text-muted font-bold">
                {date
                  .toLocaleString("default", { month: "short" })
                  .toUpperCase()}{" "}
                {date.getFullYear()}
              </div>
            </div>
          )}
          <div>
            <div className="font-bold text-sm text-ink">{ev.title}</div>
            <div className="text-xs text-muted font-medium">
              {ev.location || ev.description}
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function EventsPage() {
  const [active, setActive] = useState("Upcoming");
  const [events, setEvents] = useState<ContentItem[]>([]);
  const [news, setNews] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getContent("event"), getContent("news")])
      .then(([ev, nw]) => {
        setEvents(ev);
        setNews(nw);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((e) => !e.date || new Date(e.date) >= today)
    .sort(
      (a, b) =>
        new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );
  const past = events
    .filter((e) => e.date && new Date(e.date) < today)
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

  const timelineList = active === "Upcoming" ? upcoming : past;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <PageHeader
        eyebrow="What's on"
        title="Events & news"
        subtitle="Seminars, workshops and announcements."
        icon={<IconCalendar />}
      />

      <div className="px-10 py-9 flex-1 max-w-3xl w-full mx-auto">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active === tab
                  ? "bg-teal text-white"
                  : "border-[1.5px] border-[#C9C2AE] text-body"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && active !== "News" && (
          <>
            {timelineList.length === 0 ? (
              <EmptyState
                message={`No ${active === "Upcoming" ? "upcoming" : "past"} events to show.`}
                hint="Check back soon."
              />
            ) : (
              <div className="relative border-l-2 border-teal-tint ml-4 pl-8 space-y-5">
                {timelineList.map((ev, i) => (
                  <TimelineItem key={ev._id} ev={ev} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && active === "News" && (
          <div className="space-y-3">
            {news.length === 0 ? (
              <EmptyState message="No news articles to show yet." hint="Check back soon." />
            ) : (
              news.map((item, i) => (
                <Reveal key={item._id} delay={i * 80}>
                  <Link
                    href={`/events/${item._id}`}
                    className="block bg-surface border border-border border-l-4 border-l-gold rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Thumb
                      image={item.image}
                      title={item.title}
                      type="News"
                      className="h-28"
                    />
                    <div className="px-4 py-3.5">
                      <div className="font-bold text-sm text-ink">{item.title}</div>
                      <div className="text-xs text-muted font-medium mt-1">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}