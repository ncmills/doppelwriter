import { getNetworkSites } from "@/lib/network-sites";

/**
 * The cross-site strip — the other free tools from the same desk.
 *
 * Reads src/lib/network-sites.ts, which is now the only copy of this list.
 *
 * The descriptor used to sit in a `title=` attribute. A tooltip is not anchor
 * text: it carries no weight and no reader on a phone ever sees it. It is
 * inside the <a> now, so the anchor says what the sibling IS.
 *
 * dofollow on purpose — do NOT add rel="nofollow".
 */
export function NetworkFooter({ currentDomain }: { currentDomain: string }) {
  const sites = getNetworkSites(currentDomain);
  if (sites.length === 0) return null;
  return (
    <nav aria-label="Sister sites">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-fg-muted)]">
        Also from the same desk
      </p>
      <ul className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-10">
        {sites.map((s) => (
          <li key={s.domain}>
            <a
              href={`https://${s.domain}`}
              rel="noopener"
              className="inline-flex min-h-[44px] items-baseline text-[11px] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              <span className="ed-link text-[13px] text-[var(--color-fg)]">{s.label}</span>
              {/* An em-dash and a real space, NOT a flex `gap`. A gap separates
                  the boxes and leaves the TEXT joined: the anchor shipped as
                  "AISSDIfree SSDI approval-odds and judge lookup", verified on
                  production. The gap is invisible to the one reader this
                  descriptor was moved inside the <a> for. */}
              <span>&nbsp;— {s.tagline}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
