## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.15  |    262,874 |     68,157 |     66,073 |     50,063 |     47,849 |     49,988 |     45,280 |
| deno    | hono@4.10.4    |    109,988 |     69,248 |     47,712 |     39,662 |     41,646 |     41,098 |         - |
| deno    | kori@0.3.4     |     95,314 |     81,964 |     55,168 |     40,720 |     41,061 |     41,706 |         - |
| bun     | hono@4.10.4    |     85,158 |     63,098 |     50,551 |     43,158 |     42,973 |     42,272 |         - |
| bun     | kori@0.3.4     |     74,613 |     62,301 |     58,756 |     38,383 |     37,140 |     37,936 |         - |
| node    | fastify@5.6.1  |     71,663 |     65,422 |     33,421 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     66,110 |     57,674 |     19,748 |     18,060 |     17,658 |     17,937 |         - |
| node    | kori@0.3.4     |     60,881 |     55,401 |     22,714 |     18,324 |     18,591 |     19,173 |         - |
| node    | express@5.1.0  |     14,677 |     14,012 |     11,051 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T14:12:44.084Z |
| Tool | oha |
| Settings | 30s duration, 500 connections, 3 runs |
| Runtimes | Bun 1.3.2, Node 22.21.0, Deno 2.5.6 |

Load Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |

Target Machine:

| Item | Value |
|---|---|
| Platform | GCP (2-VM) |
| OS | Debian GNU/Linux 12 (bookworm) |
| CPU | Neoverse-V2 (2 cores) |
| Memory | 7GB |
