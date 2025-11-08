## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.15  |    277,749 |     68,149 |     59,915 |     47,670 |     46,920 |     46,619 |     45,643 |
| deno    | hono@4.10.4    |    105,074 |     67,773 |     43,842 |     38,332 |     40,024 |     39,785 |         - |
| deno    | kori@0.3.4     |     87,993 |     79,145 |     53,441 |     38,176 |     37,237 |     39,144 |         - |
| bun     | hono@4.10.4    |     78,667 |     58,391 |     51,437 |     40,411 |     42,017 |     41,058 |         - |
| bun     | kori@0.3.4     |     77,799 |     64,750 |     58,698 |     36,664 |     38,211 |     37,060 |         - |
| node    | fastify@5.6.1  |     55,535 |     58,771 |     34,265 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     50,147 |     40,787 |     19,417 |     17,996 |     17,793 |     18,693 |         - |
| node    | kori@0.3.4     |     48,849 |     41,855 |     22,054 |     18,369 |     17,615 |     19,852 |         - |
| node    | express@5.1.0  |     14,611 |     14,288 |     11,258 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-08T12:13:09.671Z |
| Tool | oha |
| Settings | 5s duration, 300 connections, 1 run |
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
