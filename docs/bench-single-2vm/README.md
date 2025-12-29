## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.19  |    288,061 |     77,469 |     56,543 |     45,683 |     48,494 |     46,472 |     44,134 |
| deno    | hono@4.11.3    |    106,644 |     65,595 |     43,625 |     42,193 |     39,568 |     38,955 |         - |
| deno    | kori@0.3.6     |     89,210 |     77,333 |     55,007 |     38,936 |     40,222 |     39,876 |         - |
| bun     | kori@0.3.6     |     69,016 |     56,392 |     52,720 |     39,321 |     39,110 |     37,272 |         - |
| bun     | hono@4.11.3    |     67,931 |     58,812 |     50,269 |     41,801 |     40,068 |     40,286 |         - |
| node    | fastify@5.6.2  |     64,057 |     63,205 |     32,976 |         - |         - |         - |         - |
| node    | hono@4.11.3    |     61,840 |     53,629 |     20,751 |     18,476 |     18,313 |     18,802 |         - |
| node    | kori@0.3.6     |     56,404 |     47,961 |     20,406 |     18,195 |     16,734 |     18,133 |         - |
| node    | express@5.2.1  |     14,920 |     13,931 |     11,240 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T14:55:39.948Z |
| Tool | oha |
| Settings | 30s duration, 300 connections, 1 run |
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
