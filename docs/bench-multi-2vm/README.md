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
| bun     | elysia@1.4.19 |     52,681 |       62,070 |       59,513 |       45,100 |       42,243 |       60,570 |       62,669 |       59,272 |       45,560 |       43,227 |       46,584 |
| deno    | kori@0.4.0 |     47,821 |       47,414 |       60,553 |       40,811 |       30,777 |       61,334 |       62,721 |       60,153 |       40,958 |       32,097 |       41,393 |
| deno    | hono@4.11.3 |     46,859 |       44,868 |       58,467 |       41,778 |       30,954 |       57,883 |       60,179 |       58,698 |       41,708 |       31,702 |       42,350 |
| bun     | hono@4.11.3 |     42,330 |       46,857 |       45,473 |       40,400 |       35,111 |       47,224 |       46,452 |       44,503 |       40,249 |       35,835 |       41,199 |
| bun     | kori@0.4.0 |     38,985 |       42,454 |       42,465 |       36,140 |       32,497 |       42,811 |       44,209 |       42,049 |       36,352 |       33,501 |       37,366 |
| node    | fastify@5.6.2 |     35,843 |       42,281 |       42,575 |       29,122 |       28,394 |       42,595 |       43,877 |       43,097 |       29,003 |       28,220 |       29,269 |
| node    | hono@4.11.3 |     27,923 |       39,999 |       38,657 |       18,552 |       16,781 |       37,413 |       39,740 |       35,927 |       17,670 |       16,498 |       17,994 |
| node    | kori@0.4.0 |     26,270 |       37,461 |       35,904 |       17,057 |       15,682 |       34,263 |       37,145 |       35,981 |       16,659 |       15,802 |       16,741 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-30T06:42:09.043Z |
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
