## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process (1 endpoint per app instance).

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |    114,178 |     58,674 |     43,264 |     36,477 |     31,375 |     37,621 |     32,738 |
| deno    | hono@4.10.2    |     64,786 |     44,274 |     32,637 |     30,068 |     29,646 |     30,655 |         - |
| bun     | hono@4.10.2    |     64,669 |     46,262 |     43,412 |     26,246 |     27,720 |     28,916 |         - |
| bun     | kori@0.3.4     |     64,141 |     49,895 |     52,818 |     22,901 |     24,485 |     23,020 |         - |
| deno    | kori@0.3.4     |     57,903 |     52,073 |     37,657 |     29,169 |     30,029 |     28,815 |         - |
| node    | fastify@5.3.2  |     27,769 |     25,200 |     13,146 |         - |         - |         - |         - |
| node    | hono@4.10.2    |     22,796 |     19,403 |      7,691 |      7,306 |      7,236 |      7,418 |         - |
| node    | kori@0.3.4     |     20,401 |     18,434 |      8,720 |      7,575 |      7,532 |      7,715 |         - |
| node    | express@5.1.0  |      7,285 |      6,715 |      4,816 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T02:09:16.104Z |
| Tool | oha |
| Settings | 5s duration, 128 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15.6GB |
