import { ImageResponse } from "next/og";
import { sql } from "@/lib/db";

export const runtime = "edge";
export const alt = "Writing Voice Analysis — DoppelWriter";
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
            backgroundColor: "#faf7f0",
            color: "#1a1a1a",
            fontSize: 48,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Writing Voice Analysis — DoppelWriter
        </div>
      ),
      { ...size }
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
          backgroundColor: "#faf7f0",
          color: "#1a1a1a",
          padding: "56px 64px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Top bar — masthead */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom: "1px solid #d9d2c2",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            DoppelWriter
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#8a8378",
              textTransform: "uppercase" as const,
              letterSpacing: "0.25em",
            }}
          >
            <span style={{ color: "#8b2e2e" }}>●</span>{"  "}Writing Voice Analysis
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
                color: "#1a1a1a",
              }}
            >
              {result.tone.primary}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#4a4a4a",
                marginBottom: "32px",
                textTransform: "capitalize" as const,
                fontStyle: "italic",
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
                    color: "#8a8378",
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
                    color: "#8b2e2e",
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
                      backgroundColor: "#f0ebe0",
                      border: "1px solid #d9d2c2",
                      color: "#1a1a1a",
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
                backgroundColor: "#f0ebe0",
                border: "1px solid #d9d2c2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#8a8378",
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
                  color: "#1a1a1a",
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
                backgroundColor: "#f0ebe0",
                border: "1px solid #d9d2c2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#8a8378",
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
                  color: "#8a8378",
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
                  backgroundColor: "#d9d2c2",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${formalityPct}%`,
                    height: "100%",
                    background: "#1a1a1a",
                    borderRadius: "2px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#4a4a4a",
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
                backgroundColor: "#f0ebe0",
                border: "1px solid #d9d2c2",
                borderRadius: "2px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#8a8378",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.2em",
                  marginBottom: "4px",
                }}
              >
                Avg Sentence
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
                  {result.sentenceLength.average}
                </div>
                <div style={{ fontSize: 14, color: "#8a8378" }}>words</div>
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
            borderTop: "1px solid #d9d2c2",
          }}
        >
          <div style={{ fontSize: 18, color: "#4a4a4a", fontStyle: "italic" }}>
            Analyze your writing voice for free
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#8b2e2e",
              letterSpacing: "0.05em",
            }}
          >
            doppelwriter.com/analyze
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
