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


### Latest Benchmark Results

Generated on 2025-10-26

### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia@1.4.13    |   54926.47 |   81802.86 |   46789.10 |   36187.45 |
| deno    | kori@0.3.3       |   42302.08 |   47502.02 |   43373.84 |   36030.37 |
| deno    | hono@4.10.2      |   41399.49 |   52177.49 |   38297.38 |   33723.59 |
| bun     | hono@4.10.2      |   37100.97 |   50979.65 |   33060.36 |   27262.91 |
| bun     | kori@0.3.3       |   36295.18 |   47807.25 |   31310.28 |   29768.01 |
| node    | fastify@5.3.2    |   19314.73 |   24326.30 |   21992.60 |   11625.28 |
| node    | hono@4.10.2      |   14077.65 |   19892.45 |   16382.60 |    5957.91 |
| node    | kori@0.3.3       |   13847.23 |   17736.78 |   16492.62 |    7312.29 |
| node    | express@5.1.0    |    6227.49 |    6078.47 |    5967.58 |    6636.41 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   24467.09 |   18052.25 |   32009.38 |   23339.63 |
| deno    | kori@0.3.3       |   23779.72 |   23507.36 |   23645.44 |   24186.36 |
| bun     | hono@4.10.2      |   19254.05 |   17873.30 |   25434.30 |   14454.54 |
| bun     | elysia@1.4.13    |   18377.22 |   16902.40 |   22716.11 |   15513.15 |
| bun     | kori@0.3.3       |   12362.57 |   12383.07 |   12365.70 |   12338.95 |
| node    | hono@4.10.2      |    8847.38 |    7305.52 |   10886.43 |    8350.20 |
| node    | kori@0.3.3       |    5300.22 |    5277.06 |    5314.71 |    5308.88 |

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
