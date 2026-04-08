import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "DoppelWriter pricing — start free with 5 edits/month. Upgrade to Pro for $19/mo with 200 edits, unlimited voices, and email ingestion.",
  alternates: {
    canonical: "https://doppelwriter.com/pricing",
  },
  openGraph: {
    title: "Pricing | DoppelWriter",
    description: "Start free. Upgrade to Pro for $19/mo when you're hooked.",
    url: "https://doppelwriter.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
