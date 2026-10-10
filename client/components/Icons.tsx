type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconInfo = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconFlask = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></svg>
);
export const IconBook = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /><path d="M8 7h7M8 11h5" /></svg>
);
export const IconCalendar = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const IconMail = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconUser = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const IconChip = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>
);
export const IconLeaf = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19c3-5 6-8 10-10" /></svg>
);
export const IconHeart = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" /></svg>
);
export const IconInbox = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M3 13l3-8h12l3 8v6H3v-6z" /><path d="M3 13h5l1 3h6l1-3h5" /></svg>
);
export const IconSearch = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);