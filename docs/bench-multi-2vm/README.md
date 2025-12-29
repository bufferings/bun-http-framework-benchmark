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
| bun     | elysia@1.4.15 |     56,947 |       71,605 |       60,294 |       46,765 |       44,519 |       70,827 |       70,640 |       60,074 |       48,175 |       46,661 |       49,909 |
| deno    | hono@4.11.3 |     44,989 |       43,107 |       55,646 |       40,489 |       30,246 |       55,925 |       57,226 |       54,947 |       40,287 |       31,357 |       40,661 |
| bun     | hono@4.11.3 |     39,738 |       43,254 |       42,728 |       37,895 |       33,132 |       43,348 |       44,181 |       42,114 |       38,121 |       34,122 |       38,487 |
| node    | fastify@5.6.1 |     38,379 |       48,552 |       47,089 |       28,555 |       28,415 |       47,867 |       48,558 |       48,212 |       28,920 |       28,333 |       29,291 |
| node    | hono@4.11.3 |     25,500 |       36,596 |       35,381 |       16,273 |       14,909 |       33,744 |       36,277 |       34,087 |       16,682 |       14,631 |       16,423 |


### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T11:02:59.504Z |
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
