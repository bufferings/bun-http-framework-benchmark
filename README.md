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

<!-- START BENCHMARK SINGLE RESULTS -->

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


<!-- END BENCHMARK SINGLE RESULTS -->

<!-- START BENCHMARK MULTI RESULTS -->

## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints.

### Endpoints

| # | Method | Path | Validation |
|---|--------|------|------------|
| ① | GET    | /api/users/:id            | UUID param |
| ② | GET    | /api/users                |  |
| ③ | POST   | /api/users                | Body |
| ④ | PUT    | /api/users/:id            | UUID param + body |
| ⑤ | DELETE | /api/users/:id            | UUID param |
| ⑥ | GET    | /api/posts/:id            | Numeric ID param |
| ⑦ | GET    | /api/posts                |  |
| ⑧ | POST   | /api/posts                | Body |
| ⑨ | PUT    | /api/posts/:id            | Numeric ID param + body |
| ⑩ | POST   | /api/comments             | Body |


### Results (req/s)

| Runtime | Framework | ①     | ②     | ③     | ④     | ⑤     | ⑥     | ⑦     | ⑧     | ⑨     | ⑩     | Avg |
|---------|-----------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|-----:|
| bun     | elysia@1.4.13 |       58,178 |       38,343 |       32,507 |       29,731 |       57,856 |       59,605 |       41,712 |       31,872 |       28,571 |       33,168 |     41,154 |
| deno    | kori@0.3.4 |       25,900 |       41,293 |       28,353 |       18,685 |       41,553 |       42,541 |       41,443 |       29,107 |       19,048 |       29,440 |     31,736 |
| deno    | hono@4.10.2 |       25,059 |       39,560 |       29,472 |       18,527 |       40,058 |       41,638 |       39,800 |       29,530 |       15,532 |       29,725 |     30,890 |
| bun     | hono@4.10.2 |       29,514 |       28,069 |       25,285 |       21,070 |       29,055 |       29,881 |       28,191 |       24,552 |       21,297 |       25,266 |     26,218 |
| bun     | kori@0.3.4 |       27,694 |       25,958 |       21,133 |       19,459 |       27,950 |       30,172 |       27,494 |       21,256 |       19,761 |       22,175 |     24,305 |
| node    | fastify@5.3.2 |       25,696 |       25,939 |       18,307 |       17,464 |       25,869 |       26,548 |       26,468 |       19,249 |       18,693 |       18,989 |     22,322 |
| node    | hono@4.10.2 |       12,544 |       12,383 |        7,633 |        7,581 |        9,163 |       12,855 |       12,232 |        8,287 |        7,592 |        8,406 |      9,868 |
| node    | kori@0.3.4 |       12,040 |       12,121 |        7,101 |        7,252 |        8,953 |       12,224 |        9,857 |        7,561 |        7,230 |        7,913 |      9,225 |
| node    | express@5.1.0 |        5,534 |        5,463 |        4,306 |        4,374 |        5,438 |        5,483 |        5,438 |        4,414 |        4,335 |        4,489 |      4,927 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T01:29:34.697Z |
| Tool | oha |
| Settings | 5s duration, 128 connections, 1 runs |
| Runtimes | Bun 1.3.1, Node 22.21.0, Deno 2.5.4 |

Load Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 3.10GHz (4 cores) |
| Memory | 15GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |


<!-- END BENCHMARK MULTI RESULTS -->
