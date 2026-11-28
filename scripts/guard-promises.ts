// Promise guard. Fails the build when (a) a registered promise's test is missing
// or is not picked up by the test runner, (b) a registered sentence is gone from
// its page (stale), or (c) a public page makes a feature promise that is not in
// the registry. Generic: only CONFIG below is site-specific. Node builtins only,
// no TS-only syntax, so it can be lifted into other repos unchanged.
import fs from "node:fs";
import path from "node:path";

// ---------------- CONFIG (the only site-specific part) ----------------
const CONFIG = {
  root: process.cwd(),
  // Directories walked for rendered pages, plus single content files.
  pageDirs: ["src/app"],
  pageExtensions: [".tsx"],
  pageFiles: ["src/lib/blog-posts.ts"],
  skipDirNames: ["api"],
  // A sentence matching any pattern is a feature promise and must be registered.
  promisePatterns: [
    /\b(you can|can) (always )?(delete|cancel|unsubscribe|export|download)\b/i,
    /\bat any ?time\b|\banytime\b/i,
    /\b(built|build) [^.]{0,60}\bfrom (their|public|what)\b/i,
    /\bwe (never|do not|don't|will not)\b/i,
    /\bnever (shared|stored|sold|retained)\b/i,
    /\bno (credit card|sign-?up)\b/i,
    /\bwe guarantee\b|\b100% guarantee\b/i,
  ],
  registryFile: "src/lib/promises.json", // [{page, sentence, test_file, test_name}]
  // Test runner glob, as a regex on the repo-relative test_file path.
  testFileRegex: /^src\/.*\.test\.ts$/,
};
// -----------------------------------------------------------------------

function norm(s) {
  return s
    .replace(/&apos;|&#39;|&rsquo;|’/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!CONFIG.skipDirNames.includes(e.name)) walk(p, out);
    } else if (CONFIG.pageExtensions.some((x) => e.name.endsWith(x)) && !/\.test\./.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

export function run(config) {
  const cfg = config || CONFIG;
  const errors = [];
  const regPath = path.join(cfg.root, cfg.registryFile);
  let registry = [];
  try {
    registry = JSON.parse(fs.readFileSync(regPath, "utf8"));
  } catch (e) {
    errors.push("cannot read registry " + cfg.registryFile + ": " + e.message);
  }

  // (a) + (b): registry integrity
  for (const r of registry) {
    const id = '"' + r.sentence + '" (' + r.page + ")";
    if (!r.page || !r.sentence || !r.test_file || !r.test_name) {
      errors.push("registry row missing a field: " + JSON.stringify(r));
      continue;
    }
    if (!cfg.testFileRegex.test(r.test_file)) errors.push("test file not in test runner glob: " + r.test_file + " for " + id);
    const tf = path.join(cfg.root, r.test_file);
    if (!fs.existsSync(tf)) {
      errors.push("registered test file missing: " + r.test_file + " for " + id);
    } else {
      const src = fs.readFileSync(tf, "utf8");
      const named = new RegExp("\\b(it|test)(\\.\\w+)?\\(\\s*([\"'`])" + r.test_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\3");
      if (!named.test(src)) errors.push("test name not found as it()/test() in " + r.test_file + ": \"" + r.test_name + "\" for " + id);
    }
    const pf = path.join(cfg.root, r.page);
    if (!fs.existsSync(pf)) errors.push("registered page missing: " + r.page);
    else if (!norm(fs.readFileSync(pf, "utf8")).includes(norm(r.sentence))) {
      errors.push("stale registry row, sentence no longer on " + r.page + ": \"" + r.sentence + '"');
    }
  }

  // (c): every promise sentence on a page must be registered
  const files = cfg.pageFiles.map((f) => path.join(cfg.root, f)).filter((f) => fs.existsSync(f));
  for (const d of cfg.pageDirs) {
    const dp = path.join(cfg.root, d);
    if (fs.existsSync(dp)) walk(dp, files);
  }
  const keys = registry.map((r) => norm(r.sentence || ""));
  let found = 0;
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8").replace(/&apos;|&#39;|&rsquo;/g, "'");
    for (const piece of text.split(/(?<=[.!?])\s+|\n/)) {
      if (!cfg.promisePatterns.some((p) => p.test(piece))) continue;
      found++;
      const n = norm(piece);
      if (!keys.some((k) => k && n.includes(k))) {
        errors.push("UNREGISTERED PROMISE in " + path.relative(cfg.root, f) + ": \"" + piece.trim().slice(0, 140) + "\"");
      }
    }
  }
  return { errors, found, registered: registry.length };
}

const res = run();
if (res.errors.length) {
  console.error("guard-promises FAILED (" + res.errors.length + "):");
  for (const e of res.errors) console.error("  - " + e);
  console.error("Fix the copy, or add a row to " + CONFIG.registryFile + " with a test that proves it.");
  process.exit(1);
}
console.log("guard-promises OK: " + res.found + " promise sentences, " + res.registered + " registry rows, all covered and tests present");
