import { getNetworkSites } from "@/lib/network-sites";

/**
 * Small, low-contrast cross-site footer.
 * Visible to users and crawlers. Intentionally understated so it does not
 * distract from post content but provides crawlable internal-network links.
 */
export function NetworkFooter({ currentDomain }: { currentDomain: string }) {
  const sites = getNetworkSites(currentDomain);
  if (sites.length === 0) return null;
  return (
    <div
      aria-label="Sister sites"
      style={{
        marginTop: "4rem",
        paddingTop: "1rem",
        borderTop: "1px solid rgba(250,250,249,0.06)",
        fontSize: "10px",
        lineHeight: 1.6,
        color: "rgba(250,250,249,0.3)",
        textAlign: "center",
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ marginRight: "0.4em" }}>From our network:</span>
      {sites.map((s, i) => (
        <span key={s.domain}>
          {i > 0 && <span style={{ opacity: 0.4 }}> · </span>}
          <a
            href={`https://${s.domain}`}
            title={s.tagline}
            rel="noopener"
            style={{ color: "rgba(250,250,249,0.35)", textDecoration: "none" }}
          >
            {s.label}
          </a>
        </span>
      ))}
    </div>
  );
}
