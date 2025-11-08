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
| bun     | elysia@1.4.13 |     35,112 |       49,843 |       35,196 |       26,623 |       24,579 |       49,790 |       49,281 |       38,341 |       26,460 |       24,507 |       26,501 |
| deno    | kori@0.3.4 |     27,248 |       22,241 |       36,458 |       24,968 |       15,748 |       35,000 |       35,414 |       36,817 |       23,495 |       16,486 |       25,854 |
| deno    | hono@4.10.2 |     25,906 |       21,202 |       30,685 |       23,569 |       15,636 |       34,455 |       34,381 |       32,446 |       24,668 |       16,843 |       25,172 |
| bun     | hono@4.10.2 |     22,946 |       25,366 |       24,786 |       21,442 |       19,110 |       25,857 |       25,406 |       23,138 |       21,851 |       19,059 |       23,441 |
| bun     | kori@0.3.4 |     21,114 |       24,074 |       24,260 |       18,795 |       18,162 |       25,518 |       23,765 |       24,417 |       18,262 |       13,886 |       19,997 |
| node    | fastify@5.3.2 |     17,982 |       21,656 |       20,538 |       14,985 |       13,389 |       22,057 |       20,012 |       21,042 |       15,358 |       14,684 |       16,098 |
| node    | hono@4.10.2 |      8,734 |       11,212 |       10,890 |        6,781 |        6,888 |        9,088 |       10,451 |       10,853 |        7,439 |        6,324 |        7,412 |
| node    | kori@0.3.4 |      8,180 |        9,974 |       10,065 |        5,936 |        6,628 |        8,549 |       10,024 |       10,450 |        6,867 |        6,600 |        6,707 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T08:53:59.327Z |
| Tool | oha |
| Settings | 5s duration, 500 connections, 1 runs |
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
