import { readFileSync, writeFileSync } from 'fs'

const resultsPath = 'results/results.md'
const readmePath = 'README.md'

// Read current README
let readme = readFileSync(readmePath, 'utf-8')

// Read benchmark results
let results = readFileSync(resultsPath, 'utf-8')

// Adjust heading levels: ## -> ###
results = results.replace(/^## /gm, '### ')

// Get current date in YYYY-MM-DD format
const date = new Date().toISOString().split('T')[0]

// Remove existing results section if present
const startMarker = '<!-- START BENCHMARK RESULTS -->'
const endMarker = '<!-- END BENCHMARK RESULTS -->'

const startIndex = readme.indexOf(startMarker)
const endIndex = readme.indexOf(endMarker)

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
	// Remove the section between markers (including both markers)
	readme = readme.substring(0, startIndex) + readme.substring(endIndex + endMarker.length)
}

// Append new results
const newSection = `

${startMarker}

## Latest Benchmark Results

Generated on ${date}

${results}

${endMarker}
`

writeFileSync(readmePath, readme + newSection)
console.log(`✅ Results appended to README (${date})`)
