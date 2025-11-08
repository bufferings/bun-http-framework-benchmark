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

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

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
