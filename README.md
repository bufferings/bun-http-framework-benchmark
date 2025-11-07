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

- [oha](https://github.com/hatoo/oha) - HTTP benchmarking tool
- Bun, Node.js, and/or Deno runtimes

## Usage

```bash
# Run single-process benchmarks
bun run scripts/bench-single.ts

# Run specific endpoints
bun run scripts/bench-single.ts bun/kori deno/hono

# Custom settings
bun run scripts/bench-single.ts --time=10 --connections=100 --runs=3

# Generate documentation
bun run scripts/report.ts results/single.json docs/bench-single
```

<!-- START BENCHMARK RESULTS -->

## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |    166,187 |     94,998 |     78,037 |     53,240 |     54,687 |     53,243 |
| bun     | hono@4.10.2    |     98,944 |     74,448 |     58,526 |     43,356 |     43,575 |     42,418 |
| bun     | kori@0.3.4     |     94,796 |     79,005 |     71,203 |     36,317 |     36,813 |     35,590 |
| deno    | hono@4.10.2    |     90,165 |     56,380 |     39,054 |     34,405 |     33,308 |     35,217 |
| deno    | kori@0.3.4     |     79,961 |     67,652 |     49,555 |     35,167 |     33,839 |     34,830 |
| node    | fastify@5.3.2  |     44,930 |     41,778 |     21,432 |         - |         - |         - |
| node    | hono@4.10.2    |     38,093 |     31,372 |     11,384 |     10,692 |     10,603 |     10,725 |
| node    | kori@0.3.4     |     35,236 |     30,498 |     13,043 |     11,098 |     11,252 |     11,064 |
| node    | express@5.1.0  |     10,233 |      9,539 |      6,966 |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-07T15:56:50.568Z |
| Tool | oha |
| Settings | 30s duration, 200 connections, 3 runs |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz (4 cores) |
| Memory | 15.6GB |


<!-- END BENCHMARK RESULTS -->
