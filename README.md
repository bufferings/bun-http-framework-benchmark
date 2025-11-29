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
| bun     | elysia@1.4.15  |    292,783 |     72,207 |     63,740 |     49,783 |     47,789 |     47,777 |     44,805 |
| deno    | hono@4.10.4    |    103,452 |     68,304 |     47,821 |     41,262 |     39,975 |     42,551 |         - |
| deno    | kori@0.3.5     |     90,189 |     79,168 |     53,268 |     39,681 |     38,443 |     38,047 |         - |
| bun     | hono@4.10.4    |     79,767 |     54,238 |     51,875 |     41,277 |     39,418 |     41,092 |         - |
| bun     | kori@0.3.5     |     73,512 |     55,118 |     54,875 |     36,821 |     36,772 |     36,601 |         - |
| node    | fastify@5.6.1  |     62,068 |     55,568 |     33,041 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     60,123 |     46,540 |     19,541 |     18,378 |     16,754 |     18,743 |         - |
| node    | kori@0.3.5     |     43,802 |     43,547 |     19,571 |     17,163 |     16,929 |     16,673 |         - |
| node    | express@5.1.0  |     14,928 |     13,951 |     10,991 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-29T10:42:30.625Z |
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
| bun     | elysia@1.4.15 |     54,790 |       70,050 |       57,932 |       44,456 |       43,075 |       69,463 |       70,067 |       57,311 |       45,188 |       43,758 |       46,600 |
| deno    | kori@0.3.4 |     47,199 |       46,080 |       59,239 |       40,063 |       30,549 |       60,560 |       62,094 |       60,570 |       40,493 |       31,748 |       40,595 |
| deno    | hono@4.10.4 |     46,230 |       44,774 |       57,603 |       41,055 |       30,505 |       57,367 |       58,976 |       57,276 |       41,205 |       31,661 |       41,883 |
| bun     | hono@4.10.4 |     41,618 |       45,340 |       45,374 |       39,937 |       34,483 |       44,890 |       46,449 |       44,152 |       39,989 |       35,572 |       39,991 |
| node    | fastify@5.6.1 |     39,860 |       50,679 |       49,881 |       29,532 |       29,113 |       51,420 |       51,829 |       50,234 |       28,577 |       28,258 |       29,078 |
| bun     | kori@0.3.4 |     39,281 |       43,705 |       43,405 |       35,837 |       32,454 |       43,139 |       44,163 |       42,777 |       36,541 |       33,939 |       36,847 |
| node    | hono@4.10.4 |     26,003 |       38,991 |       36,905 |       17,803 |       15,780 |       35,951 |       35,000 |       33,150 |       15,684 |       14,774 |       15,988 |
| node    | kori@0.3.4 |     21,308 |       27,314 |       25,965 |       17,631 |       16,409 |       22,206 |       26,429 |       25,789 |       17,515 |       16,187 |       17,630 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T14:50:10.007Z |
| Tool | oha |
| Settings | 30s duration, 500 connections, 3 runs |
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
