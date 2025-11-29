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
| bun     | elysia@1.4.15 |     58,004 |       73,593 |       63,078 |       46,965 |       44,229 |       72,442 |       73,606 |       61,254 |       48,019 |       46,213 |       50,639 |
| deno    | kori@0.3.5 |     46,302 |       45,609 |       57,750 |       40,279 |       30,237 |       58,462 |       60,276 |       58,132 |       40,035 |       31,644 |       40,600 |
| deno    | hono@4.10.4 |     45,979 |       43,543 |       56,438 |       40,972 |       30,201 |       57,335 |       58,490 |       57,220 |       40,942 |       31,931 |       42,722 |
| bun     | hono@4.10.4 |     42,950 |       48,050 |       46,348 |       40,795 |       34,700 |       47,438 |       48,869 |       45,172 |       41,031 |       35,744 |       41,354 |
| node    | fastify@5.6.1 |     40,803 |       51,223 |       51,308 |       30,209 |       29,103 |       52,299 |       52,014 |       51,528 |       30,225 |       29,690 |       30,435 |
| bun     | kori@0.3.5 |     39,245 |       43,859 |       43,311 |       35,856 |       32,493 |       43,666 |       43,728 |       42,792 |       36,583 |       33,192 |       36,969 |
| node    | hono@4.10.4 |     27,789 |       40,182 |       38,183 |       18,470 |       16,592 |       37,283 |       38,865 |       36,197 |       17,834 |       16,451 |       17,835 |
| node    | kori@0.3.5 |     24,852 |       34,785 |       34,482 |       16,485 |       15,323 |       32,200 |       34,409 |       33,263 |       15,842 |       15,643 |       16,087 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-29T10:49:10.752Z |
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
