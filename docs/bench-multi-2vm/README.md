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
| bun     | elysia@1.4.13 |       52,598 |       41,243 |       28,546 |       26,471 |       53,201 |       54,628 |       41,347 |       29,128 |       26,503 |       31,203 |     38,487 |
| deno    | kori@0.3.4 |       26,398 |       42,094 |       28,457 |       18,671 |       42,574 |       43,687 |       42,141 |       29,484 |       19,568 |       29,817 |     32,289 |
| deno    | hono@4.10.2 |       25,104 |       38,331 |       23,350 |       18,772 |       40,272 |       41,680 |       39,518 |       29,398 |       18,765 |       29,592 |     30,478 |
| bun     | hono@4.10.2 |       28,340 |       29,058 |       23,222 |       20,875 |       27,908 |       30,278 |       26,309 |       23,278 |       20,299 |       24,350 |     25,392 |
| bun     | kori@0.3.4 |       27,498 |       26,137 |       20,660 |       18,939 |       26,717 |       27,511 |       26,317 |       20,762 |       18,901 |       21,384 |     23,483 |
| node    | fastify@5.3.2 |       24,821 |       24,645 |       17,277 |       16,576 |       25,149 |       25,194 |       24,348 |       17,719 |       16,763 |       17,887 |     21,038 |
| node    | hono@4.10.2 |       12,370 |       12,227 |        7,592 |        7,485 |        9,106 |       12,696 |       12,050 |        8,084 |        7,444 |        8,147 |      9,720 |
| node    | kori@0.3.4 |       11,826 |       12,039 |        6,862 |        7,093 |        9,705 |       10,901 |       11,990 |        7,460 |        6,926 |        7,724 |      9,253 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T02:10:00.577Z |
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
