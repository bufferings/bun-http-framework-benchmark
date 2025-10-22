import {
	readdirSync,
	readFileSync,
	writeFileSync,
	mkdirSync,
	existsSync,
	lstatSync,
	copyFileSync
} from 'fs'
import { join } from 'path'

const artifactsDir = 'artifacts'
const resultsDir = 'results'

// Create results directory if it doesn't exist
if (!existsSync(resultsDir)) {
	mkdirSync(resultsDir, { recursive: true })
}

interface ResultRow {
	name: string
	runtime: string
	total: number
	row: string
}

const toNumber = (a: string) => +a.replaceAll(',', '')

// Number of benchmark commands (should match bench.ts)
const commandCount = 3

const results: ResultRow[] = []
const runtimes = new Set<string>()

// Read all artifact directories
if (!existsSync(artifactsDir)) {
	console.error('No artifacts directory found')
	process.exit(1)
}

const artifacts = readdirSync(artifactsDir).filter((dir) => {
	try {
		return lstatSync(join(artifactsDir, dir)).isDirectory()
	} catch {
		return false
	}
})

console.log(`Found ${artifacts.length} artifact directories`)

// Process each artifact
for (const artifactDir of artifacts) {
	const artifactPath = join(artifactsDir, artifactDir)
	const resultsFile = join(artifactPath, 'results', 'results.md')

	if (!existsSync(resultsFile)) {
		console.warn(`No results.md found in ${artifactDir}`)
		continue
	}

	// Copy runtime-specific result files
	const runtimeDirs = readdirSync(join(artifactPath, 'results')).filter(
		(item) => {
			try {
				return lstatSync(join(artifactPath, 'results', item)).isDirectory()
			} catch {
				return false
			}
		}
	)

	for (const runtime of runtimeDirs) {
		runtimes.add(runtime)
		const targetDir = join(resultsDir, runtime)

		if (!existsSync(targetDir)) {
			mkdirSync(targetDir, { recursive: true })
		}

		const files = readdirSync(join(artifactPath, 'results', runtime))
		for (const file of files) {
			const sourcePath = join(artifactPath, 'results', runtime, file)
			const targetPath = join(targetDir, file)

			try {
				copyFileSync(sourcePath, targetPath)
			} catch (error) {
				console.warn(`Failed to copy ${sourcePath}: ${error}`)
			}
		}
	}

	// Parse results.md
	// Note: Framework names may include version info (e.g., "hono@4.10.2")
	const content = readFileSync(resultsFile, { encoding: 'utf-8' })
	const lines = content.split('\n')

	for (const line of lines) {
		// Skip header and divider lines
		if (
			!line.trim() ||
			line.includes('Framework') ||
			line.includes('---')
		) {
			continue
		}

		const data = line
			.replace(/\ /g, '')
			.split('|')
			.filter((a) => a)

		if (data.length !== commandCount + 3) continue

		const [name, runtime, total] = data
		results.push({
			name, // Includes version if present
			runtime,
			total: toNumber(total),
			row: line
		})
	}
}

console.log(`Collected ${results.length} results`)

// Sort by total score (descending)
results.sort((a, b) => b.total - a.total)

// Generate final results.md
const header = `
|  Framework       | Runtime | Average | Ping       | Query      | Body       |
| ---------------- | ------- | ------- | ---------- | ---------- | ---------- |
`

const content = header + results.map((r) => r.row).join('\n') + '\n'

writeFileSync(join(resultsDir, 'results.md'), content)

console.log('Results aggregated successfully!')
console.log('\nFinal results:')
console.log(content)
