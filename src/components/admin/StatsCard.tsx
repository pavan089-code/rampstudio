import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
};

export default function StatsCard({
  title,
  value,
  detail,
  icon: Icon,
}: StatsCardProps) {
  return (
    <article className="border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            {title}
          </p>
          <p className="mt-4 font-serif text-4xl text-white">{value}</p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      {detail && <p className="mt-5 text-sm text-white/55">{detail}</p>}
    </article>
  );
}

