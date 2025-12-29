## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.19  |    280,773 |     76,771 |     59,171 |     46,537 |     44,343 |     47,076 |     43,557 |
| deno    | hono@4.11.3    |    108,963 |     65,359 |     47,332 |     41,861 |     42,635 |     39,726 |         - |
| deno    | kori@0.3.6     |     92,505 |     76,569 |     51,889 |         - |         - |         - |         - |
| bun     | hono@4.11.3    |     69,633 |     58,699 |     48,391 |     41,995 |     39,813 |     39,855 |         - |
| bun     | kori@0.3.6     |     64,900 |     57,537 |     55,624 |         - |         - |         - |         - |
| node    | fastify@5.6.2  |     57,234 |     61,635 |     35,953 |         - |         - |         - |         - |
| node    | hono@4.11.3    |     55,274 |     47,341 |     19,549 |     17,382 |     17,276 |     19,202 |         - |
| node    | kori@0.3.6     |     48,230 |     43,592 |     20,060 |         - |         - |         - |         - |
| node    | express@5.2.1  |     14,666 |     14,025 |     11,031 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T13:23:15.328Z |
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
