import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="#1a1a1a">
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
              DoppelWriter
            </span>
          </div>
          <span style={{ color: "#8a8378" }}>
            <span style={{ color: "#8b2e2e" }}>●</span>{"  "}Vol. I
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
              color: "#1a1a1a",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Write in anyone&apos;s voice.</span>
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "#4a4a4a" }}>
              Starting with yours.
            </span>
          </div>
          <div
            style={{
              marginTop: "32px",
              fontSize: "28px",
              fontStyle: "italic",
              color: "#4a4a4a",
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
            color: "#8a8378",
            paddingTop: "20px",
            borderTop: "1px solid #d9d2c2",
          }}
        >
          <span>doppelwriter.com</span>
          <span>Voice-Matched · 140+ Writers · Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
