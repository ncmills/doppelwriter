import { NextRequest, NextResponse } from "next/server";
import { getCuratedProfiles, searchCuratedProfiles, CURATED_WRITERS, CATEGORIES } from "@/lib/writer-builder";

// Valid curated names — only these appear in the catalog
const VALID_NAMES = new Set(CURATED_WRITERS.map((w) => w.name));

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search");

  if (search) {
    const dbResults = await searchCuratedProfiles(search);
    // Filter DB results to only show writers in the valid catalog
    const validDbResults = dbResults.filter((b) => VALID_NAMES.has(b.writer_name as string));
    const builtNames = new Set(validDbResults.map((b) => b.writer_name));

    const catalogMatches = CURATED_WRITERS.filter(
      (w) => !builtNames.has(w.name) &&
        (w.name.toLowerCase().includes(search.toLowerCase()) ||
         w.bio.toLowerCase().includes(search.toLowerCase()) ||
         w.category.toLowerCase().includes(search.toLowerCase()))
    );

    const all = [
      ...validDbResults.map((b) => ({ ...b, built: !!b.has_profile })),
      ...catalogMatches.map((w) => ({
        id: null, name: w.name, writer_name: w.name, writer_bio: w.bio,
        writer_category: w.category, description: w.bio, is_curated: true,
        has_profile: false, built: false,
      })),
    ];

    return NextResponse.json(
      { writers: all, categories: CATEGORIES },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

  const built = await getCuratedProfiles(category || undefined);
  // Filter: only show DB entries that are in the valid catalog OR were user-added (have a profile)
  const validBuilt = built.filter((b) => VALID_NAMES.has(b.writer_name as string) || b.has_profile);
  const builtNames = new Set(validBuilt.map((b) => b.writer_name));

  const catalogWriters = category
    ? CURATED_WRITERS.filter((w) => w.category === category)
    : CURATED_WRITERS;

  const all = [
    ...validBuilt.map((b) => ({ ...b, built: !!b.has_profile })),
    ...catalogWriters.filter((w) => !builtNames.has(w.name)).map((w) => ({
      id: null, name: w.name, writer_name: w.name, writer_bio: w.bio,
      writer_category: w.category, description: w.bio, is_curated: true,
      has_profile: false, built: false,
    })),
  ];

  return NextResponse.json(
    { writers: all, categories: CATEGORIES },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
