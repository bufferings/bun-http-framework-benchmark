import { Hono } from "hono";

const app = new Hono();
app.get("/:id", (c) => {
  c.header("x-powered-by", "benchmark");
  return c.text(`${c.req.param("id")} ${c.req.query("name")}`);
});

Deno.serve({ port: 3000 }, app.fetch);
