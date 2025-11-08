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

## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process (1 endpoint per app instance).

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |     73,062 |     56,444 |     46,801 |     32,317 |     33,334 |     32,639 |     30,854 |
| deno    | hono@4.10.2    |     66,161 |     46,016 |     33,481 |     25,819 |     27,020 |     29,029 |         - |
| deno    | kori@0.3.4     |     62,504 |     54,692 |     34,278 |     26,070 |     26,680 |     26,607 |         - |
| bun     | hono@4.10.2    |     58,490 |     43,244 |     36,095 |     26,652 |     26,727 |     26,890 |         - |
| bun     | kori@0.3.4     |     58,176 |     48,301 |     41,673 |     23,316 |     23,054 |     23,160 |         - |
| node    | fastify@5.3.2  |     30,417 |     27,962 |     20,000 |         - |         - |         - |         - |
| node    | hono@4.10.2    |     25,793 |     22,144 |      8,971 |      8,240 |      8,133 |      8,137 |         - |
| node    | kori@0.3.4     |     25,544 |     21,891 |      9,455 |      7,758 |      7,795 |      7,620 |         - |
| node    | express@5.1.0  |      6,658 |      6,194 |      4,530 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./docs/bench-single-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./docs/bench-single-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T06:10:43.604Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.0, Deno 2.5.4 |

Load Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |


<!-- END BENCHMARK SINGLE RESULTS -->


<!-- START BENCHMARK MULTI RESULTS -->

## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints per app instance (all validation using Zod).

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

| Runtime | Framework | Avg | ①     | ②     | ③     | ④     | ⑤     | ⑥     | ⑦     | ⑧     | ⑨     | ⑩     |
|---------|-----------|-----:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| bun     | elysia@1.4.13 |     36,652 |       50,010 |       40,296 |       28,054 |       26,301 |       50,665 |       47,298 |       40,013 |       28,357 |       26,322 |       29,204 |
| deno    | kori@0.3.4 |     28,705 |       24,536 |       37,757 |       25,741 |       16,364 |       37,304 |       37,182 |       36,279 |       26,548 |       17,745 |       27,594 |
| deno    | hono@4.10.2 |     28,120 |       22,871 |       34,228 |       25,737 |       16,510 |       34,352 |       37,763 |       35,141 |       28,088 |       18,096 |       28,417 |
| bun     | hono@4.10.2 |     23,833 |       26,727 |       24,628 |       23,467 |       19,637 |       26,042 |       26,950 |       25,843 |       21,774 |       19,901 |       23,359 |
| bun     | kori@0.3.4 |     21,770 |       25,565 |       24,606 |       19,160 |       17,235 |       24,643 |       25,365 |       24,182 |       19,538 |       17,555 |       19,854 |
| node    | fastify@5.3.2 |     18,612 |       23,174 |       22,649 |       15,982 |       14,916 |       21,843 |       21,419 |       20,644 |       14,864 |       14,733 |       15,892 |
| node    | hono@4.10.2 |      8,745 |       11,552 |       10,483 |        7,504 |        6,465 |        8,498 |       11,221 |       10,373 |        7,409 |        6,439 |        7,510 |
| node    | kori@0.3.4 |      8,285 |       10,756 |       10,451 |        6,655 |        6,380 |        8,033 |       10,810 |        9,921 |        6,872 |        6,402 |        6,573 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./docs/bench-multi-2vm/chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./docs/bench-multi-2vm/chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T06:15:53.213Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 runs |
| Runtimes | Bun 1.3.1, Node 22.21.0, Deno 2.5.6 |

Load Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |


<!-- END BENCHMARK MULTI RESULTS -->
