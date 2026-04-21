export default function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 95 68" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(48, 34) rotate(-90) translate(-60, -55)">
        <path d="M60 8 L92 65 L85 80 L35 80 L28 65 Z" />
        <line x1="54" y1="40" x2="54" y2="62" />
        <line x1="66" y1="40" x2="66" y2="62" />
        <circle cx="54" cy="38" r="3" fill="currentColor" stroke="none" />
        <circle cx="66" cy="38" r="3" fill="currentColor" stroke="none" />
        <line x1="35" y1="90" x2="85" y2="90" />
        <line x1="37" y1="96" x2="83" y2="96" />
      </g>
    </svg>
  );
}
