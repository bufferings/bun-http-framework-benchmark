import { readFileSync, copyFileSync } from 'fs'
import { generateMultiDocs, type MultiResults } from './tools/generate-docs-multi'

const args = Bun.argv.slice(2)

if (args.length < 2) {
	console.error('Usage: bun scripts/report-multi.ts <results-file> <output-dir>')
	console.error('Example: bun scripts/report-multi.ts results/multi.json docs/bench-multi')
	process.exit(1)
}

const resultsFile = args[0]
const outputDir = args[1]

console.log(`Reading results from: ${resultsFile}`)
const results: MultiResults = JSON.parse(readFileSync(resultsFile, 'utf-8'))

generateMultiDocs(results, outputDir)

// Copy results.json to output directory
copyFileSync(resultsFile, `${outputDir}/results.json`)

console.log(`Documentation generated in ${outputDir}/`)
console.log(`Results JSON copied to ${outputDir}/results.json`)

