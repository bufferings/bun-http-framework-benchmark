import { Elysia } from "elysia";

new Elysia()
  .get("/:id", (c) => {
    c.set.headers["x-powered-by"] = "benchmark";
    return `${c.params.id} ${c.query.name}`;
  })
  .listen(3000);
