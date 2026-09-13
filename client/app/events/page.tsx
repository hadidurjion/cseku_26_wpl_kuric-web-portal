"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContent, ContentItem } from "@/lib/api";

const tabs = ["Upcoming", "News"];

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1">
        <h1 className="font-serif-brand text-xl font-bold text-ink mb-4">
          Events &amp; news
        </h1>

        <div className="flex gap-2 mb-5">
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

        {active === "Upcoming" && !loading && (
          <div className="space-y-2.5">
            {events.length === 0 && (
              <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
                No events to show yet.
              </div>
            )}
            {events.map((ev) => {
              const date = ev.date ? new Date(ev.date) : null;
              return (
                <div
                  key={ev._id}
                  className="flex gap-4 items-center bg-surface border border-border border-l-4 border-l-teal rounded-xl px-4 py-3.5"
                >
                  {date && (
                    <div className="text-center w-11 flex-shrink-0">
                      <div className="font-serif-brand text-lg font-bold text-teal-dark">
                        {date.getDate()}
                      </div>
                      <div className="text-[10px] text-muted font-bold">
                        {date.toLocaleString("default", { month: "short" }).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-ink">
                      {ev.title}
                    </div>
                    <div className="text-xs text-muted font-medium">
                      {ev.location || ev.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {active === "News" && !loading && (
          <div className="space-y-2.5">
            {news.length === 0 && (
              <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
                No news articles to show yet.
              </div>
            )}
            {news.map((item) => (
              <div
                key={item._id}
                className="bg-surface border border-border border-l-4 border-l-gold rounded-xl px-4 py-3.5"
              >
                <div className="font-bold text-sm text-ink">{item.title}</div>
                <div className="text-xs text-muted font-medium mt-1">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}