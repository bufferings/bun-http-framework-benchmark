import {
	readdirSync,
	mkdirSync,
	existsSync,
	lstatSync,
	writeFileSync,
	readFileSync
} from 'fs'
import { formatFrameworkWithVersion } from './scripts/get-versions'

// Get target framework from CLI args
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
const runs = getFlag('runs', 3)

if (targetFrameworks.length > 0) {
	console.log('Target frameworks:', targetFrameworks)
}
console.log(
	`Configuration: ${time}s duration, ${connections} connections, ${runs} runs (median)`
)

// Get environment variables for GCP
const targetVmName = process.env.TARGET_VM_NAME || 'bench-vm-target'
const gcpProjectId = process.env.GCP_PROJECT_ID
const gcpZone = process.env.GCP_ZONE

if (!gcpProjectId || !gcpZone) {
	console.error('Error: GCP_PROJECT_ID and GCP_ZONE must be set')
	process.exit(1)
}

const whitelists = targetFrameworks.length > 0 ? targetFrameworks : []

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

const toNumber = (a: string) => +a.replaceAll(',', '')

// Types for benchmark results
type BenchmarkResult = {
	framework: string
	runtime: string
	displayName: string
	hasValidation: boolean
	basic: {
		ping: number
		query: number
		body: number
		average: number
	}
	validation?: {
		zod: number
		valibot: number
		arktype: number
		average: number
	}
}

type Results = {
	config: {
		time: number
		connections: number
		runs: number
	}
	benchmarks: BenchmarkResult[]
}

// Get target VM internal IP
const getTargetIp = async (): Promise<string> => {
	console.log(`Getting internal IP of ${targetVmName}...`)
	const result =
		await Bun.$`gcloud compute instances describe ${targetVmName} --zone=${gcpZone} --project=${gcpProjectId} --format='get(networkInterfaces[0].networkIP)'`.text()

	const ip = result.trim()
	console.log(`Target VM IP: ${ip}`)
	return ip
}

// Start server on target VM
const startServer = async (target: string): Promise<void> => {
	const parts = target.split('/')
	let runtime = parts[0] as keyof typeof runtimeCommand
	let framework = parts.slice(1).join('/')

	const name = framework.replace('/index', '')
	console.log(`\nStarting server: ${name} (${runtime})`)

	const file = existsSync(`./src/${runtime}/${framework}.ts`)
		? `src/${runtime}/${framework}.ts`
		: existsSync(`./src/${runtime}/${framework}.mjs`)
		? `src/${runtime}/${framework}.mjs`
		: `src/${runtime}/${framework}.js`

	const cmd = `screen -dmS benchmark bash -c 'cd ~/bun-http-framework-benchmark && ${runtimeCommand[runtime]} ${file} > /dev/null 2>&1'`

	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command=${cmd}`.quiet()

	console.log('Waiting for server to start...')
	await sleep(5)
}

// Stop server on target VM
const stopServer = async (): Promise<void> => {
	console.log('Stopping server...')
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="screen -S benchmark -X quit || pkill -f '3000'"`.quiet()
	await sleep(2)
}

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
		}, 5000)

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

const test = async (targetIp: string) => {
	const index = await retryFetch(`http://${targetIp}:3000/`)
	const indexText = await index.text()

	if (indexText !== 'Hi')
		throw new Error(
			`Index: Result not match (expected "Hi", got "${indexText}")`
		)

	if (!index.headers.get('Content-Type')?.includes('text/plain'))
		throw new Error('Index: Content-Type not match')

	const query = await retryFetch(`http://${targetIp}:3000/id/1?name=bun`)
	const queryText = await query.text()

	if (queryText !== '1 bun')
		throw new Error(
			`Query: Result not match (expected "1 bun", got "${queryText}")`
		)

	if (!query.headers.get('Content-Type')?.includes('text/plain'))
		throw new Error('Query: Content-Type not match')

	if (!query.headers.get('X-Powered-By')?.includes('benchmark'))
		throw new Error('Query: X-Powered-By not match')

	const body = await retryFetch(`http://${targetIp}:3000/json`, {
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

const testValidation = async (targetIp: string) => {
	const validationBody = {
		hello: 'world',
		count: 42,
		tags: ['test', 'benchmark']
	}

	try {
		const zod = await retryFetch(`http://${targetIp}:3000/validate-zod`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(validationBody)
		})

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
		if (e instanceof TypeError && e.message.includes('fetch')) {
			return false
		}
		throw e
	}

	const valibot = await retryFetch(
		`http://${targetIp}:3000/validate-valibot`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(validationBody)
		}
	)

	const valibotText = await valibot.text()
	const expectedValibot = JSON.stringify(validationBody)

	if (valibotText !== expectedValibot)
		throw new Error(
			`Valibot: Result not match (expected "${expectedValibot}", got "${valibotText}")`
		)

	const arktype = await retryFetch(
		`http://${targetIp}:3000/validate-arktype`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(validationBody)
		}
	)

	const arktypeText = await arktype.text()
	const expectedArktype = JSON.stringify(validationBody)

	if (arktypeText !== expectedArktype)
		throw new Error(
			`ArkType: Result not match (expected "${expectedArktype}", got "${arktypeText}")`
		)

	return true
}

await Bun.$`rm -rf ./results`
mkdirSync('results')

const main = async () => {
	// Sync repository to target VM
	console.log(`Syncing repository to ${targetVmName}...`)
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="rm -rf ~/bun-http-framework-benchmark && mkdir -p ~/bun-http-framework-benchmark"`.quiet()
	await Bun.$`gcloud compute scp --recurse --internal-ip --zone=${gcpZone} --project=${gcpProjectId} ./src ./scripts ./package.json ./bun.lockb ${targetVmName}:~/bun-http-framework-benchmark/`.quiet()

	console.log('Installing dependencies on target VM...')
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="cd ~/bun-http-framework-benchmark && bun install"`.quiet()

	const targetIp = await getTargetIp()

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
						a.endsWith('.mjs') ||
						!a.includes('.')
				)
				.map((a) =>
					a.includes('.')
						? `${runtime}/` + a.replace(/\.(m?j|t)s$/, '')
						: `${runtime}/${a}/index`
				)
		})
		.filter((x) => x)
		.sort()

	frameworks = whitelists?.length ? whitelists : frameworks

	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	const validationSupport = new Map<string, boolean>()

	console.log('\nTest:')
	for (const target of frameworks) {
		await startServer(target!)
		let [runtime, framework] = target!.split('/')

		try {
			await test(targetIp)
			const hasValidation = await testValidation(targetIp)
			validationSupport.set(target!, hasValidation)
			console.log(
				`✅ ${framework} (${runtime})${
					hasValidation ? ' [+validation]' : ''
				}`
			)
		} catch (error) {
			console.log(`❌ ${framework} (${runtime})`)
			console.log('  ', (error as Error)?.message || error)
			frameworks.splice(frameworks.indexOf(target!), 1)
		} finally {
			await stopServer()
		}
	}

	const commands = (targetIp: string) =>
		[
			`bombardier --fasthttp -c ${connections} -d ${time}s http://${targetIp}:3000/`,
			`bombardier --fasthttp -c ${connections} -d ${time}s http://${targetIp}:3000/id/1?name=bun`,
			`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body.json http://${targetIp}:3000/json`,
			`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://${targetIp}:3000/validate-zod`,
			`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://${targetIp}:3000/validate-valibot`,
			`bombardier --fasthttp -c ${connections} -d ${time}s -m POST -H 'Content-Type:application/json' -f ./scripts/body-validation.json http://${targetIp}:3000/validate-arktype`
		] as const

	console.log()
	console.log(`${frameworks.length} frameworks`)
	for (const framework of frameworks) console.log(`- ${framework}`)

	const benchmarkResults: BenchmarkResult[] = []

	for (const target of frameworks) {
		await startServer(target!)

		let [runtime, framework] = target!.split('/') as [
			keyof typeof runtimeCommand,
			string
		]

		const name = framework.replace('/index', '')
		const displayName = formatFrameworkWithVersion(target!)

		const hasValidation = validationSupport.get(target!) || false

		const basicResults: number[] = []
		const validationResults: number[] = []

		for (let i = 0; i < commands(targetIp).length; i++) {
			const command = commands(targetIp)[i]

			if (i >= 3 && !hasValidation) {
				continue
			}

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

			runResults.sort((a, b) => a - b)
			const median = runResults[Math.floor(runResults.length / 2)]

			console.log(`  Median: ${median.toFixed(2)} req/s\n`)

			if (i < 3) {
				basicResults.push(median)
			} else {
				validationResults.push(median)
			}
		}

		const benchmarkResult: BenchmarkResult = {
			framework: name,
			runtime,
			displayName,
			hasValidation,
			basic: {
				ping: basicResults[0] || 0,
				query: basicResults[1] || 0,
				body: basicResults[2] || 0,
				average:
					basicResults.length > 0
						? basicResults.reduce((a, b) => a + b, 0) /
						  basicResults.length
						: 0
			}
		}

		if (hasValidation && validationResults.length > 0) {
			benchmarkResult.validation = {
				zod: validationResults[0] || 0,
				valibot: validationResults[1] || 0,
				arktype: validationResults[2] || 0,
				average:
					validationResults.reduce((a, b) => a + b, 0) /
					validationResults.length
			}
		}

		benchmarkResults.push(benchmarkResult)

		await stopServer()
	}

	const results: Results = {
		config: {
			time,
			connections,
			runs
		},
		benchmarks: benchmarkResults
	}

	writeFileSync('results/results.json', JSON.stringify(results, null, 2))
	console.log('\nResults saved to results/results.json')
}

const report = async () => {
	try {
		const resultsJson = readFileSync('results/results.json', {
			encoding: 'utf-8'
		})
		const results: Results = JSON.parse(resultsJson)

		const sortedBasic = [...results.benchmarks].sort(
			(a, b) => b.basic.average - a.basic.average
		)

		const sortedValidation = results.benchmarks
			.filter((b) => b.hasValidation && b.validation)
			.sort((a, b) => b.validation!.average - a.validation!.average)

		// Get all environment information from target-vm in one SSH call
		const platform = process.env.PLATFORM || 'GCP (2-VM)'
		let osInfo = 'Unknown'
		let cpuModel = 'Unknown'
		let cpuCores = 'Unknown'
		let totalMem = 'Unknown'
		let bunVersion = 'N/A'
		let nodeVersion = 'N/A'
		let denoVersion = 'N/A'

		try {
			const allInfo =
				await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="lsb_release -d | cut -d: -f2 | xargs; lscpu | grep 'Model name' | cut -d: -f2 | xargs; nproc; free -h | grep Mem | awk '{print \\$2}'; bun --version; node --version | sed 's/^v//'; deno --version | head -n 1 | cut -d ' ' -f 2"`.text()

			const lines = allInfo.trim().split('\n')
			if (lines[0]) osInfo = lines[0].trim()
			if (lines[1]) cpuModel = lines[1].trim()
			if (lines[2]) cpuCores = lines[2].trim()
			if (lines[3]) totalMem = lines[3].trim()
			if (lines[4]) bunVersion = lines[4].trim()
			if (lines[5]) nodeVersion = lines[5].trim()
			if (lines[6]) denoVersion = lines[6].trim()
		} catch {
			// Keep default values
		}

		let content = `
## Latest Benchmark Results

Generated on ${new Date().toISOString().split('T')[0]}

### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
`

		for (const b of sortedBasic) {
			content += `| ${b.runtime.padEnd(7)} | ${b.displayName.padEnd(
				16
			)} | ${format(b.basic.average)} | ${format(
				b.basic.ping
			)} | ${format(b.basic.query)} | ${format(b.basic.body)} |\n`
		}

		if (sortedValidation.length > 0) {
			content += `
### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
`

			for (const b of sortedValidation) {
				content += `| ${b.runtime.padEnd(7)} | ${b.displayName.padEnd(
					16
				)} | ${format(b.validation!.average)} | ${format(
					b.validation!.zod
				)} | ${format(b.validation!.valibot)} | ${format(
					b.validation!.arktype
				)} |\n`
			}
		}

		content += `
### Benchmark Environment

| Item | Value |
|---|---|
| Platform | ${platform} |
| OS | ${osInfo} |
| CPU | ${cpuModel} (${cpuCores} cores) |
| Memory | ${totalMem} |
| Runtimes | Bun ${bunVersion}, Node.js ${nodeVersion}, Deno ${denoVersion} |
| Benchmark | bombardier (${results.config.time}s, ${results.config.connections} connections) × ${results.config.runs} run(s) |
`

		console.log('\nFinal results:')
		console.log(content)
		writeFileSync('results/results.md', content)

		process.exit(0)
	} catch (error) {
		console.error('\nError in report():', error)
		process.exit(0)
	}
}

main()
	.then(report)
	.catch((error) => {
		console.error('\nError:', error)
		console.error('Stack:', error.stack)
		process.exit(1)
	})
