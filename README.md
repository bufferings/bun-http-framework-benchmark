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

Generated on 2025-10-29

### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia@1.4.13    |   54729.26 |   82404.86 |   45899.75 |   35883.18 |
| deno    | kori@0.3.3       |   42003.41 |   48068.30 |   42948.77 |   34993.17 |
| deno    | hono@4.10.2      |   41691.77 |   52647.70 |   38311.47 |   34116.13 |
| bun     | hono@4.10.2      |   36434.42 |   50562.78 |   31771.22 |   26969.25 |
| bun     | kori@0.3.3       |   35949.48 |   47127.77 |   30936.81 |   29783.86 |
| node    | fastify@5.3.2    |   19497.70 |   24621.58 |   22723.08 |   11148.45 |
| node    | hono@4.10.2      |   14309.78 |   20440.50 |   16404.80 |    6084.05 |
| node    | kori@0.3.3       |   13385.68 |   17586.14 |   15582.22 |    6988.69 |
| node    | express@5.1.0    |    6312.36 |    6313.85 |    6085.30 |    6537.92 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | kori@0.3.3       |   24295.05 |   24128.03 |   24126.83 |   24630.30 |
| deno    | hono@4.10.2      |   24271.82 |   18388.14 |   31470.42 |   22956.90 |
| bun     | hono@4.10.2      |   18970.28 |   16987.64 |   25417.42 |   14505.78 |
| bun     | elysia@1.4.13    |   18068.74 |   16757.89 |   22362.88 |   15085.46 |
| bun     | kori@0.3.3       |   12417.08 |   12460.67 |   12375.03 |   12415.54 |
| node    | hono@4.10.2      |    8740.24 |    7388.30 |   10665.25 |    8167.17 |
| node    | kori@0.3.3       |    5244.51 |    5240.10 |    5233.69 |    5259.73 |

### Benchmark Environment

| Item | Value |
|---|---|
| Platform | GitHub Actions (ubuntu-latest) |
| OS | Ubuntu 24.04.3 LTS |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15Gi |
| Runtimes | Bun 1.3.1, Node.js 22.20.0, Deno 2.5.4 |
| Benchmark | bombardier (30s, 128 connections) × 3 run(s) |


<!-- END BENCHMARK RESULTS -->
