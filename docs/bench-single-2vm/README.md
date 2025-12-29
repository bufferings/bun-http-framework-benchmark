## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.15  |    290,456 |     71,346 |     61,627 |     49,371 |     45,365 |     47,172 |     44,879 |
| deno    | hono@4.11.3    |    105,376 |     67,246 |     47,675 |     42,234 |     41,453 |     42,324 |         - |
| deno    | kori@0.3.6     |     91,607 |     79,014 |     51,668 |         - |         - |         - |         - |
| bun     | hono@4.11.3    |     77,416 |     55,821 |     51,749 |     41,360 |     41,801 |     40,771 |         - |
| bun     | kori@0.3.6     |     69,025 |     56,374 |     55,639 |         - |         - |         - |         - |
| node    | hono@4.11.3    |     58,898 |     46,158 |     19,964 |     17,228 |     17,811 |     19,209 |         - |
| node    | fastify@5.6.1  |     57,230 |     56,054 |     35,796 |         - |         - |         - |         - |
| node    | kori@0.3.6     |     54,744 |     44,047 |     20,522 |         - |         - |         - |         - |
| node    | express@5.1.0  |     14,522 |     14,175 |     11,037 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-12-29T11:06:11.168Z |
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
