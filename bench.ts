import {
	readdirSync,
	mkdirSync,
	existsSync,
	lstatSync,
	readFileSync,
	writeFileSync
} from 'fs'
import killPort from 'kill-port'
import { $, pathToFileURL } from 'bun'
import { formatFrameworkWithVersion } from './scripts/get-versions'

// Get target framework from CLI args: bun bench.ts framework1 framework2
// Or from environment variable: FRAMEWORKS=framework1,framework2
const cliFrameworks = Bun.argv.slice(2).filter((arg) => !arg.startsWith('-'))
const envFrameworks = process.env.FRAMEWORKS?.split(',').filter(Boolean) || []
const targetFrameworks =
	cliFrameworks.length > 0 ? cliFrameworks : envFrameworks

console.error('>>>>>> BENCH.TS STARTING <<<<<<')
console.error('CLI args:', Bun.argv)
console.error('CLI frameworks:', cliFrameworks)
console.error('ENV frameworks:', envFrameworks)
console.error('Target frameworks:', targetFrameworks)
console.log('>>>>>> BENCH.TS STARTING <<<<<<')
console.log('CLI args:', Bun.argv)
console.log('CLI frameworks:', cliFrameworks)
console.log('ENV frameworks:', envFrameworks)
console.log('Target frameworks:', targetFrameworks)

const whitelists = targetFrameworks.length > 0 ? targetFrameworks : []

// ? Not working
const blacklists = [] as const

const time = 10

const commands = [
	`bombardier --fasthttp -c 100 -d ${time}s http://127.0.0.1:3000/`,
	`bombardier --fasthttp -c 100 -d ${time}s http://127.0.0.1:3000/id/1?name=bun`,
	`bombardier --fasthttp -c 100 -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body.json http://127.0.0.1:3000/json`
] as const

const runtimeCommand = {
	node: 'node',
	deno: 'deno run --allow-net --allow-env',
	bun: 'bun'
} as const

const catchNumber = /Reqs\/sec\s+(\d+[.|,]\d+)/m
const format = (value: string | number) =>
	Intl.NumberFormat('en-US').format(+value)
const sleep = (s = 1) => new Promise((resolve) => setTimeout(resolve, s * 1000))

const secToMin = (seconds: number) =>
	Math.floor(seconds / 60) +
	':' +
	(seconds % 60 < 10 ? '0' : '') +
	(seconds % 60)

// Fetch with retry and timeout
const retryFetch = (
	url: string,
	options?: RequestInit,
	time = 0,
	resolveEnd?: Function,
	rejectEnd?: Function
) => {
	return new Promise<Response>((resolve, reject) => {
		const controller = new AbortController()
		const timeout = setTimeout(() => {
			console.log(`   ⏱ Request timeout after 5s (attempt ${time})`)
			controller.abort()
		}, 5000) // 5 second timeout per request

		fetch(url, { ...options, signal: controller.signal })
			.then((a) => {
				try {
					clearTimeout(timeout)
					if (time > 0) {
						process.stdout.write(`   ✓ Connected after ${time} retries\n`)
						process.stderr.write(`   ✓ Connected after ${time} retries\n`)
					}

					// Use resolveEnd if provided (recursive call), otherwise use resolve (first call)
					const resolveFunc = resolveEnd || resolve
					process.stdout.write(`   [retryFetch] About to resolve (time=${time}, hasResolveEnd=${!!resolveEnd})\n`)
					resolveFunc(a)
					process.stdout.write(`   [retryFetch] Promise resolved (time=${time})\n`)
					process.stderr.write(`   [retryFetch] Promise resolved (time=${time})\n`)
				} catch (err) {
					console.error(`   [retryFetch] Error in .then(): ${err}`)
					console.error(`   [retryFetch] Stack:`, err.stack)
					reject(err)
				}
			})
			.catch((e) => {
				try {
					clearTimeout(timeout)
					if (time > 20) {
						console.log(`   ✗ Failed to connect after ${time} retries: ${e.message}`)
						const rejectFunc = rejectEnd || reject
						rejectFunc(e)
						return
					}
					if (time % 5 === 0) console.log(`   ... retrying (${time}/20)`)
					setTimeout(
						() => retryFetch(url, options, time + 1, resolve, reject),
						300
					)
				} catch (err) {
					console.error(`   [retryFetch] Error in .catch(): ${err}`)
					reject(err)
				}
			})
	})
}

const test = async () => {
	process.stdout.write('   [test] Starting test function...\n')
	process.stderr.write('   [test] Starting test function...\n')
	try {
		process.stdout.write('   [test] Testing GET /\n')
		process.stderr.write('   [test] Testing GET /\n')

		const index = await retryFetch('http://127.0.0.1:3000/')

		process.stdout.write('   [test] GET / completed, reading response...\n')
		process.stderr.write('   [test] GET / completed, reading response...\n')

		const indexText = await index.text()
		process.stdout.write(`   [test] Response text: "${indexText}"\n`)
		console.log(`   Response: "${indexText}"`)
		if (indexText !== 'Hi')
			throw new Error(`Index: Result not match (expected "Hi", got "${indexText}")`)

		if (!index.headers.get('Content-Type')?.includes('text/plain'))
			throw new Error('Index: Content-Type not match')

		console.log('   Testing GET /id/1?name=bun')
		const query = await retryFetch('http://127.0.0.1:3000/id/1?name=bun')

		const queryText = await query.text()
		console.log(`   Response: "${queryText}"`)
		if (queryText !== '1 bun')
			throw new Error(`Query: Result not match (expected "1 bun", got "${queryText}")`)

		if (!query.headers.get('Content-Type')?.includes('text/plain'))
			throw new Error('Query: Content-Type not match')

		if (!query.headers.get('X-Powered-By')?.includes('benchmark'))
			throw new Error('Query: X-Powered-By not match')

		console.log('   Testing POST /json')
		const body = await retryFetch('http://127.0.0.1:3000/json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				hello: 'world'
			})
		})

		const bodyText = await body.text()
		console.log(`   Response: "${bodyText}"`)
		const expectedBody = JSON.stringify({ hello: 'world' })
		if (bodyText !== expectedBody)
			throw new Error(`Body: Result not match (expected "${expectedBody}", got "${bodyText}")`)

		if (!body.headers.get('Content-Type')?.includes('application/json'))
			throw new Error('Body: Content-Type not match')

		console.log('   All tests passed!')
		process.stderr.write('   [test] All tests passed!\n')
	} catch (error) {
		console.error('   [test] Error in test():', error)
		console.error('   [test] Stack:', (error as Error)?.stack)
		throw error
	}
}

const spawn = async (target: string, title = true) => {
	let [runtime, framework, index] = target.split('/') as [
		keyof typeof runtimeCommand,
		string,
		string
	]
	if (index) framework += '/index'

	const name = framework.replace('/index', '')

	if (title) {
		console.log('\n', name)
		console.log(' >', runtime, framework, '\n')
	}

	const file = existsSync(`./src/${runtime}/${framework}.ts`)
		? `src/${runtime}/${framework}.ts`
		: `src/${runtime}/${framework}.js`

	console.log(`[spawn] Starting ${runtime} server with file: ${file}`)
	const cmd = [...runtimeCommand[runtime].split(' '), file]
	console.log(`[spawn] Command: ${cmd.join(' ')}`)

	const server = Bun.spawn({
		cmd,
		env: {
			...Bun.env,
			NODE_ENV: 'production'
		},
		stdout: 'pipe',
		stderr: 'pipe'
	})

	console.log(`[spawn] Server spawned with PID: ${server.pid}`)

	// Monitor server output for "Listening" message
	let resolved = false
	const serverReady = new Promise<void>((resolve) => {
		const decoder = new TextDecoder()

		// Timeout fallback
		const timeoutId = setTimeout(() => {
			if (!resolved) {
				console.log('[spawn] Timeout waiting for server ready signal, proceeding anyway...')
				resolved = true
				resolve()
			}
		}, 30000) // 30 second timeout

		const checkOutput = (chunk: Uint8Array) => {
			const text = decoder.decode(chunk)
			process.stdout.write(text) // Still show output

			if (!resolved && (text.includes('Listening on') || text.includes('listening on') || text.includes('Server running'))) {
				console.log('[spawn] Server ready signal detected!')
				resolved = true
				clearTimeout(timeoutId)
				resolve()
			}
		}

		// Read from stdout (continue even after resolve)
		;(async () => {
			try {
				for await (const chunk of server.stdout) {
					checkOutput(chunk)
				}
			} catch (err) {
				console.error('[spawn] Error reading stdout:', err)
			}
		})()

		// Read from stderr (continue even after resolve)
		;(async () => {
			try {
				for await (const chunk of server.stderr) {
					process.stderr.write(decoder.decode(chunk)) // Show stderr
				}
			} catch (err) {
				console.error('[spawn] Error reading stderr:', err)
			}
		})()
	})

	// Wait for server to be ready
	await serverReady
	console.log(`[spawn] Server is ready to accept connections`)

	return async () => {
		console.log(`[spawn] Killing server PID: ${server.pid}`)
		await server.kill()
		console.log(`[spawn] Server killed, waiting...`)
		await sleep(0.3)

		try {
			await fetch('http://127.0.0.1:3000')
			await sleep(0.6)
			await fetch('http://127.0.0.1:3000')

			await killPort(3000)
		} catch {
			// Empty
		}
	}
}

await Bun.$`rm -rf ./results`
mkdirSync('results')
writeFileSync('results/results.md', '')
const resultFile = Bun.file('results/results.md')
const result = resultFile.writer()

const main = async () => {
	const header = '='.repeat(60)
	console.log(header)
	console.error(header)
	console.log('BENCHMARK STARTING')
	console.error('BENCHMARK STARTING')
	console.log(header)
	console.error(header)

	try {
		await fetch('http://127.0.0.1:3000')
		await killPort(3000)
	} catch {
		// Empty
	}

	const runtimes = <string[]>[]

	let frameworks = readdirSync('src')
		.flatMap((runtime) => {
			if (!lstatSync(`src/${runtime}`).isDirectory()) return

			if (!existsSync(`results/${runtime}`))
				mkdirSync(`results/${runtime}`)

			return readdirSync(`src/${runtime}`)
				.filter(
					(a) =>
						a.endsWith('.ts') ||
						a.endsWith('.js') ||
						!a.includes('.')
				)
				.map((a) =>
					a.includes('.')
						? `${runtime}/` + a.replace(/.(j|t)s$/, '')
						: `${runtime}/${a}/index`
				)
				.filter(
					(a) =>
						!blacklists.includes(a as (typeof blacklists)[number])
				)
		})
		.filter((x) => x)
		.sort()

	// Overwrite test here
	frameworks = whitelists?.length ? whitelists : frameworks

	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	console.log('\nTest:')
	for (const target of frameworks) {
		console.log(`[main] Starting ${target}...`)
		const kill = await spawn(target!, false)
		console.log('[main] spawn() completed, server is ready!')

		let [runtime, framework] = target!.split('/')

		if (runtimes.includes(runtime)) {
			const folder = `results/${runtime}`

			if (!lstatSync(folder).isDirectory()) await Bun.$`rm -rf ${folder}`
		}

		try {
			console.log(`[main] Testing ${framework} (${runtime})...`)
			console.log('[main] About to call test()...')
			await test()
			console.log('[main] test() completed')

			console.log(`✅ ${framework} (${runtime})`)
		} catch (error) {
			console.log(`❌ ${framework} (${runtime})`)
			console.log('  ', (error as Error)?.message || error)
			console.log('Stack:', (error as Error)?.stack)

			frameworks.splice(frameworks.indexOf(target!), 1)
		} finally {
			console.log(`Killing server for ${framework}...`)
			await kill()
		}
	}

	const estimateTime = frameworks.length * (commands.length * time + 1)

	console.log()
	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	console.log(`\nEstimate time: ${secToMin(estimateTime)} min`)

	// process.exit()

	result.write(
		`
|  Framework       | Runtime | Average | Ping       | Query      | Body       |
| ---------------- | ------- | ------- | ---------- | ---------- | ---------- |
`
	)

	for (const target of frameworks) {
		const kill = await spawn(target!)

		let [runtime, framework, index] = target!.split('/') as [
			keyof typeof runtimeCommand,
			string,
			string
		]

		const name = framework.replace('/index', '')
		const displayName = formatFrameworkWithVersion(target!)

		const frameworkResultFile = Bun.file(`results/${runtime}/${name}.txt`)
		const frameworkResult = frameworkResultFile.writer()

		result.write(`| ${displayName} | ${runtime} `)

		let content = ''
		const total = []

		for (const command of commands) {
			frameworkResult.write(`${command}\n`)

			console.log(command)

			const res = await Bun.spawn({
				cmd: command.split(' '),
				env: Bun.env
			})

			const stdout = await new Response(res.stdout).text()
			console.log(stdout)

			const results = catchNumber.exec(stdout)
			if (!results?.[1]) continue

			content += `| ${format(results[1])} `
			total.push(toNumber(results[1]))

			frameworkResult.write(results + '\n')
		}

		content =
			`| ${format(
				total.reduce((a, b) => +a + +b, 0) / commands.length
			)} ` +
			content +
			'|\n'

		result.write(content)
		await result.flush()

		await kill()
	}

	// Ensure results are written to disk
	await result.flush()
	console.log('\nBenchmark complete!')
}

const toNumber = (a: string) => +a.replaceAll(',', '')

const arrange = () => {
	console.log('\nArranging results...')

	try {
		const table = readFileSync('results/results.md', {
			encoding: 'utf-8'
		})

		console.log(`Read results.md (${table.length} bytes)`)

		const orders = []

		const [title, divider, ...rows] = table.split('\n')
		console.log(`Found ${rows.length} result rows`)

		for (const row of rows) {
			const data = row
				.replace(/\ /g, '')
				.split('|')
				.filter((a) => a)

			if (data.length !== commands.length + 3) continue

			const [name, runtime, total] = data
			orders.push({
				name,
				runtime,
				total: toNumber(total),
				row
			})
		}

		console.log(`Parsed ${orders.length} valid results`)

		const content = [
			title,
			divider,
			...orders.sort((a, b) => b.total - a.total).map((a) => a.row)
		].join('\n')

		console.log('\nFinal results:')
		console.log(content)
		writeFileSync('results/results.md', content)
		console.log('\nResults written successfully')

		process.exit(0)
	} catch (error) {
		console.error('\nError in arrange():', error)
		console.error('Skipping arrange step - results.md should still be available')
		// Don't fail the process if arrange fails
		process.exit(0)
	}
}

process.on('beforeExit', async () => {
	await killPort(3000)
})

main()
	.then(() => {
		console.log('Main completed successfully')
		arrange()
	})
	.catch((error) => {
		console.error('\nError in main():', error)
		console.error('Stack:', error.stack)
		process.exit(1)
	})
