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
            backgroundColor: "#0C0A09",
            color: "#FAFAF9",
            fontSize: 48,
            fontFamily: "serif",
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
          backgroundColor: "#0C0A09",
          color: "#FAFAF9",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#D97706",
              letterSpacing: "-0.02em",
            }}
          >
            DoppelWriter
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#78716C",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}
          >
            Writing Voice Analysis
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
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                textTransform: "capitalize" as const,
                marginBottom: "8px",
              }}
            >
              {result.tone.primary}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#A8A29E",
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
                    fontSize: 16,
                    color: "#78716C",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                  }}
                >
                  Writes like
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#D97706",
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
                      borderRadius: "999px",
                      backgroundColor: "rgba(217, 119, 6, 0.15)",
                      border: "1px solid rgba(217, 119, 6, 0.3)",
                      color: "#D97706",
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
                backgroundColor: "rgba(28, 25, 23, 0.8)",
                border: "1px solid rgba(68, 64, 60, 0.4)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#78716C",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
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
                backgroundColor: "rgba(28, 25, 23, 0.8)",
                border: "1px solid rgba(68, 64, 60, 0.4)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#78716C",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
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
                  color: "#78716C",
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
                  backgroundColor: "#292524",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${formalityPct}%`,
                    height: "100%",
                    background: "linear-gradient(to right, #D97706, #F59E0B)",
                    borderRadius: "999px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#A8A29E",
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
                backgroundColor: "rgba(28, 25, 23, 0.8)",
                border: "1px solid rgba(68, 64, 60, 0.4)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#78716C",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  marginBottom: "4px",
                }}
              >
                Avg Sentence
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {result.sentenceLength.average}
                </div>
                <div style={{ fontSize: 14, color: "#78716C" }}>words</div>
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
            borderTop: "1px solid rgba(68, 64, 60, 0.3)",
          }}
        >
          <div style={{ fontSize: 18, color: "#A8A29E" }}>
            Analyze your writing voice for free
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#D97706",
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
