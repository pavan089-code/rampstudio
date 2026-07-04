export function AdminSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse border border-white/10 bg-white/[0.035]"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-10 text-center">
      <h3 className="font-serif text-3xl text-white">{title}</h3>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
        {message}
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-red-400/30 bg-red-400/10 p-5 text-sm leading-7 text-red-100">
      {message}
    </div>
  );
}

