import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type SearchFiltersProps = {
  search: string;
  status: "all" | BookingStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | BookingStatus) => void;
};

export default function SearchFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: SearchFiltersProps) {
  return (
    <div className="grid gap-4 border border-white/10 bg-white/[0.025] p-4 md:grid-cols-[1fr_220px]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search name, phone, or email"
        className="field-surface w-full px-4 py-3 text-sm"
      />

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as "all" | BookingStatus)
        }
        className="field-surface w-full px-4 py-3 text-sm"
      >
        <option value="all">All statuses</option>
        {BOOKING_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

