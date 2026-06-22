export default function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* the original voice (ink) and its double (ember) — DoppelWriter */}
      <path d="M6 4 L10 4 L9 18 L5 18 Z" />
      <path d="M15 4 L19 4 L18 18 L14 18 Z" fill="var(--color-brand)" />
    </svg>
  );
}
