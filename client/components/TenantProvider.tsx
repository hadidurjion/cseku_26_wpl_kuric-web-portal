"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/siteConfig";

const KEY = "kuric_institution";
const CACHE = "kuric_branding";
const API = "http://localhost:5000/api";
const DEFAULT_TAGLINE = "Where proposals become projects.";

export function getInstitutionSlug(): string {
  try {
    return localStorage.getItem(KEY) || "ku";
  } catch {
    return "ku";
  }
}

function darken(hex: string, f = 0.78) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

function tint(hex: string, f = 0.86) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * f));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

// Add the x-institution header to every API request (runs once, on load)
if (typeof window !== "undefined" && !(window as any).__tenantFetch) {
  (window as any).__tenantFetch = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes(":5000/api")) {
      const headers = new Headers(
        init?.headers || (input instanceof Request ? input.headers : undefined)
      );
      headers.set("x-institution", getInstitutionSlug());
      return orig(input, { ...init, headers });
    }
    return orig(input, init);
  };
}

function applyBranding(i: any) {
  const root = document.documentElement;
  if (i.primaryColor) {
    root.style.setProperty("--color-teal", i.primaryColor);
    root.style.setProperty("--color-teal-dark", darken(i.primaryColor));
    root.style.setProperty("--color-teal-tint", tint(i.primaryColor));
  }
  if (i.accentColor) root.style.setProperty("--color-gold", i.accentColor);

  const uni = String(i.name || "").replace(/\s+(Research.*|RIC)$/i, "") || i.name;
  Object.assign(siteConfig, {
    shortName: `${i.shortName}RIC`,
    institutionName: uni,
    tagline: i.tagline || DEFAULT_TAGLINE,
    description: `Submit, review, and track research at ${uni} - all in one place.`,
  });
  document.title = `${siteConfig.shortName} Web Portal - ${siteConfig.centerName}`;
}

export default function TenantProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // ?ric=ru in the URL switches the RIC (and logs out of the old one)
    const q = new URLSearchParams(window.location.search).get("ric");
    if (q) {
      const next = q.toLowerCase();
      try {
        if (next !== localStorage.getItem(KEY)) {
          localStorage.removeItem("kuric_token");
          localStorage.removeItem("kuric_user");
          localStorage.removeItem(CACHE);
          localStorage.setItem(KEY, next);
        }
      } catch {}
    }

    const slug = getInstitutionSlug();
    let cached: any = null;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE) || "null");
    } catch {}
    if (cached && cached.slug === slug) {
      applyBranding(cached);
      setReady(true);
    }

    fetch(`${API}/institutions/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.institution) {
          const changed = JSON.stringify(d.institution) !== JSON.stringify(cached);
          try {
            localStorage.setItem(CACHE, JSON.stringify(d.institution));
          } catch {}
          applyBranding(d.institution);
          if (changed) setVersion((v) => v + 1);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <Fragment key={version}>{children}</Fragment>;
}
