/**
 * Cross-site footer links — LEGAL / SELF-HELP CLUSTER (funnel).
 *
 * doppelwriter is a LINK member of the legal/self-help cluster (it is also surfaced
 * as a writing tool on imfrustrated.org). Network footers are siloed by topic; equity
 * funnels UPSTREAM toward higher-priority sites only.
 * Cluster priority: aissdi > idonthaveawill > doppelwriter > imfrustrated.
 * This site (doppelwriter, priority 3) links ONLY to sites above it → aissdi, idonthaveawill.
 */
export interface NetworkSite {
  domain: string; // bare domain, no protocol
  label: string; // display label
  tagline: string; // short description (4-8 words)
}

export const NETWORK_SITES: NetworkSite[] = [
  { domain: "aissdi.com", label: "AISSDI", tagline: "Free SSDI approval-odds & judge lookup tools" },
  { domain: "idonthaveawill.com", label: "I Don't Have a Will", tagline: "Free will drafting tool" },
];

/** Returns sites excluding the current domain (prevents self-linking). */
export function getNetworkSites(currentDomain: string): NetworkSite[] {
  return NETWORK_SITES.filter((s) => s.domain !== currentDomain);
}
