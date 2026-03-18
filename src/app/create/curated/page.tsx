"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import { CURATED_WRITERS } from "@/lib/writer-data";
import Link from "next/link";

export default function CreateCuratedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const plan = (session?.user as Record<string, unknown>)?.plan;

  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [customName, setCustomName] = useState("");
  const [customBio, setCustomBio] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildingName, setBuildingName] = useState("");

  const handleBuildCatalog = async (writerName: string) => {
    setBuilding(true);
    setBuildingName(writerName);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName, isCurated: true }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      router.push(`/doppelwrite/curated?id=${profileId}`);
    } else {
      const { error } = await res.json();
      alert(error || "Failed to build profile");
    }
    setBuilding(false);
    setBuildingName("");
  };

  const handleBuildCustom = async () => {
    if (!customName) return;
    setBuilding(true);
    setBuildingName(customName);

    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName: customName, bio: customBio || undefined, isCurated: false }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      router.push(`/doppelwrite/curated?id=${profileId}`);
    } else {
      const { error } = await res.json();
      alert(error || "Failed to build profile");
    }
    setBuilding(false);
    setBuildingName("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Upload as samples, then they can be associated with the curated profile
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/samples", { method: "POST", body: formData });
    }
    alert("Samples uploaded! These will be used when building the profile.");
  };

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Create Curated DoppelWriter</h1>
        <p className="text-stone-400 text-sm mb-8">Build a voice profile for any writer. We&apos;ll analyze their published work automatically.</p>

        {/* Toggle */}
        <div className="flex bg-stone-900 rounded-lg p-0.5 mb-8 w-fit">
          <button
            onClick={() => setMode("catalog")}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${mode === "catalog" ? "bg-stone-700 text-white" : "text-stone-400"}`}
          >
            From Our Catalog
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${mode === "custom" ? "bg-stone-700 text-white" : "text-stone-400"}`}
          >
            Custom Writer
          </button>
        </div>

        {mode === "catalog" ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CURATED_WRITERS.map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleBuildCatalog(w.name)}
                  disabled={building}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 text-left hover:border-amber-600/40 transition-colors disabled:opacity-50"
                >
                  <h3 className="font-semibold text-sm">{w.name}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{w.bio}</p>
                  <p className="text-[10px] text-stone-600 mt-2 uppercase tracking-wider">{w.tag}</p>
                  {buildingName === w.name && (
                    <p className="text-xs text-amber-400 mt-2 animate-pulse">Building...</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-lg">
            {plan !== "pro" && (
              <div className="mb-6 p-4 bg-amber-600/10 border border-amber-500/40 rounded-lg">
                <p className="text-sm text-amber-400">Custom writer building requires the Pro plan.</p>
                <Link href="/pricing" className="text-xs text-amber-400 underline mt-1 inline-block">Upgrade to Pro</Link>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-400 mb-2">Writer Name</label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Ta-Nehisi Coates, your mom's name, your boss"
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-2">Short Bio (optional)</label>
                <input type="text" value={customBio} onChange={(e) => setCustomBio(e.target.value)}
                  placeholder="Who are they and what kind of writing do they do?"
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>

              {/* Upload writing samples for the custom writer */}
              <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
                <h3 className="font-medium mb-2 text-sm">Upload Their Writing (optional)</h3>
                <p className="text-xs text-stone-500 mb-3">
                  Have examples of their writing? Upload them for a more accurate profile. Great for non-famous writers like a family member or colleague.
                </p>
                <label className="block w-full py-6 border-2 border-dashed border-stone-800 rounded-lg text-center cursor-pointer hover:border-amber-600/40 transition-colors">
                  <p className="text-stone-400 text-sm">Upload .docx, .txt, or .md files</p>
                  <input type="file" accept=".docx,.txt,.md" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <button
                onClick={handleBuildCustom}
                disabled={!customName || building || plan !== "pro"}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40"
              >
                {building ? `Building ${buildingName}...` : "Build DoppelWriter"}
              </button>

              {building && (
                <p className="text-stone-500 text-sm text-center animate-pulse">
                  Searching for published writing and analyzing style. This takes 30-60 seconds.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
