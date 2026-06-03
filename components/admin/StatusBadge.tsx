import { STATUS_LABELS, SOURCE_LABELS, type BookingStatus, type BookingSource } from "@/lib/constants";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-orange/15 text-orange-dark",
  CONFIRMED: "bg-brand-light text-brand-dark",
  DECLINED: "bg-ink/10 text-ink/60",
  CANCELLED: "bg-ink/10 text-ink/50 line-through",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status as BookingStatus;
  return (
    <span className={`badge ${STATUS_STYLES[s] ?? "bg-ink/10 text-ink/60"}`}>
      {STATUS_LABELS[s] ?? status}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const label = SOURCE_LABELS[source as BookingSource] ?? source;
  return <span className="badge bg-cream-deep text-ink/70">{label}</span>;
}
