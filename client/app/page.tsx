import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "128", label: "Active projects", color: "text-teal-dark" },
  { value: "340", label: "Publications", color: "text-teal-dark" },
  { value: "৳4.2Cr", label: "Funded to date", color: "text-gold-dark" },
];

const news = [
  {
    tag: "Event",
    tagColor: "text-teal-dark",
    border: "border-teal",
    title: "Annual research symposium announced",
    date: "14 Sep 2026",
  },
  {
    tag: "Funding",
    tagColor: "text-gold-dark",
    border: "border-gold",
    title: "Grant call opens for AI research",
    date: "10 Aug 2026",
  },
  {
    tag: "Publication",
    tagColor: "text-[#4B5563]",
    border: "border-[#6B7280]",
    title: "New study on coastal water quality",
    date: "3 Aug 2026",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div
        className="text-center px-10 pt-14 pb-11"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, #DCEEE9 0%, #FAF8F3 60%)",
        }}
      >
        <div className="text-[11.5px] tracking-widest uppercase text-muted font-bold mb-3.5">
          Khulna University
        </div>
        <div className="font-serif-brand text-2xl font-semibold text-body mb-1">
          Research and Innovation Center
        </div>
        <h1 className="font-serif-brand text-4xl md:text-5xl font-bold text-teal-dark leading-tight max-w-xl mx-auto mb-4">
          Where proposals become projects.
        </h1>
        <p className="text-sm text-body max-w-md mx-auto mb-6 leading-relaxed">
          Submit, review, and track research at Khulna University — all in
          one place.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-teal hover:bg-teal-dark text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors">
            Submit a proposal
          </button>
          <button className="bg-surface text-ink border-[1.5px] border-[#C9C2AE] rounded-lg px-6 py-3 text-sm font-semibold hover:bg-teal-tint transition-colors">
            Explore research
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface text-center py-6 px-5">
            <div className={`font-serif-brand text-3xl font-bold ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-body font-medium mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="px-10 py-9 flex-1">
        <div className="flex justify-between items-baseline mb-4">
          <div className="font-serif-brand text-lg font-bold text-ink">
            Latest from the center
          </div>
          <span className="text-xs text-teal-dark font-semibold cursor-pointer">
            View all →
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((item) => (
            <div
              key={item.title}
              className={`bg-surface border border-border ${item.border} border-l-4 rounded-lg p-4`}
            >
              <div
                className={`text-[11px] tracking-wide uppercase font-bold mb-2 ${item.tagColor}`}
              >
                {item.tag}
              </div>
              <div className="text-sm font-semibold text-ink leading-snug mb-1.5">
                {item.title}
              </div>
              <div className="text-xs text-muted font-medium">
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}