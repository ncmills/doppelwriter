export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] p-6 space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        ))}
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        <div className="h-64 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
      </div>
    </div>
  );
}
