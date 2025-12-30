## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.19  |    282,461 |     77,008 |     60,504 |     48,062 |     48,006 |     47,278 |     44,058 |
| deno    | hono@4.11.3    |    102,452 |     66,572 |     47,183 |     41,251 |     39,128 |     41,496 |         - |
| deno    | kori@0.4.0     |     85,625 |     77,526 |     52,560 |     38,212 |     39,897 |     39,772 |         - |
| bun     | hono@4.11.3    |     78,709 |     58,690 |     49,244 |     41,432 |     39,342 |     39,525 |         - |
| bun     | kori@0.4.0     |     65,717 |     59,081 |     52,469 |     38,012 |     38,584 |     37,564 |         - |
| node    | fastify@5.6.2  |     65,513 |     62,494 |     35,104 |         - |         - |         - |         - |
| node    | kori@0.4.0     |     53,374 |     44,502 |     20,118 |     17,348 |     17,259 |     17,975 |         - |
| node    | hono@4.11.3    |     46,079 |     51,602 |     19,412 |     18,831 |     18,590 |     18,756 |         - |
| node    | express@5.2.1  |     14,807 |     14,624 |     11,195 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-30T06:35:32.403Z |
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
