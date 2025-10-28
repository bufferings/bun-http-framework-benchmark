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

Generated on 2025-10-28

### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia@1.4.13    |   54563.58 |   81425.63 |   45829.63 |   36435.49 |
| deno    | kori@0.3.3       |   43545.02 |   49333.48 |   44253.01 |   37048.57 |
| deno    | hono@4.10.2      |   42488.94 |   53554.49 |   39221.35 |   34690.98 |
| bun     | hono@4.10.2      |   37816.39 |   50914.79 |   33776.18 |   28758.19 |
| bun     | kori@0.3.3       |   36697.30 |   47374.09 |   31905.74 |   30812.06 |
| node    | fastify@5.3.2    |   20154.46 |   25515.07 |   23178.00 |   11770.30 |
| node    | hono@4.10.2      |   14726.20 |   20740.07 |   17023.30 |    6415.24 |
| node    | kori@0.3.3       |   14222.51 |   18728.62 |   16388.81 |    7550.10 |
| node    | express@5.1.0    |    6693.97 |    6622.88 |    6466.30 |    6992.74 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   25168.90 |   18709.78 |   32719.01 |   24077.92 |
| deno    | kori@0.3.3       |   25027.84 |   24952.85 |   25064.10 |   25066.57 |
| bun     | hono@4.10.2      |   19983.31 |   18547.17 |   26444.97 |   14957.79 |
| bun     | elysia@1.4.13    |   19342.51 |   17597.92 |   24122.88 |   16306.73 |
| bun     | kori@0.3.3       |   13053.71 |   13072.47 |   13049.53 |   13039.12 |
| node    | hono@4.10.2      |    9282.53 |    7700.80 |   11302.01 |    8844.78 |
| node    | kori@0.3.3       |    5481.78 |    5477.09 |    5479.20 |    5489.04 |

### Benchmark Environment

| Item | Value |
|---|---|
| Platform | GitHub Actions (ubuntu-latest) |
| OS | Ubuntu 24.04.3 LTS |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15Gi |
| Runtimes | Bun 1.3.1, Node.js 22.20.0, Deno 2.5.4 |
| Benchmark | bombardier (20s, 50 connections) × 3 run(s) |


<!-- END BENCHMARK RESULTS -->
