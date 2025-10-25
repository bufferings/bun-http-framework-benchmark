# Kori Framework Benchmarks

> This repository is based on [SaltyAom/bun-http-framework-benchmark](https://github.com/SaltyAom/bun-http-framework-benchmark), adapted for Kori framework development.

Performance benchmarks for [Kori](https://github.com/bufferings/kori) across Bun, Node.js, and Deno runtimes.

Kori uses Hono's router internally, aiming to stay within ~10% overhead.

## Benchmarks

### Basic Benchmarks
- **Ping** - `GET /` returns "Hi" (text/plain)
- **Query** - `GET /id/:id?name=bun` extracts params and query (returns "1 bun")
- **Body** - `POST /json` parses and mirrors JSON body

### Validation Benchmarks
- **Zod** - Request body validation using Zod schema
- **Valibot** - Request body validation using Valibot schema
- **ArkType** - Request body validation using ArkType schema

## Prerequisites

- [bombardier](https://github.com/codesenberg/bombardier) - HTTP benchmarking tool
- Bun, Node.js, and/or Deno runtimes

## Usage

```bash
# Run all benchmarks
bun run benchmark

# Run specific frameworks (use runtime/framework format)
bun bench.ts bun/kori node/kori

# Custom settings
bun bench.ts bun/kori --time=10 --connections=64 --runs=3
```

<!-- START BENCHMARK RESULTS -->

## Latest Benchmark Results

Generated on 2025-10-25


### Basic Benchmarks

| Runtime | Framework        |    Average |       Ping |      Query |       Body |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| bun     | elysia           |   54293.51 |   83963.41 |   44630.27 |   34286.85 |
| deno    | kori@0.3.3       |   42274.86 |   47225.56 |   43718.19 |   35880.83 |
| deno    | hono@4.10.2      |   40760.91 |   51426.25 |   37954.35 |   32902.12 |
| bun     | hono@4.10.2      |   36969.11 |   50662.74 |   32161.81 |   28082.78 |
| bun     | kori@0.3.3       |   36123.36 |   47617.24 |   30819.52 |   29933.32 |
| node    | fastify@5.3.2    |   19207.33 |   23694.01 |   22258.57 |   11669.40 |
| node    | hono@4.10.2      |   14428.94 |   20669.28 |   16930.25 |    5687.30 |
| node    | kori@0.3.3       |   13128.23 |   17132.60 |   15713.44 |    6538.65 |
| node    | express@5.1.0    |    5792.24 |    5779.97 |    5871.95 |    5724.80 |

### Validation Benchmarks

| Runtime | Framework        |    Average |        Zod |    Valibot |    ArkType |
| ------- | ---------------- | ---------: | ---------: | ---------: | ---------: |
| deno    | hono@4.10.2      |   24650.92 |   18052.57 |   32215.73 |   23684.47 |
| deno    | kori@0.3.3       |   24144.21 |   23878.37 |   24277.58 |   24276.68 |
| bun     | hono@4.10.2      |   19567.18 |   18331.66 |   26253.38 |   14116.49 |
| bun     | elysia           |   18428.30 |   16249.51 |   23557.41 |   15477.99 |
| bun     | kori@0.3.3       |   12363.07 |   12151.44 |   12461.12 |   12476.64 |
| node    | hono@4.10.2      |    8750.54 |    7294.58 |   10751.45 |    8205.58 |
| node    | kori@0.3.3       |    5247.32 |    5077.51 |    5316.08 |    5348.37 |

### Benchmark Environment

| Item | Value |
|---|---|
| Platform | GitHub Actions (ubuntu-latest) |
| OS | Ubuntu 24.04.3 LTS |
| CPU | AMD EPYC 7763 64-Core Processor (4 cores) |
| Memory | 15Gi |
| Runtimes | Bun 1.3.1, Node.js 22.20.0, Deno 2.5.4 |
| Configuration | 5s duration, 128 connections, 1 run(s) |

<!-- END BENCHMARK RESULTS -->
