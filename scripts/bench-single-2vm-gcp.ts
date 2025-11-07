import {
	readdirSync,
	mkdirSync,
	existsSync,
	lstatSync,
	writeFileSync
} from 'fs'
import { formatFrameworkWithVersion } from './tools/get-versions'

// Get target endpoints from CLI args
const args = Bun.argv.slice(2)
const cliEndpoints = args.filter((arg) => !arg.startsWith('-'))
const envEndpoints = process.env.ENDPOINTS?.split(',').filter(Boolean) || []
const targetEndpoints =
	cliEndpoints.length > 0 ? cliEndpoints : envEndpoints

// Parse flags
const getFlag = (name: string, defaultValue: number): number => {
	const flag = args.find((arg) => arg.startsWith(`--${name}=`))
	if (flag) {
		const value = parseInt(flag.split('=')[1])
		return isNaN(value) ? defaultValue : value
	}
	return defaultValue
}

const time = getFlag('time', 30)
const connections = getFlag('connections', 128)
const runs = getFlag('runs', 3)

if (targetEndpoints.length > 0) {
	console.log('Target endpoints:', targetEndpoints)
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

const runtimeCommand = {
	node: 'node',
	deno: 'deno run --allow-net --allow-env',
	bun: 'bun run'
} as const

const catchNumber = /Requests\/sec:\s+(\d+(?:[.|,]\d+)?)/m
const sleep = (s = 1) => new Promise((resolve) => setTimeout(resolve, s * 1000))

// Get target VM's internal IP
const getTargetIp = async () => {
	const output = await Bun.$`gcloud compute instances describe ${targetVmName} --zone=${gcpZone} --project=${gcpProjectId} --format='get(networkInterfaces[0].networkIP)'`.text()
	return output.trim()
}

// Get OS info from VM
const getVmOsInfo = async (vmName: string) => {
	try {
		const output = await Bun.$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"'"`.text()
		return output.trim() || 'Ubuntu'
	} catch {
		return 'Ubuntu'
	}
}

// Get CPU info from VM
const getVmCpuInfo = async (vmName: string) => {
	try {
		const output = await Bun.$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="lscpu | grep 'Model name' | cut -d: -f2 | xargs"`.text()
		const cpuModel = output.trim()
		const coresOutput = await Bun.$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="nproc"`.text()
		const cores = coresOutput.trim()
		return cpuModel ? `${cpuModel} (${cores} cores)` : 'Unknown'
	} catch {
		return 'Unknown'
	}
}

// Get memory info from VM
const getVmMemoryInfo = async (vmName: string) => {
	try {
		const output = await Bun.$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="free -g | grep Mem | awk '{print \$2}'"`.text()
		const memoryGB = output.trim()
		return memoryGB ? `${memoryGB}GB` : 'Unknown'
	} catch {
		return 'Unknown'
	}
}

// Get runtime versions from target VM
const getTargetRuntimeVersions = async () => {
	const runtimes: Record<string, string> = {}

	try {
		const bunVersion = await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="bun --version"`.text()
		if (bunVersion.trim()) runtimes.bun = bunVersion.trim()
	} catch {}

	try {
		const nodeVersion = await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="node --version"`.text()
		if (nodeVersion.trim()) runtimes.node = nodeVersion.trim().replace('v', '')
	} catch {}

	try {
		const denoOutput = await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="deno --version"`.text()
		const denoVersion = denoOutput.match(/deno (\S+)/)?.[1]
		if (denoVersion) runtimes.deno = denoVersion
	} catch {}

	return runtimes
}

// Test endpoint via HTTP
const testEndpoint = async (targetIp: string, endpointType: string) => {
	if (endpointType === 'ping') {
		const response = await fetch(`http://${targetIp}:3000/`)
		const text = await response.text()
		if (text !== 'Hi')
			throw new Error(`Result not match (expected "Hi", got "${text}")`)
		if (!response.headers.get('Content-Type')?.includes('text/plain'))
			throw new Error('Content-Type not match')
	} else if (endpointType === 'query') {
		const response = await fetch(`http://${targetIp}:3000/1?name=bun`)
		const text = await response.text()
		if (text !== '1 bun')
			throw new Error(`Result not match (expected "1 bun", got "${text}")`)
		if (!response.headers.get('Content-Type')?.includes('text/plain'))
			throw new Error('Content-Type not match')
		if (!response.headers.get('X-Powered-By')?.includes('benchmark'))
			throw new Error('X-Powered-By not match')
	} else if (endpointType === 'body') {
		const response = await fetch(`http://${targetIp}:3000/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ hello: 'world' })
		})
		const text = await response.text()
		const expected = JSON.stringify({ hello: 'world' })
		if (text !== expected)
			throw new Error(`Result not match (expected "${expected}", got "${text}")`)
		if (!response.headers.get('Content-Type')?.includes('application/json'))
			throw new Error('Content-Type not match')
	} else if (endpointType.startsWith('validate-')) {
		const validationBody = {
			hello: 'world',
			count: 42,
			tags: ['test', 'benchmark']
		}
		const response = await fetch(`http://${targetIp}:3000/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(validationBody)
		})
		if (response.status === 404) {
			throw new Error('Validation endpoint not supported')
		}
		const text = await response.text()
		const expected = JSON.stringify(validationBody)
		if (text !== expected)
			throw new Error(`Result not match (expected "${expected}", got "${text}")`)
		if (!response.headers.get('Content-Type')?.includes('application/json'))
			throw new Error('Content-Type not match')
	}
}

// Start server on target VM
const startServer = async (target: string) => {
	let [runtime, framework, endpoint] = target.split('/') as [
		keyof typeof runtimeCommand,
		string,
		string
	]

	let file = `src/single/${runtime}/${framework}/${endpoint}.ts`
	if (!existsSync(file)) {
		file = `src/single/${runtime}/${framework}/${endpoint}.mjs`
		if (!existsSync(file)) {
			file = `src/single/${runtime}/${framework}/${endpoint}.js`
			if (!existsSync(file)) {
				throw new Error(`File not found: ${file}`)
			}
		}
	}

	const cmd = `screen -dmS benchmark bash -c 'cd ~/bun-http-framework-benchmark && ${runtimeCommand[runtime]} ${file} > /dev/null 2>&1'`

	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command=${cmd}`.quiet()

	// Wait for server to be ready
	await sleep(3)
}

// Stop server on target VM
const stopServer = async () => {
	try {
		await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="screen -S benchmark -X quit"`.quiet()
	} catch {
		// Ignore if no session exists
	}
	try {
		await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="pkill -f 'bun run\\|node\\|deno'"`.quiet()
	} catch {
		// Ignore if no processes found
	}
	await sleep(1)
}

// Get warmup command
const getWarmupCommand = (targetIp: string, endpointType: string) => {
	const warmupTime = 5
	const warmupConnections = connections
	if (endpointType === 'ping') {
		return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s http://${targetIp}:3000/`
	} else if (endpointType === 'query') {
		return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s http://${targetIp}:3000/1?name=bun`
	} else if (endpointType === 'body') {
		return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s -m POST -H Content-Type:application/json -D ./scripts/data/body.json http://${targetIp}:3000/`
	} else if (endpointType.startsWith('validate-')) {
		return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s -m POST -H Content-Type:application/json -D ./scripts/data/body-validation.json http://${targetIp}:3000/`
	}
	throw new Error(`Unknown endpoint type: ${endpointType}`)
}

// Get benchmark command
const getCommand = (targetIp: string, endpointType: string) => {
	if (endpointType === 'ping') {
		return `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/`
	} else if (endpointType === 'query') {
		return `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/1?name=bun`
	} else if (endpointType === 'body') {
		return `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/body.json http://${targetIp}:3000/`
	} else if (endpointType.startsWith('validate-')) {
		return `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/body-validation.json http://${targetIp}:3000/`
	}
	throw new Error(`Unknown endpoint type: ${endpointType}`)
}

const toNumber = (a: string) => +a.replaceAll(',', '')

if (!existsSync('results')) mkdirSync('results')

const main = async () => {
	// Sync repository to target VM
	console.log(`Syncing repository to ${targetVmName}...`)
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="rm -rf ~/bun-http-framework-benchmark && mkdir -p ~/bun-http-framework-benchmark"`.quiet()
	await Bun.$`gcloud compute scp --recurse --internal-ip --zone=${gcpZone} --project=${gcpProjectId} ./src ./package.json ./bun.lockb ${targetVmName}:~/bun-http-framework-benchmark/`.quiet()

	console.log('Installing dependencies on target VM...')
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="cd ~/bun-http-framework-benchmark && bun install"`.quiet()

	console.log('Setting ulimit on target VM...')
	await Bun.$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="ulimit -n 65535"`.quiet()

	// Get target IP
	const targetIp = await getTargetIp()
	console.log(`Target VM IP: ${targetIp}`)

	// Collect environment info from both VMs
	console.log('\nCollecting environment information...')
	const loadVmName = process.env.LOAD_VM_NAME || 'bench-vm-load'

	const [
		loadOs,
		loadCpu,
		loadMemory,
		targetOs,
		targetCpu,
		targetMemory,
		targetRuntimes
	] = await Promise.all([
		getVmOsInfo(loadVmName),
		getVmCpuInfo(loadVmName),
		getVmMemoryInfo(loadVmName),
		getVmOsInfo(targetVmName),
		getVmCpuInfo(targetVmName),
		getVmMemoryInfo(targetVmName),
		getTargetRuntimeVersions()
	])

	console.log('Load VM:', { os: loadOs, cpu: loadCpu, memory: loadMemory })
	console.log('Target VM:', { os: targetOs, cpu: targetCpu, memory: targetMemory, runtimes: targetRuntimes })

	// Stop any existing servers
	await stopServer()

	// Discover all endpoint files
	let endpoints = readdirSync('src/single')
		.flatMap((runtime) => {
			if (!lstatSync(`src/single/${runtime}`).isDirectory()) return

			return readdirSync(`src/single/${runtime}`)
				.filter((framework) => lstatSync(`src/single/${runtime}/${framework}`).isDirectory())
				.flatMap((framework) => {
					return readdirSync(`src/single/${runtime}/${framework}`)
						.filter((file) => file.endsWith('.ts') || file.endsWith('.mjs') || file.endsWith('.js'))
						.map((file) => `${runtime}/${framework}/${file.replace(/\.(ts|mjs|js)$/, '')}`)
				})
		})
		.filter((x) => x)
		.sort()

	// Filter by target endpoints if specified
	if (targetEndpoints.length > 0) {
		endpoints = endpoints.filter((endpoint) =>
			targetEndpoints.some((target) => endpoint!.includes(target))
		)
	}

	console.log(`\n${endpoints.length} endpoints`)
	for (const endpoint of endpoints) console.log(`- ${endpoint}`)

	console.log('\nRunning benchmarks:')

	const benchmarkResults = []

	for (const target of endpoints) {
		const [runtime, framework, endpointType] = target!.split('/')
		const displayName = formatFrameworkWithVersion(framework)

		console.log(`\n${target}`)

		try {
			// Start server
			await startServer(target!)

			// Test endpoint
			try {
				await testEndpoint(targetIp, endpointType)
				console.log(`✅ Endpoint test passed`)
			} catch (error) {
				console.log(`❌ Endpoint test failed: ${(error as Error)?.message || error}`)
				await stopServer()
				continue
			}

			// Warm up
			const warmupCommand = getWarmupCommand(targetIp, endpointType)
			console.log('Warming up...')
			await Bun.spawn({
				cmd: warmupCommand.split(' '),
				env: Bun.env,
				stdout: 'ignore'
			}).exited

			// Run benchmark multiple times
			const runResults: number[] = []
			const command = getCommand(targetIp, endpointType)

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

			// Sort and take median
			runResults.sort((a, b) => a - b)
			const median = runResults[Math.floor(runResults.length / 2)]
			console.log(`  Median: ${median.toFixed(2)} req/s`)

			benchmarkResults.push({
				endpoint: endpointType,
				runtime,
				framework,
				displayName,
				results: runResults,
				median
			})

			// Stop server
			await stopServer()
		} catch (error) {
			console.log(`❌ Failed to run benchmark: ${(error as Error)?.message || error}`)
			await stopServer()
		}
	}

	// Save results with collected environment info
	const results = {
		meta: {
			timestamp: new Date().toISOString(),
			benchmark: {
				tool: 'oha',
				duration: time,
				connections,
				runs
			},
			environments: {
				load: {
					platform: 'GCP (2-VM)',
					os: loadOs,
					cpu: loadCpu,
					memory: loadMemory
				},
				target: {
					platform: 'GCP (2-VM)',
					os: targetOs,
					cpu: targetCpu,
					memory: targetMemory,
					runtimes: targetRuntimes
				}
			}
		},
		benchmarks: benchmarkResults
	}

	writeFileSync('results/single-2vm.json', JSON.stringify(results, null, 2))
	console.log('\nResults saved to results/single-2vm.json')
	console.log('Run "bun scripts/report-single.ts results/single-2vm.json docs/bench-single-2vm" to generate documentation')
}

main()
	.catch((error) => {
		console.error('\nError:', error)
		console.error('Stack:', error.stack)
		process.exit(1)
	})
