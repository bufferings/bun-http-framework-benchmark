import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/:id", (c) => {
  c.header("x-powered-by", "benchmark");
  return c.text(`${c.req.param("id")} ${c.req.query("name")}`);
});

serve({ fetch: app.fetch, port: 3000 });
