import { NextRequest, NextResponse } from "next/server";
import { getCuratedProfiles, searchCuratedProfiles, CURATED_WRITERS, CATEGORIES } from "@/lib/writer-builder";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search");

  if (search) {
    const dbResults = await searchCuratedProfiles(search);
    const builtNames = new Set(dbResults.map((b) => b.writer_name));

    // Also search the catalog for unbuilt writers
    const catalogMatches = CURATED_WRITERS.filter(
      (w) => !builtNames.has(w.name) &&
        (w.name.toLowerCase().includes(search.toLowerCase()) ||
         w.bio.toLowerCase().includes(search.toLowerCase()) ||
         w.category.toLowerCase().includes(search.toLowerCase()))
    );

    const all = [
      ...dbResults.map((b) => ({ ...b, built: !!b.has_profile })),
      ...catalogMatches.map((w) => ({
        id: null, name: w.name, writer_name: w.name, writer_bio: w.bio,
        writer_category: w.category, description: w.bio, is_curated: true,
        has_profile: false, built: false,
      })),
    ];

    return NextResponse.json({ writers: all, categories: CATEGORIES });
  }

  const built = await getCuratedProfiles(category || undefined);
  const builtNames = new Set(built.map((b) => b.writer_name));

  const catalogWriters = category
    ? CURATED_WRITERS.filter((w) => w.category === category)
    : CURATED_WRITERS;

  const all = [
    ...built.map((b) => ({ ...b, built: !!b.has_profile })),
    ...catalogWriters.filter((w) => !builtNames.has(w.name)).map((w) => ({
      id: null, name: w.name, writer_name: w.name, writer_bio: w.bio,
      writer_category: w.category, description: w.bio, is_curated: true,
      has_profile: false, built: false,
    })),
  ];

  return NextResponse.json({ writers: all, categories: CATEGORIES });
}
