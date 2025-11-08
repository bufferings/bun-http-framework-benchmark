import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { cpus, platform, release, totalmem } from "os";
import killPort from "kill-port";
import { formatFrameworkWithVersion } from "./tools/get-versions";

// Get target endpoints from CLI args
const args = Bun.argv.slice(2);
const cliEndpoints = args.filter((arg) => !arg.startsWith("-"));
const envEndpoints = process.env.ENDPOINTS?.split(",").filter(Boolean) || [];
const targetEndpoints = cliEndpoints.length > 0 ? cliEndpoints : envEndpoints;

// Parse flags
const getFlag = (name: string, defaultValue: number): number => {
  const flag = args.find((arg) => arg.startsWith(`--${name}=`));
  if (flag) {
    const value = parseInt(flag.split("=")[1]);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
};

const time = getFlag("time", 10);
const connections = getFlag("connections", 200);
const runs = getFlag("runs", 3);

if (targetEndpoints.length > 0) {
  console.log("Target endpoints:", targetEndpoints);
}
console.log(
  `Configuration: ${time}s duration, ${connections} connections, ${runs} runs (median)`,
);

const runtimeCommand = {
  node: "node",
  deno: "deno run --allow-net --allow-env",
  bun: "bun run",
} as const;

const catchNumber = /Requests\/sec:\s+(\d+(?:[.|,]\d+)?)/m;
const format = (value: string | number) => {
  const num = +value;
  return num.toFixed(2).padStart(10);
};
const sleep = (s = 1) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

// Fetch with retry and timeout
const retryFetch = (
  url: string,
  options?: RequestInit,
  time = 0,
  resolveEnd?: Function,
  rejectEnd?: Function,
) => {
  return new Promise<Response>((resolve, reject) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    fetch(url, { ...options, signal: controller.signal })
      .then((a) => {
        clearTimeout(timeout);
        const resolveFunc = resolveEnd || resolve;
        resolveFunc(a);
      })
      .catch((e) => {
        clearTimeout(timeout);
        if (time > 20) {
          const rejectFunc = rejectEnd || reject;
          rejectFunc(e);
          return;
        }
        setTimeout(
          () => retryFetch(url, options, time + 1, resolve, reject),
          300,
        );
      });
  });
};

// Test function for each endpoint type
const testEndpoint = async (endpointType: string) => {
  if (endpointType === "ping") {
    const index = await retryFetch("http://127.0.0.1:3000/");
    const indexText = await index.text();
    if (indexText !== "Hi") {
      throw new Error(`Result not match (expected "Hi", got "${indexText}")`);
    }
    if (!index.headers.get("Content-Type")?.includes("text/plain")) {
      throw new Error("Content-Type not match");
    }
  } else if (endpointType === "query") {
    const query = await retryFetch("http://127.0.0.1:3000/1?name=bun");
    const queryText = await query.text();
    if (queryText !== "1 bun") {
      throw new Error(
        `Result not match (expected "1 bun", got "${queryText}")`,
      );
    }
    if (!query.headers.get("Content-Type")?.includes("text/plain")) {
      throw new Error("Content-Type not match");
    }
    if (!query.headers.get("X-Powered-By")?.includes("benchmark")) {
      throw new Error("X-Powered-By not match");
    }
  } else if (endpointType === "body") {
    const body = await retryFetch("http://127.0.0.1:3000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hello: "world" }),
    });
    const bodyText = await body.text();
    const expectedBody = JSON.stringify({ hello: "world" });
    if (bodyText !== expectedBody) {
      throw new Error(
        `Result not match (expected "${expectedBody}", got "${bodyText}")`,
      );
    }
    if (!body.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error("Content-Type not match");
    }
  } else if (endpointType.startsWith("validate-")) {
    const validationBody = {
      hello: "world",
      count: 42,
      tags: ["test", "benchmark"],
    };
    const response = await retryFetch("http://127.0.0.1:3000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validationBody),
    });
    if (response.status === 404) {
      throw new Error("Validation endpoint not supported");
    }
    const responseText = await response.text();
    const expectedResponse = JSON.stringify(validationBody);
    if (responseText !== expectedResponse) {
      throw new Error(
        `Result not match (expected "${expectedResponse}", got "${responseText}")`,
      );
    }
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error("Content-Type not match");
    }
  }
};

const spawn = async (target: string) => {
  let [runtime, framework, endpoint] = target.split("/") as [
    keyof typeof runtimeCommand,
    string,
    string,
  ];

  let file = `src/single/${runtime}/${framework}/${endpoint}.ts`;
  if (!existsSync(file)) {
    file = `src/single/${runtime}/${framework}/${endpoint}.mjs`;
    if (!existsSync(file)) {
      file = `src/single/${runtime}/${framework}/${endpoint}.js`;
      if (!existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }
    }
  }

  const cmd = [...runtimeCommand[runtime].split(" "), file];

  const server = Bun.spawn({
    cmd,
    env: {
      ...Bun.env,
      NODE_ENV: "production",
    },
    stdout: "ignore",
    stderr: "ignore",
  });

  // Wait for server to be ready
  const maxRetries = 60;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await fetch("http://127.0.0.1:3000/");
      break;
    } catch {
      retries++;
      if (retries >= maxRetries) {
        throw new Error(`Server failed to start after ${maxRetries} attempts`);
      }
      await sleep(0.2);
    }
  }

  return async () => {
    await server.kill();
    await sleep(0.5);

    try {
      await killPort(3000);
    } catch {
      // Already closed
    }
  };
};

if (!existsSync("results")) mkdirSync("results");

const main = async () => {
  try {
    await fetch("http://127.0.0.1:3000");
    await killPort(3000);
  } catch {
    // Empty
  }

  // Discover all endpoint files
  let endpoints = readdirSync("src/single")
    .flatMap((runtime) => {
      if (!lstatSync(`src/single/${runtime}`).isDirectory()) return;

      return readdirSync(`src/single/${runtime}`)
        .filter((framework) =>
          lstatSync(`src/single/${runtime}/${framework}`).isDirectory()
        )
        .flatMap((framework) => {
          return readdirSync(`src/single/${runtime}/${framework}`)
            .filter((file) =>
              file.endsWith(".ts") || file.endsWith(".mjs") ||
              file.endsWith(".js")
            )
            .map((file) =>
              `${runtime}/${framework}/${file.replace(/\.(ts|mjs|js)$/, "")}`
            );
        });
    })
    .filter((x) => x)
    .sort();

  // Filter by target endpoints if specified
  if (targetEndpoints.length > 0) {
    endpoints = endpoints.filter((endpoint) =>
      targetEndpoints.some((target) => endpoint!.includes(target))
    );
  }

  console.log(`\n${endpoints.length} endpoints`);
  for (const endpoint of endpoints) console.log(`- ${endpoint}`);

  console.log("\nRunning benchmarks:");

  const benchmarkResults = [];

  for (const target of endpoints) {
    const [runtime, framework, endpointType] = target!.split("/");
    const displayName = formatFrameworkWithVersion(framework);

    console.log(`\n${target}`);

    // Start server
    let kill: (() => Promise<void>) | null = null;
    try {
      kill = await spawn(target!);

      // Test endpoint
      try {
        await testEndpoint(endpointType);
        console.log(`✅ Endpoint test passed`);
      } catch (error) {
        console.log(
          `❌ Endpoint test failed: ${(error as Error)?.message || error}`,
        );
        continue;
      }

      // Warm up
      const warmupCommand = getWarmupCommand(endpointType);
      console.log("Warming up...");
      await Bun.spawn({
        cmd: warmupCommand.split(" "),
        env: Bun.env,
        stdout: "ignore",
      }).exited;

      // Run benchmark multiple times
      const runResults: number[] = [];
      const command = getCommand(endpointType);

      for (let run = 0; run < runs; run++) {
        console.log(`[${run + 1}/${runs}] ${command}`);

        const res = Bun.spawn({
          cmd: command.split(" "),
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

      benchmarkResults.push({
        endpoint: endpointType,
        runtime,
        framework,
        displayName,
        results: runResults,
        median,
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
  const cpu = cpus()[0];
  const cpuModel = cpu ? `${cpu.model} (${cpus().length} cores)` : "Unknown";
  const memoryGB = (totalmem() / (1024 ** 3)).toFixed(1);

  // Get runtime versions
  const runtimes: Record<string, string> = {};
  try {
    const bunVersion = Bun.version;
    if (bunVersion) runtimes.bun = bunVersion;
  } catch {}

  try {
    const nodeProc = Bun.spawn(["node", "--version"]);
    const nodeVersion = await new Response(nodeProc.stdout).text();
    if (nodeVersion) runtimes.node = nodeVersion.trim().replace("v", "");
  } catch {}

  try {
    const denoProc = Bun.spawn(["deno", "--version"]);
    const denoOutput = await new Response(denoProc.stdout).text();
    const denoVersion = denoOutput.match(/deno (\S+)/)?.[1];
    if (denoVersion) runtimes.deno = denoVersion;
  } catch {}

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
      environment: {
        platform: platform(),
        os: `${platform()} ${release()}`,
        cpu: cpuModel,
        memory: `${memoryGB}GB`,
        runtimes,
      },
    },
    benchmarks: benchmarkResults,
  };

  writeFileSync("results/single.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to results/single.json");
  console.log(
    'Run "bun scripts/report-single.ts results/single.json docs/bench-single" to generate documentation',
  );
};

const getWarmupCommand = (endpointType: string) => {
  const warmupTime = 5;
  const warmupConnections = connections;
  if (endpointType === "ping") {
    return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s http://127.0.0.1:3000/`;
  } else if (endpointType === "query") {
    return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s http://127.0.0.1:3000/1?name=bun`;
  } else if (endpointType === "body") {
    return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s -m POST -H Content-Type:application/json -D ./scripts/data/body.json http://127.0.0.1:3000/`;
  } else if (endpointType.startsWith("validate-")) {
    return `oha --no-tui -c ${warmupConnections} -z ${warmupTime}s -m POST -H Content-Type:application/json -D ./scripts/data/body-validation.json http://127.0.0.1:3000/`;
  }
  throw new Error(`Unknown endpoint type: ${endpointType}`);
};

const getCommand = (endpointType: string) => {
  if (endpointType === "ping") {
    return `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/`;
  } else if (endpointType === "query") {
    return `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/1?name=bun`;
  } else if (endpointType === "body") {
    return `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/body.json http://127.0.0.1:3000/`;
  } else if (endpointType.startsWith("validate-")) {
    return `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/body-validation.json http://127.0.0.1:3000/`;
  }
  throw new Error(`Unknown endpoint type: ${endpointType}`);
};

const toNumber = (a: string) => +a.replaceAll(",", "");

main()
  .catch((error) => {
    console.error("\nError:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  });
