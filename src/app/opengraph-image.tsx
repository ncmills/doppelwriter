import { ImageResponse } from "next/og";
import { getOgFont } from "@/lib/og/font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Geometry shared with src/components/Logo.tsx and src/app/icon.svg.
const D_PATH =
  "M8 8 H16.2 A8.4 8.4 0 0 1 16.2 24.8 H8 Z M12.6 12.2 H15.8 A4.2 4.2 0 0 1 15.8 20.8 H12.6 Z";

export default async function OGImage() {
  const fontData = await getOgFont();

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
            {/* The double-struck D on its ember plate — the same mark as
                src/app/icon.svg and src/components/Logo.tsx. The masthead used
                to carry a third, different "DW" ligature beside the words
                "Sand & Ember", which is the internal name of the palette, not
                the name of the product: the share card was signed with a label
                no reader could resolve. */}
            <svg width="36" height="36" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7.5" fill="#c2410c" />
              <path
                d={D_PATH}
                fill="#1c1a17"
                fillOpacity="0.55"
                fillRule="evenodd"
                transform="translate(4.6,-1.4)"
              />
              <path d={D_PATH} fill="#faf8f4" fillRule="evenodd" />
            </svg>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", textTransform: "none" }}>
              DoppelWriter
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
