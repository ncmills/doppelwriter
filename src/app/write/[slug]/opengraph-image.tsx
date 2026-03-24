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
          Write My {uc.title}
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
          {uc.description}
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
    ),
    { ...size }
  );
}
