## Single-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 1 endpoint per app instance.

### Results (req/s)

| Runtime | Framework      | ping      | query     | body      | zod       | valibot   | arktype   | elysia-t  |
|---------|----------------|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|-----------:|
| bun     | elysia@1.4.15  |    292,783 |     72,207 |     63,740 |     49,783 |     47,789 |     47,777 |     44,805 |
| deno    | hono@4.10.4    |    103,452 |     68,304 |     47,821 |     41,262 |     39,975 |     42,551 |         - |
| deno    | kori@0.3.5     |     90,189 |     79,168 |     53,268 |     39,681 |     38,443 |     38,047 |         - |
| bun     | hono@4.10.4    |     79,767 |     54,238 |     51,875 |     41,277 |     39,418 |     41,092 |         - |
| bun     | kori@0.3.5     |     73,512 |     55,118 |     54,875 |     36,821 |     36,772 |     36,601 |         - |
| node    | fastify@5.6.1  |     62,068 |     55,568 |     33,041 |         - |         - |         - |         - |
| node    | hono@4.10.4    |     60,123 |     46,540 |     19,541 |     18,378 |     16,754 |     18,743 |         - |
| node    | kori@0.3.5     |     43,802 |     43,547 |     19,571 |     17,163 |     16,929 |     16,673 |         - |
| node    | express@5.1.0  |     14,928 |     13,951 |     10,991 |         - |         - |         - |         - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item | Value |
|---|---|
| Date | 2025-11-29T10:42:30.625Z |
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
