/**
 * Canonical list of Nick's network of sites.
 *
 * Used for cross-site footer links on blog/guide pages.
 *
 * To add a new site: add an entry below, THEN copy this file's NETWORK_SITES array
 * to the sibling projects' src/lib/network-sites.ts (peptide-stack, doppelwriter, tour-de-fore,
 * and any other project that renders a network footer).
 *
 * Order roughly reflects topical relevance / content quality.
 */
export interface NetworkSite {
  domain: string; // bare domain, no protocol
  label: string; // display label
  tagline: string; // short description (4-8 words)
}

export const NETWORK_SITES: NetworkSite[] = [
  { domain: "tourdefore.com", label: "Tour de Fore", tagline: "Group golf trip planner" },
  { domain: "whatpeptidesdo.com", label: "WPD", tagline: "Peptides, simplified" },
  { domain: "doppelwriter.com", label: "DoppelWriter", tagline: "AI that writes in your voice" },
  { domain: "bestmanhq.com", label: "BESTMAN HQ", tagline: "Bachelor party planner" },
  { domain: "maidofhonorhq.com", label: "Maid of Honor HQ", tagline: "Bachelorette party planner" },
  { domain: "idonthaveawill.com", label: "I Don't Have a Will", tagline: "Free will drafting tool" },
  { domain: "imfrustrated.org", label: "I'm Frustrated", tagline: "Legal self-help directory" },
];

/** Returns sites excluding the current domain (prevents self-linking). */
export function getNetworkSites(currentDomain: string): NetworkSite[] {
  return NETWORK_SITES.filter((s) => s.domain !== currentDomain);
}
