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
| bun     | elysia@1.4.15  |    277,749 |     68,149 |     59,915 |     47,670 |     46,920 |     46,619 |     45,643 |
| deno    | hono@4.10.4    |    105,074 |     67,773 |     43,842 |     38,332 |     40,024 |     39,785 |         - |
| deno    | kori@0.3.4     |     87,993 |     79,145 |     53,441 |     38,176 |     37,237 |     39,144 |         - |
| bun     | hono@4.10.4    |     78,667 |     58,391 |     51,437 |     40,411 |     42,017 |     41,058 |         - |
| bun     | kori@0.3.4     |     77,799 |     64,750 |     58,698 |     36,664 |     38,211 |     37,060 |         - |
| node    | fastify@5.6.1  |     55,535 |     58,771 |     34,265 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     50,147 |     40,787 |     19,417 |     17,996 |     17,793 |     18,693 |         - |
| node    | kori@0.3.4     |     48,849 |     41,855 |     22,054 |     18,369 |     17,615 |     19,852 |         - |
| node    | express@5.1.0  |     14,611 |     14,288 |     11,258 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T12:13:09.671Z |
| Tool | oha |
| Settings | 5s duration, 300 connections, 1 run |
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
| bun     | elysia@1.4.15 |     57,616 |       70,742 |       63,496 |       47,375 |       45,630 |       71,190 |       73,321 |       61,811 |       47,664 |       46,265 |       48,669 |
| deno    | kori@0.3.4 |     46,873 |       46,499 |       60,839 |       39,275 |       30,162 |       59,013 |       62,029 |       59,767 |       39,603 |       31,341 |       40,202 |
| deno    | hono@4.10.4 |     45,719 |       43,419 |       55,889 |       40,271 |       29,925 |       56,016 |       58,506 |       57,104 |       41,879 |       32,074 |       42,108 |
| node    | fastify@5.6.1 |     43,496 |       54,524 |       55,402 |       31,397 |       31,177 |       54,708 |       56,109 |       55,343 |       32,352 |       31,523 |       32,426 |
| bun     | hono@4.10.4 |     40,893 |       44,764 |       43,441 |       38,767 |       33,985 |       44,889 |       46,168 |       43,605 |       38,770 |       35,246 |       39,294 |
| bun     | kori@0.3.4 |     40,136 |       46,028 |       44,647 |       36,275 |       33,025 |       45,045 |       44,858 |       43,894 |       36,642 |       33,636 |       37,308 |
| node    | hono@4.10.4 |     28,161 |       39,820 |       37,964 |       17,844 |       17,195 |       38,158 |       40,501 |       37,229 |       17,553 |       16,965 |       18,385 |
| node    | kori@0.3.4 |     22,744 |       28,839 |       28,481 |       18,568 |       17,767 |       22,497 |       29,661 |       29,495 |       18,723 |       17,624 |       15,782 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T12:05:34.118Z |
| Tool | oha |
| Settings | 5s duration, 300 connections, 1 runs |
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
