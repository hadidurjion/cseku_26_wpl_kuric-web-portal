import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-6 px-10 text-center text-xs text-muted flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        &copy; {new Date().getFullYear()} {siteConfig.institutionName} {siteConfig.centerName}
      </div>
      <div className="flex gap-6">
        <Link href="/about" className="hover:text-teal-dark">About</Link>
        <Link href="/contact" className="hover:text-teal-dark">Contact</Link>
        <Link href="/publications" className="hover:text-teal-dark">Publications</Link>
      </div>
    </footer>
  );
}