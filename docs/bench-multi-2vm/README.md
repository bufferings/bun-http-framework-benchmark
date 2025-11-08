## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints.

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
| bun     | elysia@1.4.13 |       58,178 |       38,343 |       32,507 |       29,731 |       57,856 |       59,605 |       41,712 |       31,872 |       28,571 |       33,168 |     41,154 |
| deno    | kori@0.3.4 |       25,900 |       41,293 |       28,353 |       18,685 |       41,553 |       42,541 |       41,443 |       29,107 |       19,048 |       29,440 |     31,736 |
| deno    | hono@4.10.2 |       25,059 |       39,560 |       29,472 |       18,527 |       40,058 |       41,638 |       39,800 |       29,530 |       15,532 |       29,725 |     30,890 |
| bun     | hono@4.10.2 |       29,514 |       28,069 |       25,285 |       21,070 |       29,055 |       29,881 |       28,191 |       24,552 |       21,297 |       25,266 |     26,218 |
| bun     | kori@0.3.4 |       27,694 |       25,958 |       21,133 |       19,459 |       27,950 |       30,172 |       27,494 |       21,256 |       19,761 |       22,175 |     24,305 |
| node    | fastify@5.3.2 |       25,696 |       25,939 |       18,307 |       17,464 |       25,869 |       26,548 |       26,468 |       19,249 |       18,693 |       18,989 |     22,322 |
| node    | hono@4.10.2 |       12,544 |       12,383 |        7,633 |        7,581 |        9,163 |       12,855 |       12,232 |        8,287 |        7,592 |        8,406 |      9,868 |
| node    | kori@0.3.4 |       12,040 |       12,121 |        7,101 |        7,252 |        8,953 |       12,224 |        9,857 |        7,561 |        7,230 |        7,913 |      9,225 |
| node    | express@5.1.0 |        5,534 |        5,463 |        4,306 |        4,374 |        5,438 |        5,483 |        5,438 |        4,414 |        4,335 |        4,489 |      4,927 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T01:29:34.697Z |
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
