import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const publications = [
  {
    title: "Groundwater contamination patterns",
    authors: "Rahman et al.",
    year: "2025",
  },
  {
    title: "Machine learning for crop yield",
    authors: "Tamanna, S.",
    year: "2024",
  },
];

export default function PublicationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="px-10 py-9 flex-1">
        <h1 className="font-serif-brand text-xl font-bold text-ink mb-4">
          Publications
        </h1>

        <div className="flex gap-2 mb-4">
          <select className="h-9 border-[1.5px] border-[#C9C2AE] rounded-lg text-xs px-2.5 bg-surface text-ink">
            <option>Year</option>
          </select>
          <select className="h-9 border-[1.5px] border-[#C9C2AE] rounded-lg text-xs px-2.5 bg-surface text-ink">
            <option>Author</option>
          </select>
          <input
            placeholder="Search publications"
            className="h-9 border-[1.5px] border-[#C9C2AE] rounded-lg text-xs px-3 flex-1 bg-surface"
          />
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_0.6fr_0.5fr] px-4 py-2.5 text-[11.5px] text-muted font-bold bg-[#F0EEE6]">
            <span>Title</span>
            <span>Author(s)</span>
            <span>Year</span>
            <span></span>
          </div>
          {publications.map((pub) => (
            <div
              key={pub.title}
              className="grid grid-cols-[2fr_1fr_0.6fr_0.5fr] px-4 py-3.5 text-sm font-medium text-ink border-t border-border items-center"
            >
              <span>{pub.title}</span>
              <span className="text-body">{pub.authors}</span>
              <span className="text-body">{pub.year}</span>
              <span className="text-teal-dark font-bold text-sm">
                ↓ PDF
              </span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}