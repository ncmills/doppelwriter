/**
 * Cross-site footer links — LEGAL / SELF-HELP CLUSTER (funnel).
 *
 * doppelwriter is a LINK member of the legal/self-help cluster (it is also surfaced
 * as a writing tool on imfrustrated.org). Network footers are siloed by topic; equity
 * funnels UPSTREAM toward higher-priority sites only.
 * Cluster priority: aissdi > idonthaveawill > doppelwriter > imfrustrated.
 * This site (doppelwriter, priority 3) links ONLY to sites above it → aissdi, idonthaveawill.
 * Nick reconfirmed the one-way funnel on 2026-08-18: it is deliberate, and it stays.
 * Never add a Planning-cluster or Peptide-cluster site here, and never a personal site.
 *
 * This is now the ONLY list. `src/components/CrossSiteList.tsx` held a second,
 * hardcoded copy of the same two sites and was rendered on the homepage while
 * this module was rendered on blog posts — two lists that had to agree, with
 * nothing making them agree. CrossSiteList is deleted.
 */
export interface NetworkSite {
  domain: string; // bare domain, no protocol
  label: string; // display label
  /** What the site IS. Rendered INSIDE the <a> — this is anchor text, not a tooltip.
   *  It used to live only in a title= attribute, where it carried no anchor value. */
  tagline: string;
}

export const NETWORK_SITES: NetworkSite[] = [
  { domain: "aissdi.com", label: "AISSDI", tagline: "free SSDI approval-odds and judge lookup" },
  { domain: "idonthaveawill.com", label: "I Don't Have a Will", tagline: "free will builder" },
];

/** Returns sites excluding the current domain (prevents self-linking). */
export function getNetworkSites(currentDomain: string): NetworkSite[] {
  return NETWORK_SITES.filter((s) => s.domain !== currentDomain);
}
