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

  const fontData = await fetch(
    "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
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
            <span style={{ color: "#c2410c" }}>●</span>{"  "}Writing Tools
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
              color: "#1c1a17",
              display: "flex",
            }}
          >
            Write My {uc.title}
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
            color: "#6b6358",
            paddingTop: "20px",
            borderTop: "1px solid #e4ded2",
          }}
        >
          <span>doppelwriter.com</span>
          <span>In Your Voice · Free</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Space Grotesk", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
