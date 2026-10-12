import { imageUrl } from "@/lib/api";

const palettes = [
  "from-teal to-teal-dark",
  "from-gold to-gold-dark",
  "from-teal-dark to-ink",
  "from-gold-dark to-teal",
];

export default function Thumb({
  image,
  title,
  type,
  className = "h-36",
}: {
  image?: string;
  title: string;
  type?: string;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl(image)}
        alt={title}
        className={`w-full object-cover ${className}`}
      />
    );
  }
  const idx = (title.charCodeAt(0) || 0) % palettes.length;
  return (
    <div
      className={`w-full bg-gradient-to-br ${palettes[idx]} flex items-end p-3 ${className}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
        {type || "KURIC"}
      </span>
    </div>
  );
}