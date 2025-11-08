import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { formatFrameworkWithVersion } from "./tools/get-versions";

// Get target frameworks from CLI args
const args = Bun.argv.slice(2);
const cliFrameworks = args.filter((arg) => !arg.startsWith("-"));
const envFrameworks = process.env.FRAMEWORKS?.split(",").filter(Boolean) || [];
const targetFrameworks = cliFrameworks.length > 0
  ? cliFrameworks
  : envFrameworks;

// Parse flags
const getFlag = (name: string, defaultValue: number): number => {
  const flag = args.find((arg) => arg.startsWith(`--${name}=`));
  if (flag) {
    const value = parseInt(flag.split("=")[1]);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
};

const time = getFlag("time", 30);
const connections = getFlag("connections", 128);
const runs = getFlag("runs", 1);

if (targetFrameworks.length > 0) {
  console.log("Target frameworks:", targetFrameworks);
}
console.log(
  `Configuration: ${time}s duration, ${connections} connections, ${runs} runs (median)`,
);

// Get environment variables for GCP
const targetVmName = process.env.TARGET_VM_NAME || "bench-vm-target";
const gcpProjectId = process.env.GCP_PROJECT_ID;
const gcpZone = process.env.GCP_ZONE;

if (!gcpProjectId || !gcpZone) {
  console.error("Error: GCP_PROJECT_ID and GCP_ZONE must be set");
  process.exit(1);
}

const runtimeCommand = {
  node: "node",
  deno: "deno run --allow-net --allow-env",
  bun: "bun run",
} as const;

const catchNumber = /Requests\/sec:\s+(\d+(?:[.|,]\d+)?)/m;
const sleep = (s = 1) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

// Get target VM's internal IP
const getTargetIp = async () => {
  const output = await Bun
    .$`gcloud compute instances describe ${targetVmName} --zone=${gcpZone} --project=${gcpProjectId} --format='get(networkInterfaces[0].networkIP)'`
    .text();
  return output.trim();
};

// Get OS info from VM
const getVmOsInfo = async (vmName: string) => {
  try {
    const output = await Bun
      .$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"'"`
      .text();
    return output.trim() || "Ubuntu";
  } catch {
    return "Ubuntu";
  }
};

// Get CPU info from VM
const getVmCpuInfo = async (vmName: string) => {
  try {
    const output = await Bun
      .$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="lscpu | grep 'Model name' | cut -d: -f2 | xargs"`
      .text();
    const cpuModel = output.trim();
    const coresOutput = await Bun
      .$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="nproc"`
      .text();
    const cores = coresOutput.trim();
    return cpuModel ? `${cpuModel} (${cores} cores)` : "Unknown";
  } catch {
    return "Unknown";
  }
};

// Get memory info from VM
const getVmMemoryInfo = async (vmName: string) => {
  try {
    const output = await Bun
      .$`gcloud compute ssh ${vmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="free -g | grep Mem | awk '{print \$2}'"`
      .text();
    const memoryGB = output.trim();
    return memoryGB ? `${memoryGB}GB` : "Unknown";
  } catch {
    return "Unknown";
  }
};

// Get runtime versions from target VM
const getTargetRuntimeVersions = async () => {
  const runtimes: Record<string, string> = {};

  try {
    const bunVersion = await Bun
      .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="bun --version"`
      .text();
    if (bunVersion) runtimes.bun = bunVersion.trim();
  } catch {}

  try {
    const nodeVersion = await Bun
      .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="node --version"`
      .text();
    if (nodeVersion) runtimes.node = nodeVersion.trim().replace("v", "");
  } catch {}

  try {
    const denoOutput = await Bun
      .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="deno --version"`
      .text();
    const denoVersion = denoOutput.toString().match(/deno (\S+)/)?.[1];
    if (denoVersion) runtimes.deno = denoVersion;
  } catch {}

  return runtimes;
};

// Define 10 endpoints to test
const createEndpoints = (targetIp: string) => [
  {
    name: "GET /api/users/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await fetch(
        `http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "GET /api/users",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/api/users?page=1&limit=10`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://${targetIp}:3000/api/users?page=1&limit=10`,
    test: async () => {
      const res = await fetch(
        `http://${targetIp}:3000/api/users?page=1&limit=10`,
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "POST /api/users",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-user.json http://${targetIp}:3000/api/users`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-user.json http://${targetIp}:3000/api/users`,
    test: async () => {
      const res = await fetch(`http://${targetIp}:3000/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          age: 30,
        }),
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "PUT /api/users/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-user-update.json http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-user-update.json http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await fetch(
        `http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Updated",
            email: "john.new@example.com",
            age: 31,
          }),
        },
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "DELETE /api/users/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m DELETE http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m DELETE http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await fetch(
        `http://${targetIp}:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
        {
          method: "DELETE",
        },
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "GET /api/posts/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/api/posts/123`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://${targetIp}:3000/api/posts/123`,
    test: async () => {
      const res = await fetch(`http://${targetIp}:3000/api/posts/123`);
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "GET /api/posts",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://${targetIp}:3000/api/posts?userId=123&page=1`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://${targetIp}:3000/api/posts?userId=123&page=1`,
    test: async () => {
      const res = await fetch(
        `http://${targetIp}:3000/api/posts?userId=123&page=1`,
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "POST /api/posts",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-post.json http://${targetIp}:3000/api/posts`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-post.json http://${targetIp}:3000/api/posts`,
    test: async () => {
      const res = await fetch(`http://${targetIp}:3000/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Post",
          content: "Content here",
          tags: ["test"],
        }),
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "PUT /api/posts/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-post.json http://${targetIp}:3000/api/posts/123`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-post.json http://${targetIp}:3000/api/posts/123`,
    test: async () => {
      const res = await fetch(`http://${targetIp}:3000/api/posts/123`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Post",
          content: "Content here",
          tags: ["test"],
        }),
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "POST /api/comments",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-comment.json http://${targetIp}:3000/api/comments`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-comment.json http://${targetIp}:3000/api/comments`,
    test: async () => {
      const res = await fetch(`http://${targetIp}:3000/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: "123",
          content: "Great post!",
          author: "Jane",
        }),
      });
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
];

// Spawn server on target VM
const spawnOnTarget = async (target: string, targetIp: string) => {
  let [runtime, framework] = target.split("/") as [
    keyof typeof runtimeCommand,
    string,
  ];

  let file = `src/multi/${runtime}/${framework}.ts`;
  if (!existsSync(file)) {
    file = `src/multi/${runtime}/${framework}.mjs`;
    if (!existsSync(file)) {
      file = `src/multi/${runtime}/${framework}.js`;
      if (!existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }
    }
  }

  const cmd =
    `screen -dmS benchmark bash -c 'cd ~/bun-http-framework-benchmark && ${
      runtimeCommand[runtime]
    } ${file} > /dev/null 2>&1'`;

  await Bun
    .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command=${cmd}`
    .quiet();

  // Wait for server to be ready
  await sleep(3);

  return async () => {
    try {
      await Bun
        .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="screen -S benchmark -X quit"`
        .quiet();
    } catch {
      // Ignore if no session exists
    }
    try {
      await Bun
        .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="pkill -f 'bun run\\|node\\|deno'"`
        .quiet();
    } catch {
      // Ignore if no processes found
    }
    await sleep(1);
  };
};

if (!existsSync("results")) mkdirSync("results");

const main = async () => {
  // Sync repository to target VM
  console.log(`Syncing repository to ${targetVmName}...`);
  await Bun
    .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="rm -rf ~/bun-http-framework-benchmark && mkdir -p ~/bun-http-framework-benchmark"`
    .quiet();
  await Bun
    .$`gcloud compute scp --recurse --internal-ip --zone=${gcpZone} --project=${gcpProjectId} ./src ./package.json ./bun.lockb ./scripts/data ${targetVmName}:~/bun-http-framework-benchmark/`
    .quiet();

  console.log("Installing dependencies on target VM...");
  await Bun
    .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="cd ~/bun-http-framework-benchmark && bun install"`
    .quiet();

  console.log("Setting ulimit on target VM...");
  await Bun
    .$`gcloud compute ssh ${targetVmName} --internal-ip --zone=${gcpZone} --project=${gcpProjectId} --command="ulimit -n 65535"`
    .quiet();

  console.log("\nGetting target VM IP...");
  const targetIp = await getTargetIp();
  console.log(`Target VM IP: ${targetIp}`);

  const endpoints = createEndpoints(targetIp);

  // Discover all framework files in src/multi
  let frameworks = readdirSync("src/multi")
    .flatMap((runtime) => {
      if (!lstatSync(`src/multi/${runtime}`).isDirectory()) return;

      return readdirSync(`src/multi/${runtime}`)
        .filter((file) =>
          file.endsWith(".ts") || file.endsWith(".mjs") || file.endsWith(".js")
        )
        .map((file) => `${runtime}/${file.replace(/\.(ts|mjs|js)$/, "")}`);
    })
    .filter((x) => x)
    .sort();

  // Filter by target frameworks if specified
  if (targetFrameworks.length > 0) {
    frameworks = frameworks.filter((fw) =>
      targetFrameworks.some((filter) => fw!.includes(filter))
    );
  }

  console.log(`\n${frameworks.length} frameworks`);
  for (const fw of frameworks) console.log(`- ${fw}`);

  console.log("\nRunning benchmarks:");

  const benchmarkResults = [];

  for (const target of frameworks) {
    const [runtime, framework] = target!.split("/");
    const displayName = formatFrameworkWithVersion(framework);

    console.log(`\n${target}`);

    let kill: (() => Promise<void>) | null = null;
    try {
      kill = await spawnOnTarget(target!, targetIp);

      // Test all endpoints
      console.log("Testing endpoints...");
      for (const endpoint of endpoints) {
        try {
          await endpoint.test();
        } catch (error) {
          console.log(
            `❌ ${endpoint.name} test failed: ${
              (error as Error)?.message || error
            }`,
          );
          throw error;
        }
      }
      console.log("✅ All endpoint tests passed");

      // Warm up framework with first endpoint
      console.log("\nWarming up framework...");
      await Bun.spawn({
        cmd: endpoints[0].warmup.split(" "),
        env: Bun.env,
        stdout: "ignore",
      }).exited;
      console.log("Warm up complete");

      // Benchmark each endpoint
      const endpointResults: Record<
        string,
        { results: number[]; median: number }
      > = {};

      for (const endpoint of endpoints) {
        console.log(`\nBenchmarking ${endpoint.name}`);

        // Run benchmark multiple times
        const runResults: number[] = [];

        for (let run = 0; run < runs; run++) {
          console.log(`[${run + 1}/${runs}] ${endpoint.command}`);

          const res = Bun.spawn({
            cmd: endpoint.command.split(" "),
            env: Bun.env,
          });

          const stdout = await new Response(res.stdout).text();
          await res.exited;

          const results = catchNumber.exec(stdout);
          if (results?.[1]) {
            const value = toNumber(results[1]);
            runResults.push(value);
            console.log(`  Result: ${results[1]} req/s`);
          }
        }

        // Sort and take median
        runResults.sort((a, b) => a - b);
        const median = runResults[Math.floor(runResults.length / 2)];
        console.log(`  Median: ${median.toFixed(2)} req/s`);

        endpointResults[endpoint.name] = {
          results: runResults,
          median,
        };
      }

      // Calculate average
      const medians = Object.values(endpointResults).map((r) => r.median);
      const average = medians.reduce((sum, val) => sum + val, 0) /
        medians.length;

      console.log(`\nAverage: ${average.toFixed(2)} req/s`);

      benchmarkResults.push({
        runtime,
        framework,
        displayName,
        endpoints: endpointResults,
        average,
      });
    } catch (error) {
      console.log(
        `❌ Failed to run benchmark: ${(error as Error)?.message || error}`,
      );
    } finally {
      if (kill) await kill();
    }
  }

  // Collect environment info
  console.log("\nCollecting environment information...");

  const loadVmName = process.env.LOAD_VM_NAME || "bench-vm-load";

  const [
    loadPlatform,
    loadOs,
    loadCpu,
    loadMemory,
    targetPlatform,
    targetOs,
    targetCpu,
    targetMemory,
    targetRuntimes,
  ] = await Promise.all([
    Promise.resolve("linux"),
    getVmOsInfo(loadVmName),
    getVmCpuInfo(loadVmName),
    getVmMemoryInfo(loadVmName),
    Promise.resolve("linux"),
    getVmOsInfo(targetVmName),
    getVmCpuInfo(targetVmName),
    getVmMemoryInfo(targetVmName),
    getTargetRuntimeVersions(),
  ]);

  // Save results
  const results = {
    meta: {
      timestamp: new Date().toISOString(),
      benchmark: {
        tool: "oha",
        duration: time,
        connections,
        runs,
      },
      environments: {
        load: {
          platform: loadPlatform,
          os: loadOs,
          cpu: loadCpu,
          memory: loadMemory,
        },
        target: {
          platform: targetPlatform,
          os: targetOs,
          cpu: targetCpu,
          memory: targetMemory,
          runtimes: targetRuntimes,
        },
      },
    },
    benchmarks: benchmarkResults,
  };

  writeFileSync("results/multi-2vm.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to results/multi-2vm.json");
  console.log(
    'Run "bun scripts/report-multi.ts results/multi-2vm.json docs/bench-multi-2vm" to generate documentation',
  );
};

const toNumber = (a: string) => +a.replaceAll(",", "");

main()
  .catch((error) => {
    console.error("\nError:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  });
