export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-stone-950 p-6 space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-stone-900/40 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-stone-900/40 rounded animate-pulse" />
          <div className="h-4 w-24 bg-stone-900/40 rounded animate-pulse" />
        </div>
      </div>
      {/* Profile content */}
      <div className="h-48 bg-stone-900/40 rounded-lg animate-pulse" />
      <div className="h-32 bg-stone-900/40 rounded-lg animate-pulse" />
    </div>
  );
}
