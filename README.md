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

Generated on 2025-10-26

### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia@1.4.13    |   54949.08 |   83065.64 |   46068.15 |   35713.44 |
| deno    | kori@0.3.3       |   43085.76 |   48569.47 |   44246.30 |   36441.50 |
| deno    | hono@4.10.2      |   41953.61 |   52525.90 |   39117.25 |   34217.68 |
| bun     | hono@4.10.2      |   36961.90 |   50831.93 |   32151.65 |   27902.13 |
| bun     | kori@0.3.3       |   36034.46 |   47584.27 |   30801.29 |   29717.81 |
| node    | fastify@5.3.2    |   19342.69 |   24677.09 |   21640.81 |   11710.16 |
| node    | hono@4.10.2      |   13780.67 |   19853.35 |   15325.64 |    6163.01 |
| node    | kori@0.3.3       |   13279.27 |   17281.99 |   15358.38 |    7197.45 |
| node    | express@5.1.0    |    6458.89 |    6366.84 |    6205.12 |    6804.71 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   24821.30 |   18237.27 |   32461.53 |   23765.10 |
| deno    | kori@0.3.3       |   24399.28 |   24233.08 |   24399.92 |   24564.85 |
| bun     | hono@4.10.2      |   18256.21 |   15929.99 |   25182.15 |   13656.49 |
| bun     | elysia@1.4.13    |   17138.66 |   15059.66 |   21809.17 |   14547.16 |
| bun     | kori@0.3.3       |   12538.41 |   12505.57 |   12590.44 |   12519.21 |
| node    | hono@4.10.2      |    8995.66 |    7579.00 |   10974.01 |    8433.97 |
| node    | kori@0.3.3       |    5371.53 |    5337.39 |    5374.94 |    5402.25 |

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
