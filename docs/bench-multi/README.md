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

| Runtime | Framework | ①     | ②     | ③     | ④     | ⑤     | ⑥     | ⑦     | ⑧     | ⑨     | ⑩     | Avg |
|---------|-----------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|-----:|
| bun     | elysia@1.4.13 |       62,633 |       47,579 |       34,846 |       33,400 |       64,428 |       66,137 |       50,108 |       35,360 |       29,034 |       40,264 |     46,379 |
| deno    | kori@0.3.4 |       31,082 |       40,026 |       28,611 |       21,333 |       38,008 |       43,086 |       42,976 |       30,946 |       23,170 |       30,675 |     32,991 |
| deno    | hono@4.10.2 |       27,910 |       37,023 |       29,748 |       22,806 |       40,044 |       38,668 |       38,654 |       29,920 |       22,694 |       29,916 |     31,738 |
| bun     | hono@4.10.2 |       33,956 |       32,423 |       23,003 |       21,644 |       31,790 |       28,741 |       33,093 |       28,133 |       23,197 |       28,293 |     28,427 |
| bun     | kori@0.3.4 |       31,337 |       30,931 |       22,802 |       21,020 |       32,061 |       34,041 |       31,922 |       24,161 |       20,388 |       24,789 |     27,345 |
| node    | fastify@5.3.2 |       17,183 |       14,476 |       11,107 |       10,763 |       17,714 |       18,484 |       17,069 |       11,410 |       11,362 |       11,821 |     14,139 |
| node    | hono@4.10.2 |       15,170 |       14,033 |        6,944 |        6,972 |       14,503 |       14,986 |       14,303 |        7,453 |        7,058 |        7,571 |     10,899 |
| node    | kori@0.3.4 |       10,911 |       11,264 |        6,941 |        7,032 |        9,638 |       11,574 |       11,636 |        7,591 |        6,990 |        7,842 |      9,142 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T02:08:07.690Z |
| Tool | oha |
| Settings | 5s duration, 128 connections, 1 runs |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15.6GB |
