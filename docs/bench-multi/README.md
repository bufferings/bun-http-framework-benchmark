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
| bun     | elysia@1.4.13 |       57,346 |       42,216 |       31,171 |       32,819 |       70,642 |       61,544 |       47,297 |       30,232 |       30,415 |       37,528 |     44,121 |
| deno    | hono@4.10.2 |       30,737 |       38,977 |       29,012 |       21,943 |       41,593 |       38,654 |       37,253 |       29,578 |       22,731 |       29,392 |     31,987 |
| bun     | hono@4.10.2 |       34,833 |       33,247 |       26,648 |       23,149 |       33,418 |       27,842 |       31,968 |       25,814 |       20,952 |       25,726 |     28,360 |
| bun     | kori@0.3.4 |       32,047 |       26,315 |       21,024 |       19,743 |       28,288 |       27,210 |       28,649 |       22,980 |       20,301 |       23,956 |     25,051 |
| node    | fastify@5.3.2 |       22,041 |       20,487 |       11,948 |       12,344 |       19,646 |       21,731 |       20,540 |       12,441 |       12,765 |       13,240 |     16,718 |
| node    | hono@4.10.2 |       14,285 |       13,960 |        6,814 |        6,946 |       14,349 |       14,877 |       13,832 |        7,287 |        7,022 |        7,560 |     10,693 |
| node    | express@5.1.0 |        5,727 |        6,064 |        5,181 |        5,101 |        6,218 |        6,152 |        6,215 |        5,292 |        5,141 |        5,175 |      5,627 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-07T17:09:20.758Z |
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
