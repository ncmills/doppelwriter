/**
 * The DoppelWriter mark — a double-struck "D".
 *
 * One letterform, printed twice, out of register: the ember copy sits behind
 * and offset, the way a letterpress double-strike or a misregistered press run
 * leaves a ghost of the first impression. That is the product in one shape —
 * your voice, and its double — and it says *press* while it says *doppel*,
 * which is the half of the name that used to go unsaid.
 *
 * The D is drawn geometric to sit with Space Grotesk (DESIGN-SYSTEM.md), not
 * traced from it: the mark has to render identically in Satori and in a browser
 * tab, neither of which can load a webfont for an inline SVG.
 *
 * What this replaces and why: two tapered slabs. They read as a media *pause*
 * button at every size, and the first slab was ink with no dark variant — so on
 * a dark browser tab it disappeared and the mark became a single orange tally,
 * losing the one idea it existed to carry.
 *
 * Kept in sync by hand with `src/app/icon.svg`, `src/app/apple-icon.tsx` and
 * the masthead in `src/app/opengraph-image.tsx`. Change them in the same commit.
 */

/** The D's outline; the counter is the second subpath, cut with evenodd. */
const D_PATH =
  "M8 8 H16.2 A8.4 8.4 0 0 1 16.2 24.8 H8 Z M12.6 12.2 H15.8 A4.2 4.2 0 0 1 15.8 20.8 H12.6 Z";

export default function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* The double: the first impression, offset and in ember. */}
      <path
        d={D_PATH}
        fill="var(--color-brand)"
        fillRule="evenodd"
        transform="translate(4.6,-1.4)"
      />
      {/* The voice: struck on top, in whatever color the caller sets. */}
      <path d={D_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/**
 * The mark on its ember plate — the tab-icon / app-icon lockup. The plate is
 * the brand's single vivid accent, so the icon is the same object on a light
 * and a dark tab bar instead of half-vanishing on one of them.
 */
export function LogoPlate({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="DoppelWriter"
    >
      <rect width="32" height="32" rx="7.5" fill="#c2410c" />
      <path
        d={D_PATH}
        fill="#1c1a17"
        fillOpacity="0.55"
        fillRule="evenodd"
        transform="translate(4.6,-1.4)"
      />
      <path d={D_PATH} fill="#faf8f4" fillRule="evenodd" />
    </svg>
  );
}
