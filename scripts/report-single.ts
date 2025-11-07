import { readFileSync, copyFileSync } from 'fs'
import { generateDocs, type Results } from './tools/generate-docs-single'

const args = Bun.argv.slice(2)

if (args.length < 2) {
	console.error('Usage: bun scripts/report-single.ts <results-file> <output-dir>')
	console.error('Example: bun scripts/report-single.ts results/single.json docs/bench-single')
	process.exit(1)
}

const resultsFile = args[0]
const outputDir = args[1]

console.log(`Reading results from: ${resultsFile}`)
const results: Results = JSON.parse(readFileSync(resultsFile, 'utf-8'))

generateDocs(results, outputDir)

// Copy results.json to output directory
copyFileSync(resultsFile, `${outputDir}/results.json`)

console.log(`Documentation generated in ${outputDir}/`)
console.log(`Results JSON copied to ${outputDir}/results.json`)

