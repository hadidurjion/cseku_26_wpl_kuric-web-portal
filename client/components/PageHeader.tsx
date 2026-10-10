import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-teal to-teal-dark text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="float-slow absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(200,155,60,0.35)" }}
      />
      <div className="relative z-10 px-10 py-9 flex items-center gap-5 max-w-5xl mx-auto w-full">
        {icon && (
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur items-center justify-center flex-shrink-0 [&>svg]:w-8 [&>svg]:h-8">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <div className="text-[11px] tracking-widest uppercase font-bold text-gold-tint mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="font-serif-brand text-3xl font-bold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-white/80 mt-1 max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}