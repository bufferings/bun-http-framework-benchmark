import {
	readdirSync,
	mkdirSync,
	existsSync,
	lstatSync,
	readFileSync,
	writeFileSync
} from 'fs'
import killPort from 'kill-port'
import { formatFrameworkWithVersion } from './scripts/get-versions'

// Get target framework from CLI args: bun bench.ts framework1 framework2
// Or from environment variable: FRAMEWORKS=framework1,framework2
// Supports flags: --time=10 --connections=200 --runs=3
const args = Bun.argv.slice(2)
const cliFrameworks = args.filter((arg) => !arg.startsWith('-'))
const envFrameworks = process.env.FRAMEWORKS?.split(',').filter(Boolean) || []
const targetFrameworks =
	cliFrameworks.length > 0 ? cliFrameworks : envFrameworks

// Parse flags
const getFlag = (name: string, defaultValue: number): number => {
	const flag = args.find((arg) => arg.startsWith(`--${name}=`))
	if (flag) {
		const value = parseInt(flag.split('=')[1])
		return isNaN(value) ? defaultValue : value
	}
	return defaultValue
}

const time = getFlag('time', 10)
const connections = getFlag('connections', 64)
const runs = getFlag('runs', 3) // Number of runs per benchmark to take median

if (targetFrameworks.length > 0) {
	console.log('Target frameworks:', targetFrameworks)
}
console.log(
	`Configuration: ${time}s duration, ${connections} connections, ${runs} runs (median)`
)

const whitelists = targetFrameworks.length > 0 ? targetFrameworks : []

const commands = [
	`bombardier --fasthttp -c ${connections} -d ${time}s http://127.0.0.1:3000/`,
	`bombardier --fasthttp -c ${connections} -d ${time}s http://127.0.0.1:3000/id/1?name=bun`,
	`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body.json http://127.0.0.1:3000/json`,
	`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://127.0.0.1:3000/validate-zod`,
	`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://127.0.0.1:3000/validate-valibot`,
	`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://127.0.0.1:3000/validate-arktype`
] as const

const runtimeCommand = {
	node: 'node',
	deno: 'deno run --allow-net --allow-env',
	bun: 'bun'
} as const

const catchNumber = /Reqs\/sec\s+(\d+(?:[.|,]\d+)?)/m
const format = (value: string | number) => {
	const num = +value
	return num.toFixed(2).padStart(10)
}
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
			controller.abort()
		}, 5000) // 5 second timeout per request

		fetch(url, { ...options, signal: controller.signal })
			.then((a) => {
				clearTimeout(timeout)
				const resolveFunc = resolveEnd || resolve
				resolveFunc(a)
			})
			.catch((e) => {
				clearTimeout(timeout)
				if (time > 20) {
					const rejectFunc = rejectEnd || reject
					rejectFunc(e)
					return
				}
				setTimeout(
					() => retryFetch(url, options, time + 1, resolve, reject),
					300
				)
			})
	})
}

const test = async () => {
	const index = await retryFetch('http://127.0.0.1:3000/')
	const indexText = await index.text()

	if (indexText !== 'Hi')
		throw new Error(
			`Index: Result not match (expected "Hi", got "${indexText}")`
		)

	if (!index.headers.get('Content-Type')?.includes('text/plain'))
		throw new Error('Index: Content-Type not match')

	const query = await retryFetch('http://127.0.0.1:3000/id/1?name=bun')
	const queryText = await query.text()

	if (queryText !== '1 bun')
		throw new Error(
			`Query: Result not match (expected "1 bun", got "${queryText}")`
		)

	if (!query.headers.get('Content-Type')?.includes('text/plain'))
		throw new Error('Query: Content-Type not match')

	if (!query.headers.get('X-Powered-By')?.includes('benchmark'))
		throw new Error('Query: X-Powered-By not match')

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
	const expectedBody = JSON.stringify({ hello: 'world' })

	if (bodyText !== expectedBody)
		throw new Error(
			`Body: Result not match (expected "${expectedBody}", got "${bodyText}")`
		)

	if (!body.headers.get('Content-Type')?.includes('application/json'))
		throw new Error('Body: Content-Type not match')
}

const testValidation = async () => {
	const validationBody = {
		hello: 'world',
		count: 42,
		tags: ['test', 'benchmark']
	}

	// Test Zod validation
	try {
		const zod = await retryFetch('http://127.0.0.1:3000/validate-zod', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(validationBody)
		})

		// If 404, validation not supported
		if (zod.status === 404) {
			return false
		}

		const zodText = await zod.text()
		const expectedZod = JSON.stringify(validationBody)

		if (zodText !== expectedZod)
			throw new Error(
				`Zod: Result not match (expected "${expectedZod}", got "${zodText}")`
			)

		if (!zod.headers.get('Content-Type')?.includes('application/json'))
			throw new Error('Zod: Content-Type not match')
	} catch (e) {
		// Validation endpoint might not exist for non-kori frameworks
		if (e instanceof TypeError && e.message.includes('fetch')) {
			return false // Validation not supported
		}
		throw e
	}

	// Test Valibot validation
	const valibot = await retryFetch('http://127.0.0.1:3000/validate-valibot', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(validationBody)
	})

	const valibotText = await valibot.text()
	const expectedValibot = JSON.stringify(validationBody)

	if (valibotText !== expectedValibot)
		throw new Error(
			`Valibot: Result not match (expected "${expectedValibot}", got "${valibotText}")`
		)

	// Test ArkType validation
	const arktype = await retryFetch('http://127.0.0.1:3000/validate-arktype', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(validationBody)
	})

	const arktypeText = await arktype.text()
	const expectedArktype = JSON.stringify(validationBody)

	if (arktypeText !== expectedArktype)
		throw new Error(
			`ArkType: Result not match (expected "${expectedArktype}", got "${arktypeText}")`
		)

	return true // Validation supported
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

	const cmd = [...runtimeCommand[runtime].split(' '), file]

	const server = Bun.spawn({
		cmd,
		env: {
			...Bun.env,
			NODE_ENV: 'production'
		},
		stdout: 'pipe',
		stderr: 'pipe'
	})

	// Continue reading stdout/stderr in background to prevent buffer blocking
	;(async () => {
		for await (const _chunk of server.stdout) {
			// Optionally log: process.stdout.write(new TextDecoder().decode(chunk))
		}
	})()
	;(async () => {
		for await (const chunk of server.stderr) {
			process.stderr.write(new TextDecoder().decode(chunk))
		}
	})()

	// Wait for server to be ready by polling with fetch
	const maxRetries = 30
	let retries = 0
	while (retries < maxRetries) {
		try {
			await fetch('http://127.0.0.1:3000/')
			break
		} catch {
			retries++
			if (retries >= maxRetries) {
				throw new Error('Server failed to start after 30 attempts')
			}
			await sleep(0.1)
		}
	}

	return async () => {
		await server.kill()
		await sleep(0.5)

		try {
			await killPort(3000)
		} catch {
			// Already closed
		}
	}
}

await Bun.$`rm -rf ./results`
mkdirSync('results')
writeFileSync('results/results.md', '')
const resultFile = Bun.file('results/results.md')
const result = resultFile.writer()

const main = async () => {
	try {
		await fetch('http://127.0.0.1:3000')
		await killPort(3000)
	} catch {
		// Empty
	}

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
		})
		.filter((x) => x)
		.sort()

	// Overwrite test here
	frameworks = whitelists?.length ? whitelists : frameworks

	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	// Track which frameworks support validation
	const validationSupport = new Map<string, boolean>()

	console.log('\nTest:')
	for (const target of frameworks) {
		const kill = await spawn(target!, false)
		let [runtime, framework] = target!.split('/')

		try {
			await test()
			const hasValidation = await testValidation()
			validationSupport.set(target!, hasValidation)
			console.log(
				`✅ ${framework} (${runtime})${hasValidation ? ' [+validation]' : ''}`
			)
		} catch (error) {
			console.log(`❌ ${framework} (${runtime})`)
			console.log('  ', (error as Error)?.message || error)
			frameworks.splice(frameworks.indexOf(target!), 1)
		} finally {
			await kill()
		}
	}

	const estimateTime = frameworks.length * (commands.length * time * runs + 1)

	console.log()
	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	console.log(`\nEstimate time: ${secToMin(estimateTime)} min`)

	result.write(
		`
| Runtime | Framework        |    Average |       Ping |      Query |       Body |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: | ---------: | ---------: | ---------: |
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

		result.write(`| ${runtime.padEnd(7)} | ${displayName.padEnd(16)} `)

		let content = ''
		const total = []
		const hasValidation = validationSupport.get(target!) || false

		for (let i = 0; i < commands.length; i++) {
			const command = commands[i]

			// Skip validation commands if framework doesn't support them
			if (i >= 3 && !hasValidation) {
				frameworkResult.write(`${command}\n`)
				frameworkResult.write(`N/A\n`)
				content += `|        N/A `
				continue
			}

			frameworkResult.write(`${command}\n`)

			const runResults: number[] = []

			for (let run = 0; run < runs; run++) {
				console.log(`[${run + 1}/${runs}] ${command}`)

				const res = Bun.spawn({
					cmd: command.split(' '),
					env: Bun.env
				})

				const stdout = await new Response(res.stdout).text()
				await res.exited

				const results = catchNumber.exec(stdout)
				if (results?.[1]) {
					const value = toNumber(results[1])
					runResults.push(value)
					console.log(`  Result: ${results[1]} req/s`)
				}
			}

			if (runResults.length === 0) continue

			// Sort and take median
			runResults.sort((a, b) => a - b)
			const median = runResults[Math.floor(runResults.length / 2)]

			console.log(`  Median: ${median.toFixed(2)} req/s\n`)

			content += `| ${format(median)} `
			// Only include first 3 results (Ping, Query, Body) in average
			if (i < 3) {
				total.push(median)
			}

			frameworkResult.write(`${median}\n`)
		}

		content =
			`| ${format(total.reduce((a, b) => +a + +b, 0) / total.length)} ` +
			content +
			'|\n'

		result.write(content)

		await kill()
	}

	await result.flush()
}

const toNumber = (a: string) => +a.replaceAll(',', '')

const arrange = () => {
	try {
		const table = readFileSync('results/results.md', {
			encoding: 'utf-8'
		})

		const orders = []
		const [title, divider, ...rows] = table.split('\n')

		for (const row of rows) {
			const data = row
				.replace(/ /g, '')
				.split('|')
				.filter((a) => a)

			if (data.length !== commands.length + 3) continue

			const [runtime, name, total] = data
			orders.push({
				runtime,
				name,
				total: toNumber(total),
				row
			})
		}

		const content = [
			title,
			divider,
			...orders.sort((a, b) => b.total - a.total).map((a) => a.row)
		].join('\n')

		console.log('\nFinal results:')
		console.log(content)
		writeFileSync('results/results.md', content)

		process.exit(0)
	} catch (error) {
		console.error('\nError in arrange():', error)
		process.exit(0)
	}
}

process.on('beforeExit', async () => {
	await killPort(3000)
})

main()
	.then(arrange)
	.catch((error) => {
		console.error('\nError in main():', error)
		console.error('Stack:', error.stack)
		process.exit(1)
	})
