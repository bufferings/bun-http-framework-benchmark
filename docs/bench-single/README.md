## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.15  |    123,365 |     60,526 |     46,243 |     38,563 |     36,447 |     38,806 |     32,870 |
| bun     | hono@4.10.4    |     67,832 |     53,739 |     42,266 |     30,491 |     30,519 |     27,144 |         - |
| deno    | hono@4.10.4    |     66,921 |     43,643 |     36,068 |     31,140 |     29,125 |     31,866 |         - |
| bun     | kori@0.3.5     |     61,232 |     46,355 |     43,047 |     26,379 |     26,084 |     26,148 |         - |
| deno    | kori@0.3.5     |     58,465 |     50,985 |     37,548 |     30,060 |     30,059 |     29,677 |         - |
| node    | fastify@5.6.1  |     28,110 |     27,306 |     13,787 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     22,574 |     19,633 |      7,975 |      7,062 |      7,018 |      7,488 |         - |
| node    | kori@0.3.5     |     19,799 |     18,330 |      7,548 |      6,980 |      6,958 |      7,069 |         - |
| node    | express@5.1.0  |      7,273 |      6,959 |      5,297 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-29T10:46:17.044Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 run |
| Runtimes | Bun 1.3.3, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15.6GB |
