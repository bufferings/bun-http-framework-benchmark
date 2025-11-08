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

// Parse flags and filters
const args = Bun.argv.slice(2);
const cliFilters = args.filter((arg) => !arg.startsWith("-"));
const envFilters = process.env.FRAMEWORKS?.split(",").filter(Boolean) || [];
const targetFilters = cliFilters.length > 0 ? cliFilters : envFilters;

const getFlag = (name: string, defaultValue: number): number => {
  const flag = args.find((arg) => arg.startsWith(`--${name}=`));
  if (flag) {
    const value = parseInt(flag.split("=")[1]);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
};

const time = getFlag("time", 10);
const connections = getFlag("connections", 300);
const runs = getFlag("runs", 3);

if (targetFilters.length > 0) {
  console.log("Target filters:", targetFilters);
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

// Define 10 endpoints to test
const endpoints = [
  {
    name: "GET /api/users/:id",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await retryFetch(
        "http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000",
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "GET /api/users",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/api/users?page=1&limit=10`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://127.0.0.1:3000/api/users?page=1&limit=10`,
    test: async () => {
      const res = await retryFetch(
        "http://127.0.0.1:3000/api/users?page=1&limit=10",
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "POST /api/users",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-user.json http://127.0.0.1:3000/api/users`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-user.json http://127.0.0.1:3000/api/users`,
    test: async () => {
      const res = await retryFetch("http://127.0.0.1:3000/api/users", {
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
      `oha --no-tui -c ${connections} -z ${time}s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-user-update.json http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-user-update.json http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await retryFetch(
        "http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000",
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
      `oha --no-tui -c ${connections} -z ${time}s -m DELETE http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m DELETE http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000`,
    test: async () => {
      const res = await retryFetch(
        "http://127.0.0.1:3000/api/users/550e8400-e29b-41d4-a716-446655440000",
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
      `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/api/posts/123`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://127.0.0.1:3000/api/posts/123`,
    test: async () => {
      const res = await retryFetch("http://127.0.0.1:3000/api/posts/123");
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "GET /api/posts",
    command:
      `oha --no-tui -c ${connections} -z ${time}s http://127.0.0.1:3000/api/posts?userId=123&page=1`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s http://127.0.0.1:3000/api/posts?userId=123&page=1`,
    test: async () => {
      const res = await retryFetch(
        "http://127.0.0.1:3000/api/posts?userId=123&page=1",
      );
      if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    },
  },
  {
    name: "POST /api/posts",
    command:
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-post.json http://127.0.0.1:3000/api/posts`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-post.json http://127.0.0.1:3000/api/posts`,
    test: async () => {
      const res = await retryFetch("http://127.0.0.1:3000/api/posts", {
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
      `oha --no-tui -c ${connections} -z ${time}s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-post.json http://127.0.0.1:3000/api/posts/123`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m PUT -H Content-Type:application/json -D ./scripts/data/multi-post.json http://127.0.0.1:3000/api/posts/123`,
    test: async () => {
      const res = await retryFetch("http://127.0.0.1:3000/api/posts/123", {
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
      `oha --no-tui -c ${connections} -z ${time}s -m POST -H Content-Type:application/json -D ./scripts/data/multi-comment.json http://127.0.0.1:3000/api/comments`,
    warmup:
      `oha --no-tui -c ${connections} -z 5s -m POST -H Content-Type:application/json -D ./scripts/data/multi-comment.json http://127.0.0.1:3000/api/comments`,
    test: async () => {
      const res = await retryFetch("http://127.0.0.1:3000/api/comments", {
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

const spawn = async (target: string) => {
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
      await fetch("http://127.0.0.1:3000/api/users?page=1&limit=10");
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

  // Filter by target filters if specified
  if (targetFilters.length > 0) {
    frameworks = frameworks.filter((fw) =>
      targetFilters.some((filter) => fw!.includes(filter))
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
      kill = await spawn(target!);

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

  writeFileSync("results/multi.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to results/multi.json");
  console.log(
    'Run "bun scripts/report-multi.ts results/multi.json docs/bench-multi" to generate documentation',
  );
};

const toNumber = (a: string) => +a.replaceAll(",", "");

main()
  .catch((error) => {
    console.error("\nError:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  });
