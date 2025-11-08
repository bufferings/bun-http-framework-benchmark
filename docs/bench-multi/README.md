## Multi-Endpoint Benchmark Results

Benchmark results for HTTP frameworks with 10 REST API endpoints.

### Endpoints

| # | Method | Path           | Validation              |
| - | ------ | -------------- | ----------------------- |
| ① | GET    | /api/users/:id | UUID param              |
| ② | GET    | /api/users     |                         |
| ③ | POST   | /api/users     | Body                    |
| ④ | PUT    | /api/users/:id | UUID param + body       |
| ⑤ | DELETE | /api/users/:id | UUID param              |
| ⑥ | GET    | /api/posts/:id | Numeric ID param        |
| ⑦ | GET    | /api/posts     |                         |
| ⑧ | POST   | /api/posts     | Body                    |
| ⑨ | PUT    | /api/posts/:id | Numeric ID param + body |
| ⑩ | POST   | /api/comments  | Body                    |

### Results (req/s)

| Runtime | Framework     |      ① |      ② |      ③ |      ④ |      ⑤ |      ⑥ |      ⑦ |      ⑧ |      ⑨ |      ⑩ |    Avg |
| ------- | ------------- | -----: | -----: | -----: | -----: | -----: | -----: | -----: | -----: | -----: | -----: | -----: |
| bun     | elysia@1.4.13 | 58,970 | 43,364 | 38,163 | 27,909 | 67,746 | 64,440 | 49,217 | 35,680 | 27,410 | 38,678 | 45,158 |
| deno    | kori@0.3.4    | 28,304 | 35,852 | 27,194 | 20,377 | 38,001 | 39,641 | 38,290 | 28,160 | 20,526 | 26,362 | 30,271 |
| deno    | hono@4.10.2   | 26,325 | 36,200 | 28,035 | 22,443 | 36,303 | 39,216 | 35,988 | 26,913 | 21,949 | 28,823 | 30,219 |
| bun     | hono@4.10.2   | 31,098 | 30,653 | 26,368 | 20,511 | 34,655 | 33,050 | 32,463 | 24,713 | 22,029 | 26,770 | 28,231 |
| bun     | kori@0.3.4    | 33,279 | 30,869 | 22,918 | 20,302 | 32,289 | 31,762 | 29,365 | 22,654 | 20,220 | 25,113 | 26,877 |
| node    | fastify@5.3.2 | 16,745 | 16,932 | 10,628 | 10,874 | 18,177 | 17,212 | 17,464 | 11,308 | 10,662 | 10,954 | 14,096 |
| node    | hono@4.10.2   | 13,686 | 12,970 |  6,667 |  6,634 | 12,962 | 13,964 | 13,962 |  7,138 |  6,872 |  7,332 | 10,219 |
| node    | kori@0.3.4    | 10,933 | 10,986 |  6,655 |  6,808 |  8,697 | 10,326 | 11,055 |  7,032 |  6,928 |  7,318 |  8,674 |
| node    | express@5.1.0 |  5,833 |  5,694 |  5,008 |  4,969 |  6,053 |  6,106 |  6,086 |  5,008 |  5,049 |  5,154 |  5,496 |

### Relative Performance (%)

Overall comparison normalized to percentages. The fastest framework for each
endpoint = 100%.

![Relative Performance](./chart-relative.svg)

### Absolute Performance (req/s)

Shows the actual requests per second for each framework across all endpoints.

![Absolute Performance](./chart-absolute.svg)

### Benchmark Environment

| Item     | Value                                |
| -------- | ------------------------------------ |
| Date     | 2025-11-07T17:34:57.835Z             |
| Tool     | oha                                  |
| Settings | 5s duration, 128 connections, 1 runs |
| Runtimes | Bun 1.3.1, Node 22.21.1, Deno 2.5.6  |

Machine:

| Item     | Value                                     |
| -------- | ----------------------------------------- |
| Platform | linux                                     |
| OS       | linux 6.11.0-1018-azure                   |
| CPU      | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory   | 15.6GB                                    |
