// Hairline frame — 4 path segments traced TL→TR→BR→BL on parent .group:hover.
// Stroke + animation styles live in globals.css (.hairline-frame).
// Drop into any container with `position: relative` (and a `.group` ancestor).

export default function HairlineFrame() {
  return (
    <svg
      className="hairline-frame"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M 0 0 L 100 0" pathLength={100} className="d-top" vectorEffect="non-scaling-stroke" />
      <path d="M 100 0 L 100 100" pathLength={100} className="d-right" vectorEffect="non-scaling-stroke" />
      <path d="M 100 100 L 0 100" pathLength={100} className="d-bottom" vectorEffect="non-scaling-stroke" />
      <path d="M 0 100 L 0 0" pathLength={100} className="d-left" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
