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
| bun     | elysia           |   53642.48 |   82844.57 |   44665.09 |   33417.78 |
| deno    | kori@0.3.3       |   41684.73 |   46596.41 |   43129.70 |   35328.08 |
| deno    | hono@4.10.2      |   40433.85 |   51465.42 |   36954.49 |   32881.65 |
| bun     | hono@4.10.2      |   35606.73 |   48997.92 |   30986.24 |   26836.03 |
| bun     | kori@0.3.3       |   35086.54 |   46237.86 |   29914.43 |   29107.34 |
| node    | fastify@5.3.2    |   18542.06 |   22800.82 |   21784.04 |   11041.31 |
| node    | hono@4.10.2      |   13871.85 |   19364.15 |   16665.63 |    5585.77 |
| node    | kori@0.3.3       |   12806.56 |   16986.43 |   14943.26 |    6489.99 |
| node    | express@5.1.0    |    5788.74 |    5794.22 |    5599.81 |    5972.20 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   24270.99 |   17732.26 |   31779.26 |   23301.46 |
| deno    | kori@0.3.3       |   23875.76 |   23464.35 |   24060.54 |   24102.40 |
| bun     | hono@4.10.2      |   18525.87 |   16648.54 |   25320.07 |   13608.99 |
| bun     | elysia           |   17328.90 |   15401.22 |   22386.61 |   14198.87 |
| bun     | kori@0.3.3       |   12119.00 |   12002.13 |   12155.69 |   12199.19 |
| node    | hono@4.10.2      |    8830.32 |    7308.33 |   10943.56 |    8239.08 |
| node    | kori@0.3.3       |    5170.09 |    5027.53 |    5230.59 |    5252.16 |

<!-- END BENCHMARK RESULTS -->
