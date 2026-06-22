import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="#1c1a17">
              <path
                fillRule="evenodd"
                d="M 4 12 L 18 12 C 28 12 30 20 30 32 C 30 44 28 52 18 52 L 4 52 Z M 10 16 L 17 16 C 22 16 24 22 24 32 C 24 42 22 48 17 48 L 10 48 Z"
              />
              <rect x="30" y="12" width="2" height="40" />
              <path d="M 32 12 L 36 12 L 42 52 L 38 52 Z" />
              <path d="M 39 52 L 41 52 L 48 12 L 46 12 Z" />
              <path d="M 45 12 L 49 12 L 55 52 L 51 52 Z" />
              <path d="M 52 52 L 54 52 L 61 12 L 59 12 Z" />
            </svg>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", textTransform: "none" }}>
              Sand &amp; Ember
            </span>
          </div>
          <span style={{ color: "#6b6358" }}>
            <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#c2410c", display: "flex" }} />{"  "}Vol. I
          </span>
        </div>

        {/* Headline — main editorial */}
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
              fontSize: "92px",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "#1c1a17",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Write in anyone&apos;s voice.</span>
            <span style={{ fontWeight: 400, color: "#6b6358" }}>
              Starting with yours.
            </span>
          </div>
          <div
            style={{
              marginTop: "32px",
              fontSize: "28px",
              color: "#6b6358",
              lineHeight: 1.4,
              maxWidth: "880px",
              display: "flex",
            }}
          >
            The AI that sounds like you. Or Hemingway. Or your mom.
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
          <span>Voice-Matched · 140+ Writers · Free</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Space Grotesk", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
