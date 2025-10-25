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
| bun     | elysia           |   55053.50 |   82975.81 |   46927.47 |   35257.22 |
| deno    | kori@0.3.3       |   42798.32 |   48114.97 |   44009.26 |   36270.72 |
| deno    | hono@4.10.2      |   40949.70 |   51858.46 |   38039.54 |   32951.10 |
| bun     | hono@4.10.2      |   37286.11 |   50178.71 |   32635.86 |   29043.77 |
| bun     | kori@0.3.3       |   34777.98 |   45967.53 |   29641.25 |   28725.17 |
| node    | fastify@5.3.2    |   19891.18 |   25418.46 |   22726.77 |   11528.31 |
| node    | hono@4.10.2      |   14630.81 |   20494.77 |   17031.41 |    6366.25 |
| node    | kori@0.3.3       |   14557.01 |   19453.34 |   16926.83 |    7290.86 |
| node    | express@5.1.0    |    6505.72 |    6340.14 |    6201.75 |    6975.26 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | kori@0.3.3       |   24455.80 |   24238.84 |   24493.80 |   24634.77 |
| deno    | hono@4.10.2      |   24346.77 |   17843.06 |   31817.49 |   23379.77 |
| bun     | hono@4.10.2      |   18902.80 |   17168.75 |   26210.36 |   13329.28 |
| bun     | elysia           |   18463.98 |   16698.61 |   23449.10 |   15244.24 |
| bun     | kori@0.3.3       |   12071.62 |   12071.64 |   12054.12 |   12089.11 |
| node    | hono@4.10.2      |    8991.03 |    7549.14 |   11084.33 |    8339.62 |
| node    | kori@0.3.3       |    5440.31 |    5415.68 |    5454.06 |    5451.18 |

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
