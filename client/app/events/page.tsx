"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tabs = ["Upcoming", "Past events", "News"];

const upcomingEvents = [
  { day: "14", month: "SEP", title: "Annual research symposium", venue: "KU Auditorium" },
  { day: "28", month: "SEP", title: "Workshop on grant writing", venue: "Seminar Room 2" },
];

export default function EventsPage() {
  const [active, setActive] = useState("Upcoming");

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

        {active === "Upcoming" && (
          <div className="space-y-2.5">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.title}
                className="flex gap-4 items-center bg-surface border border-border border-l-4 border-l-teal rounded-xl px-4 py-3.5"
              >
                <div className="text-center w-11 flex-shrink-0">
                  <div className="font-serif-brand text-lg font-bold text-teal-dark">
                    {ev.day}
                  </div>
                  <div className="text-[10px] text-muted font-bold">
                    {ev.month}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm text-ink">
                    {ev.title}
                  </div>
                  <div className="text-xs text-muted font-medium">
                    {ev.venue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "Past events" && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No past events to show yet.
          </div>
        )}

        {active === "News" && (
          <div className="text-sm text-muted border border-dashed border-[#C9C2AE] rounded-xl p-8 text-center">
            No news articles to show yet.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}