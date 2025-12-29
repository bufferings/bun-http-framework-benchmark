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
| bun     | elysia@1.4.19  |    280,773 |     76,771 |     59,171 |     46,537 |     44,343 |     47,076 |     43,557 |
| deno    | hono@4.11.3    |    108,963 |     65,359 |     47,332 |     41,861 |     42,635 |     39,726 |         - |
| deno    | kori@0.3.6     |     92,505 |     76,569 |     51,889 |         - |         - |         - |         - |
| bun     | hono@4.11.3    |     69,633 |     58,699 |     48,391 |     41,995 |     39,813 |     39,855 |         - |
| bun     | kori@0.3.6     |     64,900 |     57,537 |     55,624 |         - |         - |         - |         - |
| node    | fastify@5.6.2  |     57,234 |     61,635 |     35,953 |         - |         - |         - |         - |
| node    | hono@4.11.3    |     55,274 |     47,341 |     19,549 |     17,382 |     17,276 |     19,202 |         - |
| node    | kori@0.3.6     |     48,230 |     43,592 |     20,060 |         - |         - |         - |         - |
| node    | express@5.2.1  |     14,666 |     14,025 |     11,031 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T13:23:15.328Z |
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
| bun     | elysia@1.4.15 |     56,947 |       71,605 |       60,294 |       46,765 |       44,519 |       70,827 |       70,640 |       60,074 |       48,175 |       46,661 |       49,909 |
| deno    | hono@4.11.3 |     44,989 |       43,107 |       55,646 |       40,489 |       30,246 |       55,925 |       57,226 |       54,947 |       40,287 |       31,357 |       40,661 |
| bun     | hono@4.11.3 |     39,738 |       43,254 |       42,728 |       37,895 |       33,132 |       43,348 |       44,181 |       42,114 |       38,121 |       34,122 |       38,487 |
| node    | fastify@5.6.1 |     38,379 |       48,552 |       47,089 |       28,555 |       28,415 |       47,867 |       48,558 |       48,212 |       28,920 |       28,333 |       29,291 |
| node    | hono@4.11.3 |     25,500 |       36,596 |       35,381 |       16,273 |       14,909 |       33,744 |       36,277 |       34,087 |       16,682 |       14,631 |       16,423 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T11:02:59.504Z |
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
