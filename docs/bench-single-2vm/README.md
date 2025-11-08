## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process (1 endpoint per app instance).

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |    101,725 |     50,909 |     37,230 |     30,313 |     27,076 |     27,514 |     26,207 |
| deno    | hono@4.10.2    |     63,451 |     40,590 |     29,791 |     25,025 |     24,715 |     25,358 |         - |
| deno    | kori@0.3.4     |     56,908 |     44,923 |     36,654 |     26,357 |     23,340 |     25,440 |         - |
| bun     | hono@4.10.2    |     49,470 |     34,425 |     31,587 |     22,870 |     22,920 |     22,964 |         - |
| bun     | kori@0.3.4     |     47,485 |     37,593 |     34,679 |     19,862 |     20,466 |     20,520 |         - |
| node    | fastify@5.3.2  |     26,553 |     24,859 |     17,781 |         - |         - |         - |         - |
| node    | hono@4.10.2    |     23,170 |     20,608 |      8,642 |      7,691 |      7,905 |      7,670 |         - |
| node    | kori@0.3.4     |     21,124 |     19,787 |      8,950 |      7,323 |      7,569 |      7,362 |         - |
| node    | express@5.1.0  |      6,322 |      6,014 |      4,315 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T03:06:51.423Z |
| Tool | oha |
| Settings | 5s duration, 128 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.0, Deno 2.5.4 |

Load Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 3.10GHz (4 cores) |
| Memory | 15GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Intel(R) Xeon(R) CPU @ 2.80GHz (2 cores) |
| Memory | 7GB |
