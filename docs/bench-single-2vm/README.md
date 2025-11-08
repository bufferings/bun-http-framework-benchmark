## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process (1 endpoint per app instance).

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.13  |     73,062 |     56,444 |     46,801 |     32,317 |     33,334 |     32,639 |     30,854 |
| deno    | hono@4.10.2    |     66,161 |     46,016 |     33,481 |     25,819 |     27,020 |     29,029 |         - |
| deno    | kori@0.3.4     |     62,504 |     54,692 |     34,278 |     26,070 |     26,680 |     26,607 |         - |
| bun     | hono@4.10.2    |     58,490 |     43,244 |     36,095 |     26,652 |     26,727 |     26,890 |         - |
| bun     | kori@0.3.4     |     58,176 |     48,301 |     41,673 |     23,316 |     23,054 |     23,160 |         - |
| node    | fastify@5.3.2  |     30,417 |     27,962 |     20,000 |         - |         - |         - |         - |
| node    | hono@4.10.2    |     25,793 |     22,144 |      8,971 |      8,240 |      8,133 |      8,137 |         - |
| node    | kori@0.3.4     |     25,544 |     21,891 |      9,455 |      7,758 |      7,795 |      7,620 |         - |
| node    | express@5.1.0  |      6,658 |      6,194 |      4,530 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T06:10:43.604Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 run |
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
