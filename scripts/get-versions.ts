import { readFileSync } from 'fs'

// Map framework names to their package names
const packageMap: Record<string, string> = {
	// Bun frameworks
	'bun/bun': 'bun',
	'bun/bun-web-standard': 'bun',
	'bun/elysia': 'elysia',
	'bun/express': 'express',
	'bun/hono': 'hono',
	'bun/kori': '@korix/kori',
	'bun/nbit': '@nbit/bun',
	'bun/wobe': 'wobe',

	// Deno frameworks
	'deno/deno': 'deno',
	'deno/deno-web-standard': 'deno',
	'deno/hono': 'hono',
	'deno/kori': '@korix/kori',
	'deno/oak': '@oak/oak',

	// Node frameworks
	'node/node': 'node',
	'node/node-web-standard': 'node',
	'node/express': 'express',
	'node/fastify': 'fastify',
	'node/h3': 'h3',
	'node/hono': 'hono',
	'node/koa': 'koa',
	'node/uws': 'uWebSockets.js'
}

let packageJson: any = null
let denoJson: any = null

function getPackageJson() {
	if (!packageJson) {
		packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
	}
	return packageJson
}

function getDenoJson() {
	if (!denoJson) {
		try {
			denoJson = JSON.parse(readFileSync('deno.json', 'utf-8'))
		} catch {
			denoJson = {}
		}
	}
	return denoJson
}

export function getVersion(framework: string): string {
	const [runtime] = framework.split('/')
	const packageName = packageMap[framework]

	if (!packageName) {
		return ''
	}

	// For runtime versions
	if (packageName === 'bun') {
		return process.env.BUN_VERSION || Bun.version || ''
	}

	if (packageName === 'deno') {
		return process.env.DENO_VERSION || ''
	}

	if (packageName === 'node') {
		return process.env.NODE_VERSION || process.version.replace(/^v/, '') || ''
	}

	// For npm packages
	const pkg = getPackageJson()
	const allDeps = {
		...pkg.dependencies,
		...pkg.devDependencies
	}

	if (allDeps[packageName]) {
		return allDeps[packageName].replace(/^[\^~]/, '')
	}

	// For deno imports (JSR format: jsr:@oak/oak@^16.1.0)
	if (runtime === 'deno') {
		const deno = getDenoJson()
		if (deno.imports) {
			// Try direct package name match
			let importPath = deno.imports[packageName]

			// If not found, try with jsr: prefix
			if (!importPath) {
				const jsrKey = Object.keys(deno.imports).find(key =>
					key === packageName || key.endsWith(`/${packageName}`)
				)
				if (jsrKey) {
					importPath = deno.imports[jsrKey]
				}
			}

			if (importPath) {
				// Extract version from JSR or npm imports (e.g., jsr:@oak/oak@^16.1.0)
				const versionMatch = importPath.match(/@([\^~]?)([0-9.]+)/)
				if (versionMatch) {
					return versionMatch[2]
				}
			}
		}
	}

	return ''
}

export function formatFrameworkWithVersion(framework: string): string {
	const version = getVersion(framework)
	const name = framework.split('/')[1] || framework

	if (version) {
		return `${name}@${version}`
	}

	return name
}
