import { ImageResponse } from "next/og";
import { USE_CASES } from "@/lib/use-cases";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (!uc) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf7f0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px 96px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#1a1a1a",
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
            color: "#4a4a4a",
            paddingBottom: "20px",
            borderBottom: "1px solid #d9d2c2",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", textTransform: "none" }}>
            DoppelWriter
          </span>
          <span style={{ color: "#8a8378" }}>
            <span style={{ color: "#8b2e2e" }}>●</span>{"  "}Writing Tools
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
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1a1a1a",
              display: "flex",
            }}
          >
            Write My {uc.title}
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "26px",
              fontStyle: "italic",
              color: "#4a4a4a",
              lineHeight: 1.4,
              maxWidth: "900px",
              display: "flex",
            }}
          >
            {uc.description}
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
            color: "#8a8378",
            paddingTop: "20px",
            borderTop: "1px solid #d9d2c2",
          }}
        >
          <span>doppelwriter.com</span>
          <span>In Your Voice · Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
