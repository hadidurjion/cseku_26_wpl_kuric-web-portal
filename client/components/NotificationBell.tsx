"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  getNotifications,
  markNotificationsRead,
  NotificationItem,
} from "@/lib/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    setLoggedIn(!!user);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const token = getToken();
    if (!token) return;

    function load() {
      getNotifications(token!)
        .then((data) => {
          setItems(data.notifications);
          setUnread(data.unreadCount);
        })
        .catch(() => {});
    }

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      const token = getToken();
      if (token) {
        await markNotificationsRead(token);
        setUnread(0);
      }
    }
  }

  if (!loggedIn) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-teal-tint transition-colors"
        aria-label="Notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold text-ink">
            Notifications
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted text-center">
              No notifications yet.
            </p>
          ) : (
            items.map((n) => (
              <Link
                key={n._id}
                href={n.link || "#"}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 border-b border-border last:border-b-0 hover:bg-teal-tint transition-colors"
              >
                <p className="text-sm text-ink">{n.message}</p>
                <p className="text-xs text-muted mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}