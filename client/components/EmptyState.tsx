import { IconInbox } from "./Icons";

export default function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="border border-dashed border-[#C9C2AE] rounded-2xl py-12 px-6 text-center bg-surface/60">
      <div className="mx-auto w-14 h-14 rounded-full bg-teal-tint text-teal-dark flex items-center justify-center mb-3">
        <IconInbox />
      </div>
      <div className="text-sm font-semibold text-ink">{message}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}