import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/og/metadata";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "DoppelWriter pricing — start free with 20 edits/month. Upgrade to Pro for $19/mo with 200 edits, unlimited voices, and email ingestion.",
  alternates: {
    canonical: "https://doppelwriter.com/pricing",
  },
  openGraph: buildOpenGraph({
    title: "Pricing | DoppelWriter",
    description: "Start free. Upgrade to Pro for $19/mo when you're hooked.",
    url: "/pricing",
  }),
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
