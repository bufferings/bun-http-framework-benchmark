## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |    123,433 |     65,478 |     54,501 |     36,210 |     36,970 |     34,840 |
| bun     | hono@4.10.2    |     74,040 |     52,675 |     40,785 |     29,986 |     28,743 |     28,886 |
| bun     | kori@0.3.4     |     67,930 |     53,269 |     46,984 |     24,967 |     25,647 |     24,991 |
| deno    | hono@4.10.2    |     66,508 |     43,592 |     33,588 |     31,314 |     28,960 |     30,737 |
| deno    | kori@0.3.4     |     57,501 |     52,720 |     40,010 |     30,924 |     30,692 |     30,089 |
| node    | fastify@5.3.2  |     26,714 |     24,022 |     13,437 |         0 |         0 |         0 |
| node    | hono@4.10.2    |     22,689 |     19,128 |      8,144 |      7,624 |      7,419 |      7,592 |
| node    | kori@0.3.4     |     20,734 |     18,485 |      9,143 |      7,836 |      7,855 |      7,923 |
| node    | express@5.1.0  |      7,584 |      7,113 |      5,334 |         0 |         0 |         0 |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-07T13:42:47.644Z |
| Tool | oha |
| Settings | 30s duration, 200 connections, 3 runs |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item | Value |
|---|---|
| Platform | linux |
| OS | linux 6.11.0-1018-azure |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15.6GB |
