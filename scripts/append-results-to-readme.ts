import { readFileSync, writeFileSync } from 'fs'

const resultsPath = 'results/results.md'
const readmePath = 'README.md'

// Read current README
let readme = readFileSync(readmePath, 'utf-8')

// Read benchmark results (already includes environment info from bench.ts)
let results = readFileSync(resultsPath, 'utf-8')

// Adjust heading levels: ## -> ###
results = results.replace(/^## /gm, '### ')
results = results.replace(/^### /gm, '#### ')

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

## Latest Benchmark Results

${results}

${endMarker}
`

writeFileSync(readmePath, readme + newSection)
console.log(`✅ Results appended to README`)
