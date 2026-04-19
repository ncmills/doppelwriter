export default function WriteLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] p-6 space-y-4">
      {/* Mode toggle skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-24 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        <div className="h-10 w-24 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
      </div>
      {/* Editor area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[400px] bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        <div className="h-[400px] bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
      </div>
    </div>
  );
}
