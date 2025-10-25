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

// Get runtime versions and benchmark config from environment
const bunVersion = process.env.BUN_VERSION || 'unknown'
const nodeVersion = process.env.NODE_VERSION || 'unknown'
const denoVersion = process.env.DENO_VERSION || 'unknown'
const benchTime = process.env.BENCH_TIME || '30'
const benchConnections = process.env.BENCH_CONNECTIONS || '128'
const benchRuns = process.env.BENCH_RUNS || '1'
const osInfo = process.env.OS_INFO || 'Ubuntu (GitHub Actions)'
const cpuModel = process.env.CPU_MODEL || 'unknown'
const cpuCores = process.env.CPU_CORES || 'unknown'
const totalMem = process.env.TOTAL_MEM || 'unknown'

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

Generated on ${date}

${results}

### Benchmark Environment

| Item | Value |
|---|---|
| Platform | GitHub Actions (ubuntu-latest) |
| OS | ${osInfo} |
| CPU | ${cpuModel} (${cpuCores} cores) |
| Memory | ${totalMem} |
| Runtimes | Bun ${bunVersion}, Node.js ${nodeVersion}, Deno ${denoVersion} |
| Configuration | ${benchTime}s duration, ${benchConnections} connections, ${benchRuns} run(s) |

${endMarker}
`

writeFileSync(readmePath, readme + newSection)
console.log(`✅ Results appended to README (${date})`)
