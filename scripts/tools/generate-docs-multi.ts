import { writeFileSync, existsSync, mkdirSync } from 'fs'

export type MultiEndpointResult = {
	results: number[]
	median: number
}

export type MultiBenchmarkResult = {
	runtime: string
	framework: string
	displayName: string
	endpoints: Record<string, MultiEndpointResult>
	average: number
}

export type Environment = {
	platform?: string
	os?: string
	cpu?: string
	memory?: string
	runtimes?: Record<string, string>
}

export type MultiResults = {
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
	benchmarks: MultiBenchmarkResult[]
}

export const generateMultiDocs = (results: MultiResults, outputDir: string) => {
	// Create docs directory
	if (!existsSync('docs')) mkdirSync('docs')
	if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

	// Get all endpoint names from first benchmark
	const endpointNames = results.benchmarks.length > 0
		? Object.keys(results.benchmarks[0].endpoints)
		: []

	// Sort frameworks by average performance (fastest first)
	const sortedBenchmarks = [...results.benchmarks].sort((a, b) => b.average - a.average)

	// Generate charts
	generateMultiRelativeSVG(sortedBenchmarks, endpointNames, outputDir)
	generateMultiAbsoluteSVG(sortedBenchmarks, endpointNames, outputDir)
	generateMultiREADME(results, sortedBenchmarks, endpointNames, outputDir)
}

const generateMultiRelativeSVG = (
	benchmarks: MultiBenchmarkResult[],
	endpointNames: string[],
	outputDir: string
) => {
	const width = 1400
	const chartLeft = 100
	const chartRight = 1300
	const chartTop = 60
	const chartBottom = 400
	const chartWidth = chartRight - chartLeft
	const chartHeight = chartBottom - chartTop

	// Calculate legend dimensions
	const maxLegendWidth = 1200
	const itemWidth = 150
	const lineHeight = 20
	
	// Group frameworks by runtime
	const frameworksByRuntime = new Map<string, string[]>()
	benchmarks.forEach(b => {
		const key = `${b.runtime}/${b.framework}`
		const runtime = b.runtime
		if (!frameworksByRuntime.has(runtime)) {
			frameworksByRuntime.set(runtime, [])
		}
		frameworksByRuntime.get(runtime)!.push(key)
	})

	// Calculate legend height
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
		legendLines++
		currentLineWidth = 0
	})

	const legendHeight = legendLines * lineHeight
	const legendTop = chartBottom + 60
	const legendBottom = legendTop + legendHeight
	const height = legendBottom + 20

	// Calculate relative performance for each endpoint
	const relativeData = new Map<string, number[]>()
	for (const endpointName of endpointNames) {
		const values = benchmarks.map(b => b.endpoints[endpointName]?.median || 0)
		const max = Math.max(...values)

		benchmarks.forEach((b, i) => {
			const key = `${b.runtime}/${b.framework}`
			if (!relativeData.has(key)) relativeData.set(key, [])
			const value = values[i]
			const relative = max > 0 ? (value / max) * 100 : 0
			relativeData.get(key)!.push(relative)
		})
	}

	// Helper functions
	const getY = (percent: number) => chartBottom - (percent / 100) * chartHeight
	const getX = (index: number) => chartLeft + (chartWidth / endpointNames.length) * (index + 0.5)

	// Endpoint numbers
	const numberSymbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

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
      .label { fill: #b0b0b0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }
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
	for (let i = 0; i < endpointNames.length; i++) {
		if (i % 2 === 1) {
			const x = getX(i) - chartWidth / endpointNames.length / 2
			svg += `  <rect class="stripe" x="${x}" y="${chartTop}" width="${chartWidth / endpointNames.length}" height="${chartHeight}"/>\n`
		}
	}

	// Grid and axes
	svg += `\n  <!-- Grid lines -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		svg += `  <line class="grid-line" x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}"/>\n`
	}

	svg += `\n  <!-- Axes -->
  <line class="axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"/>
  <line class="axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"/>

  <!-- Y-axis labels -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		const label = i * 20
		svg += `  <text class="label" x="${chartLeft - 10}" y="${y + 5}" text-anchor="end">${label}%</text>\n`
	}

	svg += `\n  <!-- Y-axis title -->
  <text class="title" x="20" y="${(chartTop + chartBottom) / 2}" text-anchor="middle" transform="rotate(-90, 20, ${(chartTop + chartBottom) / 2})">Relative Performance (%)</text>

  <!-- X-axis labels -->\n`
	endpointNames.forEach((name, i) => {
		const x = getX(i)
		svg += `  <text class="label" x="${x}" y="${chartBottom + 25}" text-anchor="middle">${numberSymbols[i]}</text>\n`
	})

	// Draw lines and markers
	for (const b of benchmarks) {
		const key = `${b.runtime}/${b.framework}`
		const data = relativeData.get(key)
		if (!data) continue

		const color = getColor(key)
		const fwName = b.framework
		const markerClass = getMarkerClass(key)

		const points = data.map((val, i) => `${getX(i)},${getY(val)}`).join(' ')

		svg += `\n  <!-- ${key} -->\n`
		svg += `  <polyline class="line-${fwName}" points="${points}"/>\n`

		// Markers
		data.forEach((val, i) => {
			const x = getX(i)
			const y = getY(val)
			if (markerClass === 'circle') {
				svg += `  <circle class="marker" cx="${x}" cy="${y}" r="6" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `  <rect class="marker" x="${x - 6}" y="${y - 6}" width="12" height="12" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = x, y1 = y - 7
				const x2 = x - 6, y2 = y + 5
				const x3 = x + 6, y3 = y + 5
				svg += `  <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
		})
	}

	// Legend
	svg += `\n  <!-- Legend -->\n  <g transform="translate(100, ${legendTop})">\n`
	let legendX = 0
	let legendY = 0

	frameworksByRuntime.forEach((runtimeFrameworks, runtime) => {
		runtimeFrameworks.forEach(fw => {
			if (legendX + itemWidth > maxLegendWidth && legendX > 0) {
				legendX = 0
				legendY += lineHeight
			}
			
			const color = getColor(fw)
			const markerClass = getMarkerClass(fw)

			if (markerClass === 'circle') {
				svg += `    <circle class="marker" cx="${legendX}" cy="${legendY}" r="6" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `    <rect class="marker" x="${legendX - 6}" y="${legendY - 6}" width="12" height="12" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = legendX, y1 = legendY - 7
				const x2 = legendX - 6, y2 = legendY + 5
				const x3 = legendX + 6, y3 = legendY + 5
				svg += `    <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
			svg += `    <text class="label" x="${legendX + 15}" y="${legendY + 4}" font-size="13">${fw}</text>\n`

			legendX += itemWidth
		})
		
		legendX = 0
		legendY += lineHeight
	})
	svg += `  </g>\n</svg>`

	writeFileSync(`${outputDir}/chart-relative.svg`, svg)
}

const generateMultiAbsoluteSVG = (
	benchmarks: MultiBenchmarkResult[],
	endpointNames: string[],
	outputDir: string
) => {
	const width = 1400
	const chartLeft = 100
	const chartRight = 1300
	const chartTop = 60
	const chartBottom = 400
	const chartWidth = chartRight - chartLeft
	const chartHeight = chartBottom - chartTop

	// Calculate legend dimensions
	const maxLegendWidth = 1200
	const itemWidth = 150
	const lineHeight = 20
	
	// Group frameworks by runtime
	const frameworksByRuntime = new Map<string, string[]>()
	benchmarks.forEach(b => {
		const key = `${b.runtime}/${b.framework}`
		const runtime = b.runtime
		if (!frameworksByRuntime.has(runtime)) {
			frameworksByRuntime.set(runtime, [])
		}
		frameworksByRuntime.get(runtime)!.push(key)
	})

	// Calculate legend height
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
		legendLines++
		currentLineWidth = 0
	})

	const legendHeight = legendLines * lineHeight
	const legendTop = chartBottom + 60
	const legendBottom = legendTop + legendHeight
	const height = legendBottom + 20

	// Find max value for scaling
	let maxVal = 0
	for (const b of benchmarks) {
		for (const endpointName of endpointNames) {
			const val = b.endpoints[endpointName]?.median || 0
			maxVal = Math.max(maxVal, val)
		}
	}

	// Round up to nice number
	const scale = Math.ceil(maxVal / 50000) * 50000

	// Helper functions
	const getY = (value: number) => chartBottom - (value / scale) * chartHeight
	const getX = (index: number) => chartLeft + (chartWidth / endpointNames.length) * (index + 0.5)

	// Endpoint numbers
	const numberSymbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

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
      .label { fill: #b0b0b0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }
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
	for (let i = 0; i < endpointNames.length; i++) {
		if (i % 2 === 1) {
			const x = getX(i) - chartWidth / endpointNames.length / 2
			svg += `  <rect class="stripe" x="${x}" y="${chartTop}" width="${chartWidth / endpointNames.length}" height="${chartHeight}"/>\n`
		}
	}

	// Grid and axes
	svg += `\n  <!-- Grid lines -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		svg += `  <line class="grid-line" x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}"/>\n`
	}

	svg += `\n  <!-- Axes -->
  <line class="axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"/>
  <line class="axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"/>

  <!-- Y-axis labels -->\n`
	for (let i = 0; i <= 5; i++) {
		const y = chartBottom - (chartHeight / 5) * i
		const label = (scale / 5 * i / 1000).toFixed(0) + 'k'
		svg += `  <text class="label" x="${chartLeft - 10}" y="${y + 5}" text-anchor="end">${label}</text>\n`
	}

	svg += `\n  <!-- Y-axis title -->
  <text class="title" x="20" y="${(chartTop + chartBottom) / 2}" text-anchor="middle" transform="rotate(-90, 20, ${(chartTop + chartBottom) / 2})">Requests per Second</text>

  <!-- X-axis labels -->\n`
	endpointNames.forEach((name, i) => {
		const x = getX(i)
		svg += `  <text class="label" x="${x}" y="${chartBottom + 25}" text-anchor="middle">${numberSymbols[i]}</text>\n`
	})

	// Draw lines and markers
	for (const b of benchmarks) {
		const key = `${b.runtime}/${b.framework}`
		const color = getColor(key)
		const fwName = b.framework
		const markerClass = getMarkerClass(key)

		const points = endpointNames
			.map((name, i) => {
				const val = b.endpoints[name]?.median
				return val ? `${getX(i)},${getY(val)}` : null
			})
			.filter(p => p !== null)
			.join(' ')

		svg += `\n  <!-- ${key} -->\n`
		if (points) {
			svg += `  <polyline class="line-${fwName}" points="${points}"/>\n`
		}

		// Markers
		endpointNames.forEach((name, i) => {
			const val = b.endpoints[name]?.median
			if (!val) return
			const x = getX(i)
			const y = getY(val)
			if (markerClass === 'circle') {
				svg += `  <circle class="marker" cx="${x}" cy="${y}" r="6" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `  <rect class="marker" x="${x - 6}" y="${y - 6}" width="12" height="12" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = x, y1 = y - 7
				const x2 = x - 6, y2 = y + 5
				const x3 = x + 6, y3 = y + 5
				svg += `  <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
		})
	}

	// Legend
	svg += `\n  <!-- Legend -->\n  <g transform="translate(100, ${legendTop})">\n`
	let legendX = 0
	let legendY = 0

	frameworksByRuntime.forEach((runtimeFrameworks, runtime) => {
		runtimeFrameworks.forEach(fw => {
			if (legendX + itemWidth > maxLegendWidth && legendX > 0) {
				legendX = 0
				legendY += lineHeight
			}
			
			const color = getColor(fw)
			const markerClass = getMarkerClass(fw)

			if (markerClass === 'circle') {
				svg += `    <circle class="marker" cx="${legendX}" cy="${legendY}" r="6" stroke="${color}"/>\n`
			} else if (markerClass === 'rect') {
				svg += `    <rect class="marker" x="${legendX - 6}" y="${legendY - 6}" width="12" height="12" stroke="${color}"/>\n`
			} else if (markerClass === 'triangle') {
				const x1 = legendX, y1 = legendY - 7
				const x2 = legendX - 6, y2 = legendY + 5
				const x3 = legendX + 6, y3 = legendY + 5
				svg += `    <polygon class="marker" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" stroke="${color}"/>\n`
			}
			svg += `    <text class="label" x="${legendX + 15}" y="${legendY + 4}" font-size="13">${fw}</text>\n`

			legendX += itemWidth
		})
		
		legendX = 0
		legendY += lineHeight
	})
	svg += `  </g>\n</svg>`

	writeFileSync(`${outputDir}/chart-absolute.svg`, svg)
}

const generateMultiREADME = (
	results: MultiResults,
	benchmarks: MultiBenchmarkResult[],
	endpointNames: string[],
	outputDir: string
) => {
	// Endpoint numbers using circled numbers
	const numberSymbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

	let md = `## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints.

### Endpoints

| # | Method | Path | Validation |
|---|--------|------|------------|
`

	// Add endpoint definition table
	endpointNames.forEach((name, i) => {
		const parts = name.split(' ')
		const method = parts[0]
		const path = parts[1] || name
		// Extract validation info from endpoint name or infer from path
		let validation = ''
		if (path.includes('/:id') && path.includes('users')) {
			validation = 'UUID param'
			if (method !== 'GET' && method !== 'DELETE') validation += ' + body'
		} else if (path.includes('/:id') && path.includes('posts')) {
			validation = 'Numeric ID param'
			if (method === 'PUT') validation += ' + body'
		} else if (path.includes('?')) {
			validation = 'Query params'
		} else if (method === 'POST') {
			validation = 'Body'
		}
		md += `| ${numberSymbols[i]} | ${method.padEnd(6)} | ${path.padEnd(25)} | ${validation} |\n`
	})

	md += `

### Results (req/s)

| Runtime | Framework |`

	// Add numbered column headers
	endpointNames.forEach((name, i) => {
		md += ` ${numberSymbols[i].padEnd(5)} |`
	})
	md += ` Avg |`

	md += `\n|---------|-----------|`
	endpointNames.forEach(() => md += `------:|`)
	md += `-----:|\n`

	// Add data rows
	benchmarks.forEach(b => {
		md += `| ${b.runtime.padEnd(7)} | ${b.displayName.padEnd(9)} |`
		
		endpointNames.forEach(name => {
			const val = b.endpoints[name]?.median
			if (val) {
				md += ` ${val.toFixed(0).padStart(11).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} |`
			} else {
				md += ` ${'-'.padStart(11)} |`
			}
		})
		
		md += ` ${b.average.toFixed(0).padStart(9).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} |\n`
	})

	md += `

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | ${results.meta.timestamp} |
| Tool | ${results.meta.benchmark.tool} |
| Settings | ${results.meta.benchmark.duration}s duration, ${results.meta.benchmark.connections} connections, ${results.meta.benchmark.runs} runs |`

	if (results.meta.environment) {
		const env = results.meta.environment

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

