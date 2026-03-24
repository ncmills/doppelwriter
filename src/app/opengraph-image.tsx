import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0C0A09",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "6px",
              background: "#D97706",
              borderRadius: "3px",
            }}
          />
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#FAFAF9",
            }}
          >
            DoppelWriter
          </span>
          <div
            style={{
              width: "48px",
              height: "6px",
              background: "#D97706",
              borderRadius: "3px",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#A8A29E",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          AI that writes like anyone. Clone your voice or write like the greats.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            fontSize: "18px",
            color: "#57534E",
            display: "flex",
          }}
        >
          doppelwriter.com
        </div>
      </div>
    ),
    { ...size }
  );
}
