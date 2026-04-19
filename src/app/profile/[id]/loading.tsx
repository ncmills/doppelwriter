export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] p-6 space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
          <div className="h-4 w-24 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
        </div>
      </div>
      {/* Profile content */}
      <div className="h-48 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
      <div className="h-32 bg-[var(--color-paper-deep)] rounded-[2px] animate-pulse" />
    </div>
  );
}
