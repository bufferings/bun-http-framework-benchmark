import { writeFileSync, existsSync, mkdirSync } from 'fs'

export type BenchmarkResult = {
	endpoint: string
	runtime: string
	framework: string
	displayName: string
	results: number[]
	median: number
}

export type Environment = {
	platform?: string
	os?: string
	cpu?: string
	memory?: string
	runtimes?: Record<string, string>
}

export type Results = {
	meta: {
		timestamp: string
		benchmark: {
			tool: string
			duration: number
			connections: number
			runs: number
		}
		environment?: Environment
		environments?: {
			load?: Environment
			target?: Environment
		}
	}
	benchmarks: BenchmarkResult[]
}

export const generateDocs = (results: Results, outputDir: string) => {
	// Create docs directory
	if (!existsSync('docs')) mkdirSync('docs')
	if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

	// Prepare data
	const testOrder = ['ping', 'query', 'body', 'validate-zod', 'validate-valibot', 'validate-arktype']

	// Create data map: framework -> endpoint -> median
	const dataMap = new Map<string, Map<string, number>>()
	for (const result of results.benchmarks) {
		const key = `${result.runtime}/${result.framework}`
		if (!dataMap.has(key)) {
			dataMap.set(key, new Map())
		}
		dataMap.get(key)!.set(result.endpoint, result.median)
	}

	// Get all available frameworks from results, sorted by ping performance (fastest first)
	const allFrameworks = Array.from(dataMap.keys()).sort((a, b) => {
		const pingA = dataMap.get(a)?.get('ping') || 0
		const pingB = dataMap.get(b)?.get('ping') || 0
		return pingB - pingA // descending order (fastest first)
	})

	// Filter to only available tests
	const availableTests = testOrder.filter(test =>
		allFrameworks.some(fw => dataMap.get(fw)?.has(test))
	)
	const availableFrameworks = allFrameworks

	// Generate charts
	generateRelativeSVG(dataMap, availableTests, availableFrameworks, outputDir)
	generateAbsoluteSVG(dataMap, availableTests, availableFrameworks, outputDir)
	generateREADME(results, dataMap, availableTests, availableFrameworks, outputDir)
}

const generateRelativeSVG = (
	dataMap: Map<string, Map<string, number>>,
	tests: string[],
	frameworks: string[],
	outputDir: string
) => {
	const width = 1000
	const chartLeft = 80
	const chartRight = 920
	const chartTop = 60
	const chartBottom = 400
	const chartWidth = chartRight - chartLeft
	const chartHeight = chartBottom - chartTop

	// Calculate legend dimensions
	const maxLegendWidth = 800
	const itemWidth = 150
	const lineHeight = 20
	
	// Group frameworks by runtime
	const frameworksByRuntime = new Map<string, string[]>()
	frameworks.forEach(fw => {
		const runtime = fw.split('/')[0]
		if (!frameworksByRuntime.has(runtime)) {
			frameworksByRuntime.set(runtime, [])
		}
		frameworksByRuntime.get(runtime)!.push(fw)
	})

	// Calculate legend height (number of lines)
	let legendLines = 0
	let currentLineWidth = 0
	frameworksByRuntime.forEach((runtimeFrameworks) => {
		runtimeFrameworks.forEach(fw => {
			if (currentLineWidth + itemWidth > maxLegendWidth && currentLineWidth > 0) {
				legendLines++
				currentLineWidth = itemWidth
			} else {
				currentLineWidth += itemWidth
			}
		})
		legendLines++ // Add line for this runtime group
		currentLineWidth = 0 // Reset for next runtime group
	})

	const legendHeight = legendLines * lineHeight
	const legendTop = chartBottom + 60 // Space below chart
	const legendBottom = legendTop + legendHeight
	const height = legendBottom + 20 // Add bottom margin

	// Calculate relative performance
	const relativeData = new Map<string, (number | null)[]>()
	for (const test of tests) {
		const values = frameworks.map(fw => dataMap.get(fw)?.get(test))
		const max = Math.max(...values.filter(v => v !== undefined) as number[])

		frameworks.forEach((fw, i) => {
			if (!relativeData.has(fw)) relativeData.set(fw, [])
			const value = values[i]
			// If no data for this test, push null instead of 0
			const relative = value && max > 0 ? (value / max) * 100 : null
			relativeData.get(fw)!.push(relative)
		})
	}

	// Helper to convert percentage to Y coordinate
	const getY = (percent: number) => chartBottom - (percent / 100) * chartHeight

	// Helper to get X coordinate
	const getX = (index: number) => chartLeft + (chartWidth / (tests.length)) * (index + 0.5)

	// Colors and markers
	const colors: Record<string, string> = {
		'elysia': '#8b5cf6',
		'kori': '#3b82f6',
		'hono': '#f59e0b',
		'fastify': '#10b981',
		'express': '#ec4899'
	}

	const getColor = (fw: string) => colors[fw.split('/')[1]] || '#999'
	const getMarkerClass = (fw: string) => {
		const runtime = fw.split('/')[0]
		if (runtime === 'bun') return 'circle'
		if (runtime === 'deno') return 'rect'
		if (runtime === 'node') return 'triangle'
		return 'circle'
	}

	// Generate SVG
	let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .chart-bg { fill: #2d2d2d; }
      .stripe { fill: rgba(255,255,255,0.03); }
      .grid-line { stroke: rgba(255,255,255,0.1); stroke-width: 1; }
      .axis-line { stroke: rgba(255,255,255,0.3); stroke-width: 2; }
      .label { fill: #b0b0b0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; }
      .title { fill: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; font-weight: normal; }
      .line-elysia { stroke: #8b5cf6; fill: none; stroke-width: 2; }
      .line-kori { stroke: #3b82f6; fill: none; stroke-width: 2; }
      .line-hono { stroke: #f59e0b; fill: none; stroke-width: 2; }
      .line-fastify { stroke: #10b981; fill: none; stroke-width: 2; }
      .line-express { stroke: #ec4899; fill: none; stroke-width: 2; }
      .marker { fill: #2d2d2d; stroke-width: 2; }
    </style>
  </defs>

  <rect class="chart-bg" width="${width}" height="${height}"/>

  <!-- Alternating stripes -->\n`

	// Add stripes
	for (let i = 0; i < tests.length; i++) {
		if (i % 2 === 1) {
			const x = getX(i) - chartWidth / tests.length / 2
			svg += `  <rect class="stripe" x="${x}" y="${chartTop}" width="${chartWidth / tests.length}" height="${chartHeight}"/>\n`
		}
	}

	// Grid and axes
	svg += `
  <!-- Grid lines -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		svg += `  <line class="grid-line" x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}"/>\n`
	}

	svg += `
  <!-- Axes -->
  <line class="axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"/>
  <line class="axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"/>

  <!-- Y-axis labels -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		const label = i * 20
		svg += `  <text class="label" x="70" y="${y + 5}" text-anchor="end">${label}%</text>\n`
	}

	svg += `
  <!-- Y-axis title -->
  <text class="title" x="20" y="${(chartTop + chartBottom) / 2}" text-anchor="middle" transform="rotate(-90, 20, ${(chartTop + chartBottom) / 2})">Relative Performance (%)</text>

  <!-- X-axis labels -->\n`
	tests.forEach((test, i) => {
		const x = getX(i)
		const label = test.replace('validate-', '')
		svg += `  <text class="label" x="${x}" y="${chartBottom + 25}" text-anchor="middle">${label}</text>\n`
	})

	// Draw lines and markers
	for (const fw of frameworks) {
		const data = relativeData.get(fw)
		if (!data) continue

		const color = getColor(fw)
		const fwName = fw.split('/')[1]
		const markerClass = getMarkerClass(fw)
		// Filter out null values when creating polyline points
		const points = data
			.map((val, i) => val !== null ? `${getX(i)},${getY(val)}` : null)
			.filter(p => p !== null)
			.join(' ')

		svg += `\n  <!-- ${fw} -->\n`
		if (points) {
			svg += `  <polyline class="line-${fwName}" points="${points}"/>\n`
		}

		// Markers (skip null values)
		data.forEach((val, i) => {
			if (val === null) return // Skip null values
			const x = getX(i)
			const y = getY(val)
			if (markerClass === 'circle') {
				svg += `  <circle class="marker" cx="${x}" cy="${y}" r="7" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `  <rect class="marker" x="${x - 7}" y="${y - 7}" width="14" height="14" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				// Triangle pointing up
				const x1 = x, y1 = y - 8
				const x2 = x - 7, y2 = y + 6
				const x3 = x + 7, y3 = y + 6
				svg += `  <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
		})
	}

	// Legend
	svg += `\n  <!-- Legend -->\n  <g transform="translate(100, ${legendTop})">\n`
	let legendX = 0
	let legendY = 0

	// Render legend grouped by runtime
	frameworksByRuntime.forEach((runtimeFrameworks, runtime) => {
		runtimeFrameworks.forEach(fw => {
			// Check if we need to wrap to next line within this runtime group
			if (legendX + itemWidth > maxLegendWidth && legendX > 0) {
				legendX = 0
				legendY += lineHeight
			}
			
			const color = getColor(fw)
			const markerClass = getMarkerClass(fw)

			if (markerClass === 'circle') {
				svg += `    <circle class="marker" cx="${legendX}" cy="${legendY}" r="7" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `    <rect class="marker" x="${legendX - 7}" y="${legendY - 7}" width="14" height="14" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = legendX, y1 = legendY - 8
				const x2 = legendX - 7, y2 = legendY + 6
				const x3 = legendX + 7, y3 = legendY + 6
				svg += `    <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
			svg += `    <text class="label" x="${legendX + 15}" y="${legendY + 5}" font-size="14">${fw}</text>\n`

			legendX += itemWidth
		})
		
		// Move to next line for next runtime group
		legendX = 0
		legendY += lineHeight
	})
	svg += `  </g>\n</svg>`

	writeFileSync(`${outputDir}/chart-relative.svg`, svg)
}

const generateAbsoluteSVG = (
	dataMap: Map<string, Map<string, number>>,
	tests: string[],
	frameworks: string[],
	outputDir: string
) => {
	const width = 1000
	const chartLeft = 80
	const chartRight = 920
	const chartTop = 60
	const chartBottom = 400
	const chartWidth = chartRight - chartLeft
	const chartHeight = chartBottom - chartTop

	// Calculate legend dimensions
	const maxLegendWidth = 800
	const itemWidth = 150
	const lineHeight = 20
	
	// Group frameworks by runtime
	const frameworksByRuntime = new Map<string, string[]>()
	frameworks.forEach(fw => {
		const runtime = fw.split('/')[0]
		if (!frameworksByRuntime.has(runtime)) {
			frameworksByRuntime.set(runtime, [])
		}
		frameworksByRuntime.get(runtime)!.push(fw)
	})

	// Calculate legend height (number of lines)
	let legendLines = 0
	let currentLineWidth = 0
	frameworksByRuntime.forEach((runtimeFrameworks) => {
		runtimeFrameworks.forEach(fw => {
			if (currentLineWidth + itemWidth > maxLegendWidth && currentLineWidth > 0) {
				legendLines++
				currentLineWidth = itemWidth
			} else {
				currentLineWidth += itemWidth
			}
		})
		legendLines++ // Add line for this runtime group
		currentLineWidth = 0 // Reset for next runtime group
	})

	const legendHeight = legendLines * lineHeight
	const legendTop = chartBottom + 60 // Space below chart
	const legendBottom = legendTop + legendHeight
	const height = legendBottom + 20 // Add bottom margin

	// Find max value for scaling
	let maxVal = 0
	for (const fw of frameworks) {
		for (const test of tests) {
			const val = dataMap.get(fw)?.get(test) || 0
			maxVal = Math.max(maxVal, val)
		}
	}

	// Round up to nice number
	const scale = Math.ceil(maxVal / 50000) * 50000

	// Helper to convert value to Y coordinate
	const getY = (value: number) => chartBottom - (value / scale) * chartHeight

	// Helper to get X coordinate
	const getX = (index: number) => chartLeft + (chartWidth / tests.length) * (index + 0.5)

	// Colors
	const colors: Record<string, string> = {
		'elysia': '#8b5cf6',
		'kori': '#3b82f6',
		'hono': '#f59e0b',
		'fastify': '#10b981',
		'express': '#ec4899'
	}

	const getColor = (fw: string) => colors[fw.split('/')[1]] || '#999'
	const getMarkerClass = (fw: string) => {
		const runtime = fw.split('/')[0]
		if (runtime === 'bun') return 'circle'
		if (runtime === 'deno') return 'rect'
		if (runtime === 'node') return 'triangle'
		return 'circle'
	}

	// Generate SVG
	let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .chart-bg { fill: #2d2d2d; }
      .stripe { fill: rgba(255,255,255,0.03); }
      .grid-line { stroke: rgba(255,255,255,0.1); stroke-width: 1; }
      .axis-line { stroke: rgba(255,255,255,0.3); stroke-width: 2; }
      .label { fill: #b0b0b0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; }
      .title { fill: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; font-weight: normal; }
      .line-elysia { stroke: #8b5cf6; fill: none; stroke-width: 2; }
      .line-kori { stroke: #3b82f6; fill: none; stroke-width: 2; }
      .line-hono { stroke: #f59e0b; fill: none; stroke-width: 2; }
      .line-fastify { stroke: #10b981; fill: none; stroke-width: 2; }
      .line-express { stroke: #ec4899; fill: none; stroke-width: 2; }
      .marker { fill: #2d2d2d; stroke-width: 2; }
    </style>
  </defs>

  <rect class="chart-bg" width="${width}" height="${height}"/>

  <!-- Alternating stripes -->\n`

	// Add stripes
	for (let i = 0; i < tests.length; i++) {
		if (i % 2 === 1) {
			const x = getX(i) - chartWidth / tests.length / 2
			svg += `  <rect class="stripe" x="${x}" y="${chartTop}" width="${chartWidth / tests.length}" height="${chartHeight}"/>\n`
		}
	}

	// Grid and axes
	svg += `
  <!-- Grid lines -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		svg += `  <line class="grid-line" x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}"/>\n`
	}

	svg += `
  <!-- Axes -->
  <line class="axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"/>
  <line class="axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"/>

  <!-- Y-axis labels -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		const label = (scale / 5 * i / 1000).toFixed(0) + 'k'
		svg += `  <text class="label" x="70" y="${y + 5}" text-anchor="end">${label}</text>\n`
	}

	svg += `
  <!-- Y-axis title -->
  <text class="title" x="20" y="${(chartTop + chartBottom) / 2}" text-anchor="middle" transform="rotate(-90, 20, ${(chartTop + chartBottom) / 2})">Requests per Second</text>

  <!-- X-axis labels -->\n`
	tests.forEach((test, i) => {
		const x = getX(i)
		const label = test.replace('validate-', '')
		svg += `  <text class="label" x="${x}" y="${chartBottom + 25}" text-anchor="middle">${label}</text>\n`
	})

	// Draw lines and markers
	for (const fw of frameworks) {
		const color = getColor(fw)
		const fwName = fw.split('/')[1]
		const markerClass = getMarkerClass(fw)

		// Filter out tests with no data
		const points = tests
			.map((test, i) => {
				const val = dataMap.get(fw)?.get(test)
				return val ? `${getX(i)},${getY(val)}` : null
			})
			.filter(p => p !== null)
			.join(' ')

		svg += `\n  <!-- ${fw} -->\n`
		if (points) {
			svg += `  <polyline class="line-${fwName}" points="${points}"/>\n`
		}

		// Markers (skip tests with no data)
		tests.forEach((test, i) => {
			const val = dataMap.get(fw)?.get(test)
			if (!val) return // Skip if no data
			const x = getX(i)
			const y = getY(val)
			if (markerClass === 'circle') {
				svg += `  <circle class="marker" cx="${x}" cy="${y}" r="7" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `  <rect class="marker" x="${x - 7}" y="${y - 7}" width="14" height="14" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				// Triangle pointing up
				const x1 = x, y1 = y - 8
				const x2 = x - 7, y2 = y + 6
				const x3 = x + 7, y3 = y + 6
				svg += `  <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
		})
	}

	// Legend
	svg += `\n  <!-- Legend -->\n  <g transform="translate(100, ${legendTop})">\n`
	let legendX = 0
	let legendY = 0

	// Render legend grouped by runtime
	frameworksByRuntime.forEach((runtimeFrameworks, runtime) => {
		runtimeFrameworks.forEach(fw => {
			// Check if we need to wrap to next line within this runtime group
			if (legendX + itemWidth > maxLegendWidth && legendX > 0) {
				legendX = 0
				legendY += lineHeight
			}
			
			const color = getColor(fw)
			const markerClass = getMarkerClass(fw)

			if (markerClass === 'circle') {
				svg += `    <circle class="marker" cx="${legendX}" cy="${legendY}" r="7" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `    <rect class="marker" x="${legendX - 7}" y="${legendY - 7}" width="14" height="14" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = legendX, y1 = legendY - 8
				const x2 = legendX - 7, y2 = legendY + 6
				const x3 = legendX + 7, y3 = legendY + 6
				svg += `    <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
			svg += `    <text class="label" x="${legendX + 15}" y="${legendY + 5}" font-size="14">${fw}</text>\n`

			legendX += itemWidth
		})
		
		// Move to next line for next runtime group
		legendX = 0
		legendY += lineHeight
	})
	svg += `  </g>\n</svg>`

	writeFileSync(`${outputDir}/chart-absolute.svg`, svg)
}

const generateREADME = (
	results: Results,
	dataMap: Map<string, Map<string, number>>,
	tests: string[],
	frameworks: string[],
	outputDir: string
) => {
	// Create displayName map: runtime/framework -> displayName
	const displayNameMap = new Map<string, string>()
	for (const result of results.benchmarks) {
		const key = `${result.runtime}/${result.framework}`
		if (!displayNameMap.has(key)) {
			displayNameMap.set(key, result.displayName)
		}
	}

	let md = `## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process.

### Results (req/s)

| Runtime | Framework      |`

	tests.forEach(test => {
		const label = test.replace('validate-', '')
		md += ` ${label.padEnd(9)} |`
	})
	md += `\n|---------|----------------|`
	tests.forEach(() => md += `-----------:|`)
	md += `\n`

	frameworks.forEach(fw => {
		const [runtime, framework] = fw.split('/')
		const displayName = displayNameMap.get(fw) || framework
		md += `| ${runtime.padEnd(7)} | ${displayName.padEnd(14)} |`
		tests.forEach(test => {
			const val = dataMap.get(fw)?.get(test)
			if (val) {
				md += ` ${val.toFixed(0).padStart(9).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} |`
			} else {
				md += ` ${'-'.padStart(9)} |`
			}
		})
		md += `\n`
	})

	md += `
### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | ${results.meta.timestamp} |
| Tool | ${results.meta.benchmark.tool} |
| Settings | ${results.meta.benchmark.duration}s duration, ${results.meta.benchmark.connections} connections, ${results.meta.benchmark.runs} run${results.meta.benchmark.runs > 1 ? 's' : ''} |`

	// Add environment info (single process or 2-VM)
	if (results.meta.environment) {
		const env = results.meta.environment

		// Add runtime versions
		if (env.runtimes) {
			const runtimesStr = Object.entries(env.runtimes)
				.map(([name, version]) => `${name.charAt(0).toUpperCase() + name.slice(1)} ${version}`)
				.join(', ')
			md += `\n| Runtimes | ${runtimesStr} |`
		}

		md += `

Machine:

| Item | Value |
|---|---|`
		if (env.platform) md += `\n| Platform | ${env.platform} |`
		if (env.os) md += `\n| OS | ${env.os} |`
		if (env.cpu) md += `\n| CPU | ${env.cpu} |`
		if (env.memory) md += `\n| Memory | ${env.memory} |`
	} else if (results.meta.environments) {
		// 2-VM case
		// Add runtime versions from target
		if (results.meta.environments.target?.runtimes) {
			const runtimesStr = Object.entries(results.meta.environments.target.runtimes)
				.map(([name, version]) => `${name.charAt(0).toUpperCase() + name.slice(1)} ${version}`)
				.join(', ')
			md += `\n| Runtimes | ${runtimesStr} |`
		}

		md += `

Load Machine:

| Item | Value |
|---|---|`
		if (results.meta.environments.load) {
			const load = results.meta.environments.load
			if (load.platform) md += `\n| Platform | ${load.platform} |`
			if (load.os) md += `\n| OS | ${load.os} |`
			if (load.cpu) md += `\n| CPU | ${load.cpu} |`
			if (load.memory) md += `\n| Memory | ${load.memory} |`
		}

		md += `

Target Machine:

| Item | Value |
|---|---|`
		if (results.meta.environments.target) {
			const target = results.meta.environments.target
			if (target.platform) md += `\n| Platform | ${target.platform} |`
			if (target.os) md += `\n| OS | ${target.os} |`
			if (target.cpu) md += `\n| CPU | ${target.cpu} |`
			if (target.memory) md += `\n| Memory | ${target.memory} |`
		}
	}

	md += `\n`

	writeFileSync(`${outputDir}/README.md`, md)
}
