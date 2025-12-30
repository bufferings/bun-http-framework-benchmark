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
| bun     | elysia@1.4.19 |     52,681 |       62,070 |       59,513 |       45,100 |       42,243 |       60,570 |       62,669 |       59,272 |       45,560 |       43,227 |       46,584 |
| deno    | kori@0.4.0 |     47,821 |       47,414 |       60,553 |       40,811 |       30,777 |       61,334 |       62,721 |       60,153 |       40,958 |       32,097 |       41,393 |
| deno    | hono@4.11.3 |     46,859 |       44,868 |       58,467 |       41,778 |       30,954 |       57,883 |       60,179 |       58,698 |       41,708 |       31,702 |       42,350 |
| bun     | hono@4.11.3 |     42,330 |       46,857 |       45,473 |       40,400 |       35,111 |       47,224 |       46,452 |       44,503 |       40,249 |       35,835 |       41,199 |
| bun     | kori@0.4.0 |     38,985 |       42,454 |       42,465 |       36,140 |       32,497 |       42,811 |       44,209 |       42,049 |       36,352 |       33,501 |       37,366 |
| node    | fastify@5.6.2 |     35,843 |       42,281 |       42,575 |       29,122 |       28,394 |       42,595 |       43,877 |       43,097 |       29,003 |       28,220 |       29,269 |
| node    | hono@4.11.3 |     27,923 |       39,999 |       38,657 |       18,552 |       16,781 |       37,413 |       39,740 |       35,927 |       17,670 |       16,498 |       17,994 |
| node    | kori@0.4.0 |     26,270 |       37,461 |       35,904 |       17,057 |       15,682 |       34,263 |       37,145 |       35,981 |       16,659 |       15,802 |       16,741 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-30T06:42:09.043Z |
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
