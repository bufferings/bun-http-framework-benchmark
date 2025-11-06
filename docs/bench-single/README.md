## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |    124,439 |     59,564 |     47,579 |     31,539 |     32,439 |     34,006 |
| deno    | hono@4.10.2    |     68,801 |     40,421 |     32,041 |     28,787 |     26,139 |     28,086 |
| bun     | hono@4.10.2    |     68,730 |     50,326 |     38,380 |     26,798 |     27,233 |     27,653 |
| bun     | kori@0.3.4     |     66,573 |     51,655 |     47,816 |     23,511 |     22,583 |     23,338 |
| deno    | kori@0.3.4     |     56,903 |     51,607 |     36,837 |     28,160 |     28,299 |     28,497 |
| node    | fastify@5.3.2  |     26,471 |     26,102 |     12,863 |         0 |         0 |         0 |
| node    | hono@4.10.2    |     22,107 |     19,240 |      8,031 |      7,538 |      7,508 |      7,489 |
| node    | kori@0.3.4     |     19,956 |     17,670 |      8,661 |      7,730 |      7,677 |      7,768 |
| node    | express@5.1.0  |      7,371 |      6,893 |      5,166 |         0 |         0 |         0 |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-06T18:49:08.052Z |
| Tool | oha |
| Settings | 30s duration, 128 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15.6GB |
