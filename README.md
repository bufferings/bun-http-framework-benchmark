# Kori Framework Benchmarks

> This repository is based on
> [SaltyAom/bun-http-framework-benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark),
> adapted for Kori framework development.

Performance benchmarks for [Kori](https://github.com/bufferings/kori) across
Bun, Node.js, and Deno runtimes.

Kori uses Hono's router internally, aiming to stay within ~10% overhead.

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

## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.19  |    282,461 |     77,008 |     60,504 |     48,062 |     48,006 |     47,278 |     44,058 |
| deno    | hono@4.11.3    |    102,452 |     66,572 |     47,183 |     41,251 |     39,128 |     41,496 |         - |
| deno    | kori@0.4.0     |     85,625 |     77,526 |     52,560 |     38,212 |     39,897 |     39,772 |         - |
| bun     | hono@4.11.3    |     78,709 |     58,690 |     49,244 |     41,432 |     39,342 |     39,525 |         - |
| bun     | kori@0.4.0     |     65,717 |     59,081 |     52,469 |     38,012 |     38,584 |     37,564 |         - |
| node    | fastify@5.6.2  |     65,513 |     62,494 |     35,104 |         - |         - |         - |         - |
| node    | kori@0.4.0     |     53,374 |     44,502 |     20,118 |     17,348 |     17,259 |     17,975 |         - |
| node    | hono@4.11.3    |     46,079 |     51,602 |     19,412 |     18,831 |     18,590 |     18,756 |         - |
| node    | express@5.2.1  |     14,807 |     14,624 |     11,195 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-30T06:35:32.403Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 run |
| Runtimes | Bun 1.3.2, Node 22.21.0, Deno 2.5.6 |

Load Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |


<!-- END BENCHMARK SINGLE RESULTS -->


<!-- START BENCHMARK MULTI RESULTS -->

## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints per app instance (all validation using Zod).

### Endpoints

| # | Method | Path | Validation |
|---|--------|------|------------|
| ① | GET    | /api/users/:id            | UUID param |
| ② | GET    | /api/users                | Query params (page, limit) |
| ③ | POST   | /api/users                | Body |
| ④ | PUT    | /api/users/:id            | UUID param + body |
| ⑤ | DELETE | /api/users/:id            | UUID param |
| ⑥ | GET    | /api/posts/:id            | Numeric ID param |
| ⑦ | GET    | /api/posts                | Query params (userId, page) |
| ⑧ | POST   | /api/posts                | Body |
| ⑨ | PUT    | /api/posts/:id            | Numeric ID param + body |
| ⑩ | POST   | /api/comments             | Body |


### Results (req/s)

| Runtime | Framework | Avg | ①     | ②     | ③     | ④     | ⑤     | ⑥     | ⑦     | ⑧     | ⑨     | ⑩     |
|---------|-----------|-----:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| bun     | elysia@1.4.19 |     53,615 |       65,924 |       61,820 |       46,601 |       40,873 |       65,655 |       61,984 |       58,599 |       44,464 |       43,873 |       46,358 |
| deno    | hono@4.11.3 |     47,486 |       45,026 |       59,363 |       41,983 |       31,206 |       59,500 |       61,773 |       59,530 |       41,671 |       32,309 |       42,495 |
| deno    | kori@0.3.6 |     46,054 |       44,939 |       57,080 |       39,996 |       30,380 |       58,797 |       60,245 |       57,315 |       39,958 |       31,558 |       40,274 |
| node    | fastify@5.6.2 |     44,750 |       56,820 |       56,707 |       32,462 |       31,391 |       58,834 |       58,329 |       56,783 |       32,779 |       31,086 |       32,315 |
| bun     | hono@4.11.3 |     43,191 |       47,734 |       46,647 |       41,615 |       35,171 |       47,996 |       48,049 |       45,235 |       41,415 |       36,069 |       41,979 |
| bun     | kori@0.3.6 |     39,095 |       43,278 |       43,694 |       35,737 |       32,261 |       43,001 |       44,252 |       42,613 |       36,320 |       33,359 |       36,438 |
| node    | hono@4.11.3 |     28,199 |       40,587 |       38,713 |       18,341 |       16,905 |       38,242 |       39,942 |       37,003 |       18,218 |       16,463 |       17,570 |
| node    | kori@0.3.6 |     26,186 |       37,888 |       37,221 |       17,018 |       16,049 |       34,727 |       37,829 |       34,413 |       15,715 |       15,011 |       15,989 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T13:35:01.037Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 runs |
| Runtimes | Bun 1.3.2, Node 22.21.0, Deno 2.5.6 |

Load Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |


<!-- END BENCHMARK MULTI RESULTS -->
