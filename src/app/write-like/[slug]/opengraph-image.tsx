import { ImageResponse } from "next/og";
import { getOgFont } from "@/lib/og/font";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function writerSlug(name: string) {
  return name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-");
}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function generateStaticParams() {
  const writerParams = CURATED_WRITERS.map((w) => ({ slug: writerSlug(w.name) }));
  const categoryParams = CATEGORIES.map((c) => ({ slug: c.id }));
  return [...categoryParams, ...writerParams];
}

function OGShell({ title, subtitle, fontData }: { title: string; subtitle: string; fontData: ArrayBuffer }) {
  return (
    <div
      style={{
        background: "#faf8f4",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "80px 96px",
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#1c1a17",
        position: "relative",
      }}
    >
      {/* Top hairline + masthead */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "16px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#6b6358",
          paddingBottom: "20px",
          borderBottom: "1px solid #e4ded2",
        }}
      >
        <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", textTransform: "none" }}>
          Sand &amp; Ember
        </span>
        <span style={{ color: "#6b6358" }}>
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#c2410c", display: "flex" }} />{"  "}Voice Library
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            fontSize: "76px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#1c1a17",
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "26px",
            color: "#6b6358",
            lineHeight: 1.4,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Bottom hairline + footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "16px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#6b6358",
          paddingTop: "20px",
          borderTop: "1px solid #e4ded2",
        }}
      >
        <span>doppelwriter.com</span>
        <span>Write In Any Voice</span>
      </div>
    </div>
  );
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const fontData = await getOgFont();

  const fontConfig = {
    fonts: [{ name: "Space Grotesk", data: fontData, weight: 700 as const, style: "normal" as const }],
  };

  // Category hub OG image
  if (CATEGORY_IDS.has(slug)) {
    const category = CATEGORIES.find((c) => c.id === slug)!;
    const count = CURATED_WRITERS.filter((w) => w.category === slug).length;
    return new ImageResponse(
      <OGShell
        title={`Write Like ${category.label}`}
        subtitle={`${count} iconic voices. Pick one and start writing in their style.`}
        fontData={fontData}
      />,
      { ...size, ...fontConfig }
    );
  }

  // Writer OG image
  const writer = CURATED_WRITERS.find((w) => writerSlug(w.name) === slug);
  if (!writer) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }

  return new ImageResponse(
    <OGShell title={`Write Like ${writer.name}`} subtitle={writer.bio} fontData={fontData} />,
    { ...size, ...fontConfig }
  );
}
