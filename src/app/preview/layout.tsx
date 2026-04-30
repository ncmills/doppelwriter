import type { Metadata } from "next";
import type { ReactNode } from "react";

// All /preview/* routes are internal review surfaces — keep them out of
// search engines and the sitemap.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
