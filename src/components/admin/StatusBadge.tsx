import type { BookingStatus } from "@/types/booking";

const statusStyles: Record<BookingStatus, string> = {
  new: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  contacted: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
  negotiation: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  booked: "border-green-400/30 bg-green-400/10 text-green-200",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-red-400/30 bg-red-400/10 text-red-200",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

