import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import TenantProvider from "@/components/TenantProvider";
import { siteConfig } from "@/lib/siteConfig";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  variable: "--font-fraunces",
  weight: "500 800",
});

export const metadata: Metadata = {
  title: `${siteConfig.shortName} Web Portal - ${siteConfig.centerName}`,
  description: `${siteConfig.institutionName} ${siteConfig.centerName}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <TenantProvider>
          {children}
          <ChatbotWidget />
        </TenantProvider>
      </body>
    </html>
  );
}



