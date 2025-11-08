## Single Process Benchmark Results

Benchmark results for HTTP frameworks running in a single process.

### Results (req/s)

| Runtime | Framework     |    ping |  query |   body |    zod | valibot | arktype | elysia-t |
| ------- | ------------- | ------: | -----: | -----: | -----: | ------: | ------: | -------: |
| bun     | elysia@1.4.13 | 113,824 | 60,920 | 40,921 | 34,260 |  35,302 |  34,148 |   31,595 |
| deno    | hono@4.10.2   |  65,747 | 42,756 | 31,162 | 30,000 |  28,486 |  27,062 |        - |
| bun     | hono@4.10.2   |  61,792 | 50,085 | 42,456 | 27,352 |  25,322 |  28,113 |        - |
| bun     | kori@0.3.4    |  58,218 | 50,747 | 49,594 | 23,253 |  23,167 |  24,636 |        - |
| deno    | kori@0.3.4    |  54,105 | 57,622 | 36,330 | 28,985 |  28,738 |  28,953 |        - |
| node    | fastify@5.3.2 |  23,163 | 23,588 | 12,962 |      - |       - |       - |        - |
| node    | kori@0.3.4    |  21,557 | 17,542 |  8,905 |  7,979 |   7,798 |   8,055 |        - |
| node    | hono@4.10.2   |  20,844 | 19,645 |  8,039 |  7,344 |   7,546 |   7,588 |        - |
| node    | express@5.1.0 |   7,639 |  6,933 |  4,957 |      - |       - |       - |        - |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework in each test
= 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all test cases.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item     | Value                               |
| -------- | ----------------------------------- |
| Date     | 2025-11-07T17:35:14.113Z            |
| Tool     | oha                                 |
| Settings | 5s duration, 128 connections, 1 run |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6 |

Machine:

| Item     | Value                                     |
| -------- | ----------------------------------------- |
| Platform | linux                                     |
| OS       | linux 6.11.0-1018-azure                   |
| CPU      | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory   | 15.6GB                                    |
