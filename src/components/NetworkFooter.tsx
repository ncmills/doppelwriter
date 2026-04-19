import { getNetworkSites } from "@/lib/network-sites";

/**
 * Small editorial cross-site footer. Visible to users and crawlers.
 * Understated typographic list — reads like a publisher colophon.
 */
export function NetworkFooter({ currentDomain }: { currentDomain: string }) {
  const sites = getNetworkSites(currentDomain);
  if (sites.length === 0) return null;
  return (
    <div
      aria-label="Sister sites"
      style={{
        marginTop: "4rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid var(--color-rule)",
        fontSize: "11px",
        lineHeight: 1.7,
        color: "var(--color-ink-mute)",
        textAlign: "center",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ marginRight: "0.6em" }}>From the same desk —</span>
      {sites.map((s, i) => (
        <span key={s.domain}>
          {i > 0 && <span style={{ color: "var(--color-rule)" }}> · </span>}
          <a
            href={`https://${s.domain}`}
            title={s.tagline}
            rel="noopener"
            style={{
              color: "var(--color-ink-soft)",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              paddingBottom: "1px",
              transition: "color 200ms, border-color 200ms",
            }}
          >
            {s.label}
          </a>
        </span>
      ))}
    </div>
  );
}
