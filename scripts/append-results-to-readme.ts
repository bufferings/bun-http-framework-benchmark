import { readFileSync, writeFileSync } from 'fs'

// Usage: bun scripts/append-results-to-readme.ts <docs-dir>
// Example: bun scripts/append-results-to-readme.ts docs/bench-single-2vm
const args = Bun.argv.slice(2)
const docsDir = args[0] || 'docs/bench-single'

const resultsPath = `${docsDir}/README.md`
const readmePath = 'README.md'

console.log(`Reading results from: ${resultsPath}`)

// Read current README
let readme = readFileSync(readmePath, 'utf-8')

// Read benchmark results
let results = readFileSync(resultsPath, 'utf-8')

// Fix SVG relative paths for root README
results = results.replace(/!\[(.*?)\]\(\.\/chart-(.*?)\.svg\)/g, `![$1](./${docsDir}/chart-$2.svg)`)

// Remove existing results section if present
const startMarker = '<!-- START BENCHMARK RESULTS -->'
const endMarker = '<!-- END BENCHMARK RESULTS -->'

const startIndex = readme.indexOf(startMarker)
const endIndex = readme.indexOf(endMarker)

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
	// Remove the section between markers (including both markers)
	const before = readme.substring(0, startIndex).trimEnd()
	const after = readme.substring(endIndex + endMarker.length).trimStart()
	readme = before + (after ? '\n\n' + after : '')
}

// Append new results
const newSection = `

${startMarker}

${results}

${endMarker}
`

writeFileSync(readmePath, readme + newSection)
console.log(`✅ Results appended to README`)
