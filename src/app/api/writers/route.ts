import { NextResponse } from "next/server";
import { getCuratedProfiles, CURATED_WRITERS } from "@/lib/writer-builder";

export async function GET() {
  const built = await getCuratedProfiles();
  const builtNames = new Set(built.map((b) => b.writer_name));

  // Merge: show built profiles + unbuilt catalog entries
  const all = [
    ...built.map((b) => ({ ...b, built: true })),
    ...CURATED_WRITERS.filter((w) => !builtNames.has(w.name)).map((w) => ({
      id: null,
      name: w.name,
      writer_name: w.name,
      writer_bio: w.bio,
      description: w.bio,
      is_curated: true,
      has_profile: false,
      built: false,
    })),
  ];

  return NextResponse.json(all);
}
