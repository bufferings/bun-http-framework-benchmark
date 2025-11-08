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

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  // Remove the section between markers (including both markers)
  const before = readme.substring(0, startIndex).trimEnd();
  const after = readme.substring(endIndex + endMarker.length).trimStart();
  readme = before + (after ? "\n\n" + after : "");
}

// Prepare new section
const newSection = `

${startMarker}

${results}

${endMarker}
`;

// Insert new results at the appropriate position to maintain order (single before multi)
let finalReadme: string;

if (benchType === "single") {
  // For single results: insert before multi section if it exists, otherwise append to end
  const multiStartMarker = "<!-- START BENCHMARK MULTI RESULTS -->";
  const multiStartIndex = readme.indexOf(multiStartMarker);

  if (multiStartIndex !== -1) {
    // Insert before multi section
    const before = readme.substring(0, multiStartIndex).trimEnd();
    const after = readme.substring(multiStartIndex);
    finalReadme = before + newSection + "\n\n" + after;
  } else {
    // Multi section doesn't exist, append to end
    finalReadme = readme + newSection;
  }
} else {
  // For multi results: insert after single section if it exists, otherwise append to end
  const singleEndMarker = "<!-- END BENCHMARK SINGLE RESULTS -->";
  const singleEndIndex = readme.indexOf(singleEndMarker);

  if (singleEndIndex !== -1) {
    // Insert after single section
    const before = readme.substring(0, singleEndIndex + singleEndMarker.length);
    const after = readme.substring(singleEndIndex + singleEndMarker.length).trimStart();
    finalReadme = before + newSection + (after ? "\n\n" + after : "");
  } else {
    // Single section doesn't exist, append to end
    finalReadme = readme + newSection;
  }
}

writeFileSync(readmePath, finalReadme);
console.log(`✅ Results appended to README`);
