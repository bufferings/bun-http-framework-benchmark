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

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

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
