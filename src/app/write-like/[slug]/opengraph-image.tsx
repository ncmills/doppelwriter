import { ImageResponse } from "next/og";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function writerSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function generateStaticParams() {
  const writerParams = CURATED_WRITERS.map((w) => ({ slug: writerSlug(w.name) }));
  const categoryParams = CATEGORIES.map((c) => ({ slug: c.id }));
  return [...categoryParams, ...writerParams];
}

function OGShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        background: "#0C0A09",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 80px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "#D97706",
            borderRadius: "2px",
          }}
        />
        <span style={{ color: "#D97706", fontSize: "20px", fontWeight: 600 }}>
          DoppelWriter
        </span>
      </div>
      <div
        style={{
          fontSize: "64px",
          fontWeight: 700,
          color: "#FAFAF9",
          lineHeight: 1.1,
          marginBottom: "24px",
          display: "flex",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "24px",
          color: "#A8A29E",
          lineHeight: 1.5,
          maxWidth: "800px",
          display: "flex",
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "80px",
          fontSize: "18px",
          color: "#57534E",
          display: "flex",
        }}
      >
        doppelwriter.com
      </div>
    </div>
  );
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Category hub OG image
  if (CATEGORY_IDS.has(slug)) {
    const category = CATEGORIES.find((c) => c.id === slug)!;
    const count = CURATED_WRITERS.filter((w) => w.category === slug).length;
    return new ImageResponse(
      <OGShell
        title={`Write Like ${category.label}`}
        subtitle={`${count} iconic voices. Pick one and start writing in their style.`}
      />,
      { ...size }
    );
  }

  // Writer OG image
  const writer = CURATED_WRITERS.find((w) => writerSlug(w.name) === slug);
  if (!writer) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }

  return new ImageResponse(
    <OGShell title={`Write Like ${writer.name}`} subtitle={writer.bio} />,
    { ...size }
  );
}
