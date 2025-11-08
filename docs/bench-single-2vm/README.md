## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process (1 endpoint per app instance).

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |     80,176 |     45,547 |     35,992 |     26,970 |     26,508 |     28,023 |     25,791 |
| deno    | hono@4.10.2    |     56,584 |     37,369 |     29,733 |     24,240 |     25,272 |     26,532 |         - |
| bun     | hono@4.10.2    |     44,892 |     33,613 |     30,369 |     22,150 |     21,776 |     22,531 |         - |
| bun     | kori@0.3.4     |     42,660 |     37,271 |     35,997 |     19,589 |     18,455 |     19,090 |         - |
| deno    | kori@0.3.4     |     42,110 |     47,948 |     33,782 |     23,343 |     22,069 |     25,459 |         - |
| node    | fastify@5.3.2  |     24,573 |     23,345 |     16,067 |         - |         - |         - |         - |
| node    | hono@4.10.2    |     21,313 |     19,072 |      8,469 |      7,590 |      7,736 |      7,292 |         - |
| node    | kori@0.3.4     |     18,143 |     18,372 |      8,633 |      7,149 |      7,246 |      6,495 |         - |
| node    | express@5.1.0  |      6,064 |      5,496 |      4,191 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T04:23:08.242Z |
| Tool | oha |
| Settings | 5s duration, 300 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.0, Deno 2.5.4 |

Load Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |
