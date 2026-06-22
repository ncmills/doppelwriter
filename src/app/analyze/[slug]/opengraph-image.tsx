import { ImageResponse } from "next/og";
import { sql } from "@/lib/db";

export const runtime = "edge";
export const alt = "Writing Voice Analysis — Sand & Ember";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface AnalysisResult {
  tone: { primary: string; secondary: string; formality: number };
  vocabulary: { level: string; uniqueWordRatio: number; signatureWords: string[] };
  sentenceLength: { average: number; variation: string };
  personality: { description: string };
  similarTo: string[];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const fontData = await fetch(
    "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf"
  ).then((res) => res.arrayBuffer());

  const fontConfig = {
    fonts: [{ name: "Space Grotesk", data: fontData, weight: 700 as const, style: "normal" as const }],
  };

  let result: AnalysisResult | null = null;
  try {
    const db = sql();
    const rows = await db`
      SELECT result FROM analyzer_results WHERE slug = ${slug} LIMIT 1
    `;
    if (rows.length > 0) {
      result = typeof rows[0].result === "string"
        ? JSON.parse(rows[0].result)
        : rows[0].result;
    }
  } catch {
    // Fall through to default card
  }

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf8f4",
            color: "#1c1a17",
            fontSize: 48,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Writing Voice Analysis — Sand &amp; Ember
        </div>
      ),
      { ...size, ...fontConfig }
    );
  }

  const primaryWriter = result.similarTo[0]?.split(" — ")[0]?.split(" – ")[0]?.trim() || "";
  const formalityPct = Math.round((result.tone.formality / 10) * 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf8f4",
          color: "#1c1a17",
          padding: "56px 64px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Top bar — masthead */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid #e4ded2",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1c1a17",
              letterSpacing: "-0.02em",
            }}
          >
            Sand &amp; Ember
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#6b6358",
              textTransform: "uppercase" as const,
              letterSpacing: "0.25em",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#c2410c", display: "flex" }} />{"  "}Writing Voice Analysis
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, gap: "40px" }}>
          {/* Left column — big headline stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Primary tone */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                textTransform: "capitalize" as const,
                marginBottom: "8px",
                color: "#1c1a17",
              }}
            >
              {result.tone.primary}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#6b6358",
                marginBottom: "32px",
                textTransform: "capitalize" as const,
              }}
            >
              with a {result.tone.secondary} edge
            </div>

            {/* Similar to */}
            {primaryWriter && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#6b6358",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.2em",
                  }}
                >
                  Writes like
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#c2410c",
                  }}
                >
                  {primaryWriter}
                </div>
              </div>
            )}

            {/* Signature words */}
            {result.vocabulary.signatureWords.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const }}>
                {result.vocabulary.signatureWords.slice(0, 4).map((word) => (
                  <div
                    key={word}
                    style={{
                      fontSize: 14,
                      padding: "6px 16px",
                      borderRadius: "2px",
                      backgroundColor: "#f1ece3",
                      border: "1px solid #e4ded2",
                      color: "#1c1a17",
                    }}
                  >
                    {word}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column — metric cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "320px",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            {/* Vocabulary */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f1ece3",
                border: "1px solid #e4ded2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#6b6358",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  marginBottom: "4px",
                }}
              >
                Vocabulary
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  textTransform: "capitalize" as const,
                  color: "#1c1a17",
                }}
              >
                {result.vocabulary.level}
              </div>
            </div>

            {/* Formality bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f1ece3",
                border: "1px solid #e4ded2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#6b6358",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  marginBottom: "8px",
                }}
              >
                Formality
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#6b6358",
                  marginBottom: "6px",
                }}
              >
                <span>Casual</span>
                <span>Formal</span>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "10px",
                  backgroundColor: "#e4ded2",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${formalityPct}%`,
                    height: "100%",
                    background: "#1c1a17",
                    borderRadius: "2px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#6b6358",
                  textAlign: "center" as const,
                  marginTop: "6px",
                }}
              >
                {result.tone.formality}/10
              </div>
            </div>

            {/* Sentence length */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f1ece3",
                border: "1px solid #e4ded2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#6b6358",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  marginBottom: "4px",
                }}
              >
                Avg Sentence
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1c1a17" }}>
                  {result.sentenceLength.average}
                </div>
                <div style={{ fontSize: 14, color: "#6b6358" }}>words</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #e4ded2",
          }}
        >
          <div style={{ fontSize: 18, color: "#6b6358" }}>
            Analyze your writing voice for free
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#c2410c",
              letterSpacing: "0.05em",
            }}
          >
            doppelwriter.com/analyze
          </div>
        </div>
      </div>
    ),
    { ...size, ...fontConfig }
  );
}
