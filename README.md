# Kori Framework Benchmarks

> This repository is based on [SaltyAom/bun-http-framework-benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark), adapted for Kori framework development.

Performance benchmarks for [Kori](https://github.com/bufferings/kori) across Bun, Node.js, and Deno runtimes.

Kori uses Hono's router internally, aiming to stay within ~10% overhead.

## Benchmarks

### Basic Benchmarks
- **Ping** - `GET /` returns "Hi" (text/plain)
- **Query** - `GET /id/:id?name=bun` extracts params and query (returns "1 bun")
- **Body** - `POST /json` parses and mirrors JSON body

### Validation Benchmarks
- **Zod** - Request body validation using Zod schema
- **Valibot** - Request body validation using Valibot schema
- **ArkType** - Request body validation using ArkType schema

## Prerequisites

- [bombardier](https://github.com/codesenberg/bombardier) - HTTP benchmarking tool
- Bun, Node.js, and/or Deno runtimes

## Usage

```bash
# Run all benchmarks
bun run benchmark

# Run specific frameworks (use runtime/framework format)
bun bench.ts bun/kori node/kori

# Custom settings
bun bench.ts bun/kori --time=10 --connections=64 --runs=3
```

<!-- START BENCHMARK RESULTS -->

## Latest Benchmark Results

Generated on 2025-10-25


### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia@1.4.13    |   54872.00 |   81907.25 |   46249.51 |   36459.25 |
| deno    | kori@0.3.3       |   42283.38 |   47954.15 |   43372.01 |   35523.97 |
| deno    | hono@4.10.2      |   41306.12 |   51967.97 |   38338.64 |   33611.75 |
| bun     | hono@4.10.2      |   37369.73 |   50592.49 |   33006.72 |   28509.99 |
| bun     | kori@0.3.3       |   36118.91 |   46833.71 |   31674.23 |   29848.79 |
| node    | fastify@5.3.2    |   19415.18 |   24092.10 |   22612.05 |   11541.38 |
| node    | hono@4.10.2      |   14282.35 |   20359.45 |   16365.72 |    6121.87 |
| node    | kori@0.3.3       |   14097.85 |   18503.69 |   16716.42 |    7073.45 |
| node    | express@5.1.0    |    6214.95 |    6073.78 |    5936.71 |    6634.37 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   24252.27 |   17831.21 |   31712.39 |   23213.20 |
| deno    | kori@0.3.3       |   23204.87 |   22960.18 |   22976.89 |   23677.55 |
| bun     | hono@4.10.2      |   19642.57 |   17882.73 |   26671.64 |   14373.35 |
| bun     | elysia@1.4.13    |   18828.03 |   17152.60 |   23316.35 |   16015.14 |
| bun     | kori@0.3.3       |   12458.84 |   12487.97 |   12479.73 |   12408.83 |
| node    | hono@4.10.2      |    8884.68 |    7491.28 |   10942.76 |    8220.00 |
| node    | kori@0.3.3       |    5320.34 |    5304.44 |    5320.00 |    5336.59 |

### Benchmark Environment

| Item | Value |
|---|---|
| Platform | GitHub Actions (ubuntu-latest) |
| OS | Ubuntu 24.04.3 LTS |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15Gi |
| Runtimes | Bun 1.3.1, Node.js 22.20.0, Deno 2.5.4 |
| Benchmark | bombardier (30s, 128 connections) × 1 run(s) |

<!-- END BENCHMARK RESULTS -->
