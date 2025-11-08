import { readFileSync, writeFileSync } from "fs";

// Usage: bun scripts/append-results-to-readme.ts <docs-dir> [type]
// Example: bun scripts/append-results-to-readme.ts docs/bench-single-2vm single
// Example: bun scripts/append-results-to-readme.ts docs/bench-multi-2vm multi
const args = Bun.argv.slice(2);
const docsDir = args[0] || "docs/bench-single";
const benchType = args[1] || "single"; // 'single' or 'multi'

const resultsPath = `${docsDir}/README.md`;
const readmePath = "README.md";

console.log(`Reading results from: ${resultsPath}`);
console.log(`Benchmark type: ${benchType}`);

// Read current README
let readme = readFileSync(readmePath, "utf-8");

// Read benchmark results
let results = readFileSync(resultsPath, "utf-8");

// Fix SVG relative paths for root README
results = results.replace(
  /!\[(.*?)\]\(\.\/chart-(.*?)\.svg\)/g,
  `![$1](./${docsDir}/chart-$2.svg)`,
);

// Remove existing results section if present
const startMarker = benchType === "single"
  ? "<!-- START BENCHMARK SINGLE RESULTS -->"
  : "<!-- START BENCHMARK MULTI RESULTS -->";
const endMarker = benchType === "single"
  ? "<!-- END BENCHMARK SINGLE RESULTS -->"
  : "<!-- END BENCHMARK MULTI RESULTS -->";

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

const newSection = `${startMarker}

${results}

${endMarker}`;

let finalReadme: string;

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  // Replace the section in place to maintain order
  const before = readme.substring(0, startIndex);
  const after = readme.substring(endIndex + endMarker.length);
  finalReadme = before + newSection + after;
} else {
  // Section doesn't exist, append to end
  finalReadme = readme + "\n\n" + newSection + "\n";
}

writeFileSync(readmePath, finalReadme);
console.log(`✅ Results appended to README`);
