import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1 max-w-3xl">
        <div className="text-[11px] tracking-widest uppercase text-muted font-bold mb-2">
          About us
        </div>
        <h1 className="font-serif-brand text-3xl font-bold text-teal-dark mb-4">
          Our mission at KURIC
        </h1>
        <p className="text-sm text-body leading-relaxed mb-7 max-w-xl">
          We advance research culture at Khulna University by supporting
          proposal development, funding pathways, and interdisciplinary
          collaboration across departments.
        </p>

        <div className="flex items-center gap-4 bg-surface border border-border border-l-4 border-l-gold rounded-xl p-4 mb-7 max-w-md">
          <div className="w-14 h-14 rounded-full bg-teal-tint flex-shrink-0" />
          <div>
            <div className="font-bold text-sm text-ink">
              Dr. Kazi Masudul Alam
            </div>
            <div className="text-xs text-muted font-medium mt-0.5">
              Director, KURIC
            </div>
          </div>
        </div>

        <div className="text-[11px] tracking-widest uppercase text-muted font-bold mb-2.5">
          Organizational structure
        </div>
        <div className="h-24 bg-surface border-[1.5px] border-dashed border-[#C9C2AE] rounded-xl flex items-center justify-center text-xs text-muted">
          Organogram coming soon
        </div>
      </div>

      <Footer />
    </div>
  );
}